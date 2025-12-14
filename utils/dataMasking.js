/**
 * Data Masking Utility
 * Masks sensitive information (emails, phones, tokens, passwords) before storage
 */

/**
 * Masks email addresses
 * Example: john.doe@example.com → j****e@e*****e.com
 */
const maskEmail = (email) => {
    if (!email || typeof email !== 'string') return email;
    
    const [local, domain] = email.split('@');
    if (!domain) return email;
    
    const maskedLocal = local[0] + '****' + (local.length > 1 ? local[local.length - 1] : '');
    const [domainName, ext] = domain.split('.');
    const maskedDomain = domainName[0] + '****' + (domainName.length > 1 ? domainName[domainName.length - 1] : '');
    
    return `${maskedLocal}@${maskedDomain}.${ext}`;
};

/**
 * Masks phone numbers
 * Example: +1-555-123-4567 → +1-***-***-4567
 */
const maskPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return phone;
    return phone.replace(/(\d{1,3})\d+(\d{4})/, '$1-***-***-$2');
};

/**
 * Masks tokens/API keys
 * Example: sk_live_abc123def456 → sk_***_456
 */
const maskToken = (token) => {
    if (!token || typeof token !== 'string') return token;
    if (token.length <= 6) return '***';
    return token.substring(0, 3) + '***' + token.substring(token.length - 3);
};

/**
 * Masks passwords
 */
const maskPassword = () => '********';

/**
 * Main masking function
 * Scans and masks sensitive data in log message and metadata
 */
const maskSensitiveData = (logData) => {
    let masked = { ...logData };
    
    // Email regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    // Phone regex
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
    // Token/API key patterns
    const tokenRegex = /(sk_|pk_|token_|api_|key_)[a-zA-Z0-9_-]+/gi;
    // Password field patterns
    const passwordRegex = /(password|passwd|pwd)[\s:=]+[^\s,}]+/gi;
    
    // Mask in message
    if (masked.message) {
        masked.message = masked.message
            .replace(emailRegex, (email) => maskEmail(email))
            .replace(phoneRegex, (phone) => maskPhone(phone))
            .replace(tokenRegex, (token) => maskToken(token))
            .replace(passwordRegex, (match) => {
                const parts = match.split(/[:=\s]+/);
                return parts[0] + ': ' + maskPassword();
            });
    }
    
    // Mask in metadata
    if (masked.metadata && typeof masked.metadata === 'object') {
        masked.metadata = maskObjectFields(masked.metadata);
    }
    
    masked.masked = true;
    return masked;
};

/**
 * Recursively mask sensitive fields in objects
 */
const maskObjectFields = (obj) => {
    const masked = { ...obj };
    const sensitiveKeys = ['email', 'password', 'token', 'api_key', 'phone', 'ssn', 'credit_card'];
    
    for (const key in masked) {
        const lowerKey = key.toLowerCase();
        
        if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
            if (lowerKey.includes('email')) {
                masked[key] = maskEmail(masked[key]);
            } else if (lowerKey.includes('phone')) {
                masked[key] = maskPhone(masked[key]);
            } else if (lowerKey.includes('token') || lowerKey.includes('api') || lowerKey.includes('key')) {
                masked[key] = maskToken(masked[key]);
            } else {
                masked[key] = '********';
            }
        } else if (typeof masked[key] === 'object' && masked[key] !== null) {
            masked[key] = maskObjectFields(masked[key]);
        }
    }
    
    return masked;
};

module.exports = {
    maskSensitiveData,
    maskEmail,
    maskPhone,
    maskToken,
    maskPassword
};
