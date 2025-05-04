import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      // Here we would connect to the backend API for user registration
      // For now, we'll just simulate a successful signup
      console.log('Signing up with:', name, email, password);
      
      // Simulate JWT token storage
      localStorage.setItem('chessToken', 'sample-jwt-token');
      localStorage.setItem('user', JSON.stringify({ email, name }));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Your Chess Puzzles Account</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="auth-button">Create Account</button>
        </form>
        
        <div className="auth-links">
          <p>Already have an account? <a href="/login">Login</a></p>
        </div>
        
        <div className="social-login">
          <p>Or sign up with:</p>
          <div className="social-buttons">
            <button className="social-button google">Google</button>
            <button className="social-button facebook">Facebook</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;