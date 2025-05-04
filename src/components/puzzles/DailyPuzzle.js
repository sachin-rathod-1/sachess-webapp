import React, { useState, useEffect } from 'react';
import PuzzleView from './PuzzleView';
import './DailyPuzzle.css';

const DailyPuzzle = () => {
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Check if the user has already completed today's puzzle
    const checkCompletion = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastCompleted = localStorage.getItem('lastCompletedDaily');
      
      if (lastCompleted === today) {
        setCompleted(true);
      }
    };
    
    // Get streak count from localStorage
    const getStreakCount = () => {
      const streak = localStorage.getItem('streakCount');
      if (streak) {
        setStreakCount(parseInt(streak));
      }
    };
    
    // Fetch daily puzzle
    const fetchDailyPuzzle = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, we'll use a mock puzzle
        const mockPuzzle = {
          id: 'daily-' + new Date().toISOString().split('T')[0],
          initialPosition: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
          positions: [
            'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
            'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
            'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
          ],
          moves: ['c4', 'g8f6'],
          rating: 1200,
          theme: 'Development',
          orientation: 'white',
          hints: ['Develop your bishop to control the center', 'Develop your knight to protect the e5 pawn'],
          explanation: 'This puzzle demonstrates the importance of piece development in the opening. White develops the bishop to c4, controlling the center and preparing for castling. Black responds by developing the knight to f6, which defends the e5 pawn and prepares for castling as well.'
        };
        
        setPuzzle(mockPuzzle);
        setLoading(false);
      } catch (err) {
        setError('Failed to load daily puzzle. Please try again later.');
        setLoading(false);
        console.error('Error fetching daily puzzle:', err);
      }
    };
    
    checkCompletion();
    getStreakCount();
    fetchDailyPuzzle();
  }, []);

  const handlePuzzleComplete = (result) => {
    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastCompleted = localStorage.getItem('lastCompletedDaily');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastCompleted === yesterdayStr) {
      // Continuing streak
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      localStorage.setItem('streakCount', newStreak.toString());
    } else if (lastCompleted !== today) {
      // New streak
      setStreakCount(1);
      localStorage.setItem('streakCount', '1');
    }
    
    // Mark as completed
    localStorage.setItem('lastCompletedDaily', today);
    setCompleted(true);
    
    // In a real app, we would send the result to the server
    console.log('Puzzle completed:', result);
  };

  const handlePuzzleFail = (result) => {
    // In a real app, we would send the result to the server
    console.log('Puzzle failed:', result);
  };

  if (loading) {
    return (
      <div className="daily-puzzle-container">
        <div className="daily-puzzle-loading">
          <div className="spinner"></div>
          <p>Loading today's puzzle...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-puzzle-container">
        <div className="daily-puzzle-error">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-puzzle-container">
      <div className="daily-puzzle-header">
        <h1>Daily Puzzle</h1>
        <div className="streak-counter">
          <span className="streak-flame">🔥</span>
          <span className="streak-count">{streakCount} day streak</span>
        </div>
      </div>
      
      {completed ? (
        <div className="daily-puzzle-completed">
          <h2>You've completed today's puzzle!</h2>
          <p>Come back tomorrow for a new challenge.</p>
          <div className="completed-stats">
            <div className="stat">
              <span className="stat-label">Current Streak</span>
              <span className="stat-value">{streakCount} days</span>
            </div>
            <div className="stat">
              <span className="stat-label">Next Puzzle</span>
              <span className="stat-value">
                {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <PuzzleView 
          puzzle={puzzle} 
          onComplete={handlePuzzleComplete} 
          onFail={handlePuzzleFail} 
        />
      )}
    </div>
  );
};

export default DailyPuzzle;