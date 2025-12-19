import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PuzzleViewImproved from '../puzzles/PuzzleViewImproved';
import { getPuzzlesByTheme } from '../../data/puzzles';
import './TrainingMode.css';

const TrainingMode = () => {
  const { theme } = useParams();
  const navigate = useNavigate();
  const [puzzles, setPuzzles] = useState([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({
    solved: 0,
    failed: 0,
    totalTime: 0,
    hintsUsed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPuzzles = () => {
      setLoading(true);
      
      try {
        const themePuzzles = getPuzzlesByTheme(theme.toLowerCase());
        
        if (themePuzzles && themePuzzles.length > 0) {
          setPuzzles(themePuzzles);
        } else {
          setPuzzles([]);
        }
      } catch (error) {
        console.error('Error loading puzzles:', error);
        setPuzzles([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPuzzles();
  }, [theme]);

  const handlePuzzleComplete = (result) => {
    setStats(prev => ({
      ...prev,
      solved: prev.solved + 1,
      totalTime: prev.totalTime + result.timeSpent,
      hintsUsed: prev.hintsUsed + result.hintsUsed
    }));
    
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      setCompleted(true);
    }
    
    console.log('Puzzle completed:', result);
  };

  const handlePuzzleFail = (result) => {
    setStats(prev => ({
      ...prev,
      failed: prev.failed + 1,
      totalTime: prev.totalTime + result.timeSpent,
      hintsUsed: prev.hintsUsed + result.hintsUsed
    }));
    
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      setCompleted(true);
    }
    
    console.log('Puzzle failed:', result);
  };

  const handleRestartTraining = () => {
    setCurrentPuzzleIndex(0);
    setCompleted(false);
    setStats({
      solved: 0,
      failed: 0,
      totalTime: 0,
      hintsUsed: 0
    });
  };

  const handleChooseAnotherTheme = () => {
    navigate('/training');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="training-container">
        <div className="training-loading">
          <div className="spinner"></div>
          <p>Loading training puzzles...</p>
        </div>
      </div>
    );
  }

  const themeTitles = {
    'pins': 'Pins',
    'forks': 'Forks',
    'skewers': 'Skewers',
    'discovered-attacks': 'Discovered Attacks',
    'double-attacks': 'Double Attacks',
    'mate-in-one': 'Mate in One',
    'mate-in-two': 'Mate in Two',
    'endgames': 'Endgames'
  };
  
  const themeTitle = themeTitles[theme] || 'Custom Training';

  return (
    <div className="training-container">
      <div className="training-header">
        <h1>{themeTitle} Training</h1>
        <div className="training-progress">
          <div className="progress-text">
            Puzzle {currentPuzzleIndex + 1} of {puzzles.length}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentPuzzleIndex / puzzles.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {completed ? (
        <div className="training-completed">
          <h2>Training Completed!</h2>
          <div className="training-stats">
            <div className="training-stat">
              <span className="stat-label">Puzzles Solved</span>
              <span className="stat-value">{stats.solved} / {puzzles.length}</span>
            </div>
            <div className="training-stat">
              <span className="stat-label">Success Rate</span>
              <span className="stat-value">
                {Math.round((stats.solved / puzzles.length) * 100)}%
              </span>
            </div>
            <div className="training-stat">
              <span className="stat-label">Total Time</span>
              <span className="stat-value">{formatTime(stats.totalTime)}</span>
            </div>
            <div className="training-stat">
              <span className="stat-label">Hints Used</span>
              <span className="stat-value">{stats.hintsUsed}</span>
            </div>
          </div>
          <div className="training-actions">
            <button className="restart-button" onClick={handleRestartTraining}>
              Restart Training
            </button>
            <button className="theme-button" onClick={handleChooseAnotherTheme}>
              Choose Another Theme
            </button>
          </div>
        </div>
      ) : (
        <PuzzleViewImproved 
          puzzle={puzzles[currentPuzzleIndex]} 
          onComplete={handlePuzzleComplete} 
          onFail={handlePuzzleFail} 
        />
      )}
    </div>
  );
};

export default TrainingMode;