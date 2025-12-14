/**
 * Main React App Component
 * Handles routing between Login, Register and Dashboard
 */

import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (token) {
      // Verify token on load
      fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
          } else {
            handleLogout();
          }
        })
        .catch(() => handleLogout());
    }
  }, [token]);

  const handleLogin = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const handleRegister = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <div className="App">
      {token && user ? (
        <Dashboard token={token} user={user} onLogout={handleLogout} />
      ) : showRegister ? (
        <Register 
          onRegisterSuccess={handleRegister} 
          onSwitchToLogin={() => setShowRegister(false)} 
        />
      ) : (
        <Login 
          onLogin={handleLogin} 
          onSwitchToRegister={() => setShowRegister(true)} 
        />
      )}
    </div>
  );
}

export default App;
