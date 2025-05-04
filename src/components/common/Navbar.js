import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('chessToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('chessToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setMobileMenuOpen(false);
    // Redirect to home page
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <div className="logo-icon">♞</div>
          <div className="logo-text">Chess Puzzles</div>
        </Link>
        
        <div className="menu-icon" onClick={toggleMobileMenu}>
          <i className={mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'}>
            {mobileMenuOpen ? '✕' : '☰'}
          </i>
        </div>
        
        <ul className={mobileMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link 
              to="/daily" 
              className={`nav-link ${location.pathname === '/daily' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Daily Puzzle
            </Link>
          </li>
          
          <li className="nav-item">
            <Link 
              to="/puzzles" 
              className={`nav-link ${location.pathname === '/puzzles' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Puzzles
            </Link>
          </li>
          
          <li className="nav-item">
            <Link 
              to="/training" 
              className={`nav-link ${location.pathname.includes('/training') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Training
            </Link>
          </li>
          
          <li className="nav-item">
            <Link 
              to="/leaderboard" 
              className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Leaderboard
            </Link>
          </li>
          
          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <Link 
                  to="/profile" 
                  className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
              </li>
              
              <li className="nav-item">
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link 
                  to="/login" 
                  className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
              </li>
              
              <li className="nav-item">
                <Link 
                  to="/signup" 
                  className="signup-button"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;