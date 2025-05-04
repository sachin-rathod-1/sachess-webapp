import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PuzzleView from '../puzzles/PuzzleView';
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
    // In a real app, this would fetch puzzles from the backend based on the theme
    // For now, we'll use mock data
    const fetchPuzzles = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        // Mock puzzles based on theme
        const mockPuzzles = generateMockPuzzles(theme);
        setPuzzles(mockPuzzles);
        setLoading(false);
      }, 1000);
    };
    
    fetchPuzzles();
  }, [theme]);

  // Generate mock puzzles based on theme
  const generateMockPuzzles = (theme) => {
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
    
    // Generate 5 mock puzzles
    return Array.from({ length: 5 }, (_, i) => ({
      id: `${theme}-${i + 1}`,
      initialPosition: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
      positions: [
        'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
        'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      ],
      moves: ['c4', 'g8f6'],
      rating: 1200 + (i * 100),
      theme: themeTitle,
      orientation: i % 2 === 0 ? 'white' : 'black',
      hints: [
        `This is a ${themeTitle.toLowerCase()} puzzle. Look for pieces that can be pinned.`,
        `Find a way to exploit the ${themeTitle.toLowerCase()} tactic.`
      ],
      explanation: `This puzzle demonstrates a classic ${themeTitle.toLowerCase()} tactic. The key is to recognize the pattern and exploit the weakness in your opponent's position.`
    }));
  };

  const handlePuzzleComplete = (result) => {
    // Update stats
    setStats(prev => ({
      ...prev,
      solved: prev.solved + 1,
      totalTime: prev.totalTime + result.timeSpent,
      hintsUsed: prev.hintsUsed + result.hintsUsed
    }));
    
    // Move to next puzzle or complete training
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      setCompleted(true);
    }
    
    // In a real app, we would send the result to the server
    console.log('Puzzle completed:', result);
  };

  const handlePuzzleFail = (result) => {
    // Update stats
    setStats(prev => ({
      ...prev,
      failed: prev.failed + 1,
      totalTime: prev.totalTime + result.timeSpent,
      hintsUsed: prev.hintsUsed + result.hintsUsed
    }));
    
    // Move to next puzzle or complete training
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      setCompleted(true);
    }
    
    // In a real app, we would send the result to the server
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
        <PuzzleView 
          puzzle={puzzles[currentPuzzleIndex]} 
          onComplete={handlePuzzleComplete} 
          onFail={handlePuzzleFail} 
        />
      )}
    </div>
  );
};

export default TrainingMode;