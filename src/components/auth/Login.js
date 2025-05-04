import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Here we would connect to the backend API for authentication
      // For now, we'll just simulate a successful login
      console.log('Logging in with:', email, password);
      
      // Simulate JWT token storage
      localStorage.setItem('chessToken', 'sample-jwt-token');
      localStorage.setItem('user', JSON.stringify({ email, name: email.split('@')[0] }));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Chess Puzzles</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="auth-button">Login</button>
        </form>
        
        <div className="auth-links">
          <p>Don't have an account? <a href="/signup">Sign Up</a></p>
          <p><a href="/forgot-password">Forgot Password?</a></p>
        </div>
        
        <div className="social-login">
          <p>Or login with:</p>
          <div className="social-buttons">
            <button className="social-button google">Google</button>
            <button className="social-button facebook">Facebook</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;