import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Chess Puzzles</h3>
          <p>Improve your chess skills with daily puzzles and targeted training.</p>
          <div className="social-links">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              Twitter
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              Facebook
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
              Instagram
            </a>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/daily">Daily Puzzle</Link></li>
            <li><Link to="/puzzles">Puzzles</Link></li>
            <li><Link to="/training">Training</Link></li>
            <li><Link to="/leaderboard">Leaderboard</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Resources</h3>
          <ul className="footer-links">
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/blog">Chess Blog</Link></li>
            <li><Link to="/tutorials">Tutorials</Link></li>
            <li><a href="https://lichess.org" target="_blank" rel="noopener noreferrer">Lichess</a></li>
            <li><a href="https://chess.com" target="_blank" rel="noopener noreferrer">Chess.com</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Premium</h3>
          <p>Unlock unlimited puzzles, advanced analytics, and more with Premium.</p>
          <Link to="/premium" className="premium-button">
            Upgrade to Premium
          </Link>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Chess Puzzles. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;