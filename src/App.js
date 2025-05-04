import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

// Puzzle Components
import DailyPuzzle from './components/puzzles/DailyPuzzle';

// Training Components
import TrainingSelection from './components/training/TrainingSelection';
import TrainingMode from './components/training/TrainingMode';

// Profile Components
import Profile from './components/profile/Profile';

// Home Component
const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Improve Your Chess Skills with Daily Puzzles</h1>
          <p>Enhance your tactical vision, pattern recognition, and calculation abilities with our curated chess puzzles.</p>
          <div className="hero-buttons">
            <a href="/daily" className="primary-button">Try Daily Puzzle</a>
            <a href="/signup" className="secondary-button">Create Account</a>
          </div>
        </div>
        <div className="hero-image">
          <div className="chess-board-preview"></div>
        </div>
      </div>

      <div className="features-section">
        <h2>Why Chess Puzzles?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Improve Pattern Recognition</h3>
            <p>Train your brain to recognize tactical patterns that appear in your games.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Track Your Progress</h3>
            <p>Monitor your improvement with detailed statistics and performance metrics.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Targeted Training</h3>
            <p>Focus on specific tactical themes to strengthen your weaknesses.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔥</div>
            <h3>Daily Challenges</h3>
            <p>Solve the daily puzzle to maintain your streak and stay sharp.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Improve Your Chess?</h2>
        <p>Join thousands of players who use our platform to enhance their chess skills.</p>
        <a href="/signup" className="cta-button">Get Started for Free</a>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('chessToken') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/daily" element={<DailyPuzzle />} />
            <Route path="/training" element={<TrainingSelection />} />
            <Route path="/training/:theme" element={<TrainingMode />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
