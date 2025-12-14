/**
 * AI Debug Assistant Service
 * Uses OpenAI GPT to analyze ERROR logs and provide:
 * - Root cause analysis
 * - Explanation
 * - Suggested fixes
 * 
 * Caches responses to avoid repeated API calls for similar errors
 */

const OpenAI = require('openai');
const Log = require('../models/Log');

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
}) : null;

/**
 * Analyzes an error log using AI
 * Returns cached result if available
 */
const analyzeError = async (logId) => {
    try {
        const log = await Log.findById(logId);
        
        if (!log || log.level !== 'ERROR') {
            return null;
        }
        
        // Check if already analyzed
        if (log.aiAnalysis && log.aiAnalysis.rootCause) {
            return {
                ...log.aiAnalysis,
                cached: true
            };
        }
        
        // Check for cached analysis of similar error
        const cachedAnalysis = await findCachedAnalysis(log.hash);
        if (cachedAnalysis) {
            // Save to current log
            log.aiAnalysis = {
                ...cachedAnalysis,
                cached: true,
                analyzedAt: new Date()
            };
            await log.save();
            return log.aiAnalysis;
        }
        
        // No cache, call OpenAI
        if (!openai) {
            console.warn('OpenAI API key not configured');
            return {
                rootCause: 'AI analysis unavailable',
                explanation: 'OpenAI API key not configured',
                suggestedFix: 'Please configure OPENAI_API_KEY in .env file',
                cached: false
            };
        }
        
        const analysis = await callOpenAI(log);
        
        // Save analysis to log
        log.aiAnalysis = {
            ...analysis,
            analyzedAt: new Date(),
            cached: false
        };
        await log.save();
        
        return analysis;
        
    } catch (error) {
        console.error('AI analysis error:', error.message);
        return {
            rootCause: 'Analysis failed',
            explanation: error.message,
            suggestedFix: 'Unable to analyze at this time',
            cached: false
        };
    }
};

/**
 * Finds cached AI analysis for similar errors
 */
const findCachedAnalysis = async (hash) => {
    const cachedLog = await Log.findOne({
        hash,
        'aiAnalysis.rootCause': { $exists: true }
    }).sort({ 'aiAnalysis.analyzedAt': -1 });
    
    if (cachedLog && cachedLog.aiAnalysis) {
        return {
            rootCause: cachedLog.aiAnalysis.rootCause,
            explanation: cachedLog.aiAnalysis.explanation,
            suggestedFix: cachedLog.aiAnalysis.suggestedFix
        };
    }
    
    return null;
};

/**
 * Calls OpenAI API to analyze error
 */
const callOpenAI = async (log) => {
    const prompt = `Analyze this application error log and provide:
1. Root cause (1-2 sentences)
2. Detailed explanation (2-3 sentences)
3. Suggested fix (specific steps)

Log Details:
- Service: ${log.service}
- Error Message: ${log.message}
- Metadata: ${JSON.stringify(log.metadata || {})}
- Timestamp: ${log.timestamp}

Provide response in JSON format:
{
  "rootCause": "...",
  "explanation": "...",
  "suggestedFix": "..."
}`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert software debugging assistant. Analyze error logs and provide clear, actionable insights.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });
        
        const content = response.choices[0].message.content;
        
        // Try to parse JSON response
        try {
            const parsed = JSON.parse(content);
            return {
                rootCause: parsed.rootCause || 'Unknown',
                explanation: parsed.explanation || 'No explanation provided',
                suggestedFix: parsed.suggestedFix || 'No fix suggested',
                cached: false
            };
        } catch (parseError) {
            // If not JSON, return raw content
            return {
                rootCause: 'Error analysis',
                explanation: content,
                suggestedFix: 'See explanation above',
                cached: false
            };
        }
        
    } catch (error) {
        console.error('OpenAI API error:', error.message);
        throw error;
    }
};

/**
 * Batch analyze recent errors
 * Used for proactive analysis
 */
const batchAnalyzeErrors = async (limit = 10) => {
    try {
        // Find recent ERROR logs without AI analysis
        const errors = await Log.find({
            level: 'ERROR',
            'aiAnalysis.rootCause': { $exists: false }
        })
        .sort({ timestamp: -1 })
        .limit(limit);
        
        const results = [];
        
        for (const error of errors) {
            const analysis = await analyzeError(error._id);
            results.push({
                logId: error._id,
                analysis
            });
        }
        
        return results;
        
    } catch (error) {
        console.error('Batch analysis error:', error.message);
        return [];
    }
};

module.exports = {
    analyzeError,
    batchAnalyzeErrors
};
