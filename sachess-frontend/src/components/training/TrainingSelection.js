import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TrainingSelection.css';

const TrainingSelection = () => {
  const navigate = useNavigate();

  const trainingThemes = [
    {
      id: 'pins',
      title: 'Pins',
      description: 'Learn to pin pieces against more valuable ones or against the king.',
      icon: '📌',
      difficulty: 'Intermediate',
      puzzleCount: 25
    },
    {
      id: 'forks',
      title: 'Forks',
      description: 'Attack two or more pieces simultaneously with a single piece.',
      icon: '🍴',
      difficulty: 'Beginner',
      puzzleCount: 30
    },
    {
      id: 'skewers',
      title: 'Skewers',
      description: 'Attack a valuable piece, forcing it to move and expose a less valuable piece.',
      icon: '🔪',
      difficulty: 'Intermediate',
      puzzleCount: 20
    },
    {
      id: 'discovered-attacks',
      title: 'Discovered Attacks',
      description: 'Move one piece to reveal an attack from another piece behind it.',
      icon: '👁️',
      difficulty: 'Advanced',
      puzzleCount: 15
    },
    {
      id: 'double-attacks',
      title: 'Double Attacks',
      description: 'Attack two pieces at once with different pieces.',
      icon: '⚔️',
      difficulty: 'Intermediate',
      puzzleCount: 22
    },
    {
      id: 'mate-in-one',
      title: 'Mate in One',
      description: 'Find the single move that delivers checkmate.',
      icon: '♚',
      difficulty: 'Beginner',
      puzzleCount: 35
    },
    {
      id: 'mate-in-two',
      title: 'Mate in Two',
      description: 'Find the sequence of two moves that delivers checkmate.',
      icon: '👑',
      difficulty: 'Advanced',
      puzzleCount: 18
    },
    {
      id: 'endgames',
      title: 'Endgames',
      description: 'Practice essential endgame techniques and positions.',
      icon: '🏁',
      difficulty: 'Advanced',
      puzzleCount: 20
    }
  ];

  const difficultyColors = {
    'Beginner': '#28a745',
    'Intermediate': '#fd7e14',
    'Advanced': '#dc3545'
  };

  const handleThemeSelect = (themeId) => {
    navigate(`/training/${themeId}`);
  };

  return (
    <div className="training-selection-container">
      <div className="training-selection-header">
        <h1>Training Modes</h1>
        <p>Select a tactical theme to practice and improve your chess skills</p>
      </div>
      
      <div className="training-themes-grid">
        {trainingThemes.map(theme => (
          <div 
            key={theme.id} 
            className="theme-card" 
            onClick={() => handleThemeSelect(theme.id)}
          >
            <div className="theme-icon">{theme.icon}</div>
            <div className="theme-content">
              <h2>{theme.title}</h2>
              <p>{theme.description}</p>
              <div className="theme-details">
                <span 
                  className="theme-difficulty" 
                  style={{ backgroundColor: difficultyColors[theme.difficulty] }}
                >
                  {theme.difficulty}
                </span>
                <span className="theme-count">{theme.puzzleCount} puzzles</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="training-recommendations">
        <h2>Recommended for You</h2>
        <p>Based on your recent performance, we recommend these training modes:</p>
        
        <div className="recommendation-cards">
          <div className="recommendation-card">
            <div className="recommendation-header">
              <div className="recommendation-icon">🍴</div>
              <h3>Forks</h3>
            </div>
            <div className="recommendation-reason">
              You missed several fork opportunities in recent puzzles.
            </div>
            <button 
              className="recommendation-button"
              onClick={() => handleThemeSelect('forks')}
            >
              Start Training
            </button>
          </div>
          
          <div className="recommendation-card">
            <div className="recommendation-header">
              <div className="recommendation-icon">📌</div>
              <h3>Pins</h3>
            </div>
            <div className="recommendation-reason">
              Improve your pin recognition to boost your tactical vision.
            </div>
            <button 
              className="recommendation-button"
              onClick={() => handleThemeSelect('pins')}
            >
              Start Training
            </button>
          </div>
        </div>
      </div>
      
      <div className="custom-training">
        <h2>Custom Training</h2>
        <p>Create a personalized training session based on your preferences:</p>
        
        <div className="custom-training-form">
          <div className="form-group">
            <label>Difficulty Level</label>
            <select>
              <option value="beginner">Beginner (800-1200)</option>
              <option value="intermediate">Intermediate (1200-1600)</option>
              <option value="advanced">Advanced (1600-2000)</option>
              <option value="expert">Expert (2000+)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Number of Puzzles</label>
            <select>
              <option value="5">5 puzzles</option>
              <option value="10">10 puzzles</option>
              <option value="15">15 puzzles</option>
              <option value="20">20 puzzles</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Time Limit</label>
            <select>
              <option value="none">No time limit</option>
              <option value="30">30 seconds per puzzle</option>
              <option value="60">1 minute per puzzle</option>
              <option value="120">2 minutes per puzzle</option>
            </select>
          </div>
          
          <button className="custom-training-button">
            Create Custom Training
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingSelection;