import React, { useState, useEffect } from 'react';
import Chessboard from '../chessboard/Chessboard';
import './PuzzleView.css';

const PuzzleView = ({ puzzle, onComplete, onFail }) => {
  const [currentFen, setCurrentFen] = useState('');
  const [status, setStatus] = useState('ready'); // ready, solving, success, failed
  const [moveIndex, setMoveIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    if (puzzle) {
      setCurrentFen(puzzle.initialPosition);
      setStatus('ready');
      setMoveIndex(0);
      setMessage('Your turn. Find the best move!');
      setShowHint(false);
      
      // Reset timer
      clearInterval(timerInterval);
      setTimer(0);
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    }
    
    return () => {
      clearInterval(timerInterval);
    };
  }, [puzzle]);

  const handleMove = (move) => {
    if (status === 'failed' || status === 'success') return;
    
    setStatus('solving');
    
    // Check if the move is correct
    const expectedMove = puzzle.moves[moveIndex];
    
    if (move === expectedMove) {
      // Correct move
      setMessage('Correct! Good move.');
      
      // If this was the last move, puzzle is solved
      if (moveIndex === puzzle.moves.length - 1) {
        setStatus('success');
        setMessage('Puzzle solved! Well done.');
        clearInterval(timerInterval);
        onComplete && onComplete({
          puzzleId: puzzle.id,
          timeSpent: timer,
          hintsUsed: 3 - hintsRemaining
        });
      } else {
        // Make the opponent's move
        setTimeout(() => {
          const opponentMove = puzzle.moves[moveIndex + 1];
          // In a real app, we would update the FEN based on the move
          // For now, we'll just use the next position from the puzzle
          setCurrentFen(puzzle.positions[moveIndex + 1]);
          setMoveIndex(moveIndex + 2);
          setMessage('Your turn again. Find the best move!');
        }, 500);
      }
    } else {
      // Incorrect move
      setStatus('failed');
      setMessage(`Incorrect move. The correct move was ${expectedMove}.`);
      clearInterval(timerInterval);
      onFail && onFail({
        puzzleId: puzzle.id,
        timeSpent: timer,
        hintsUsed: 3 - hintsRemaining
      });
    }
  };

  const handleHint = () => {
    if (hintsRemaining > 0 && status === 'solving') {
      setHintsRemaining(hintsRemaining - 1);
      setShowHint(true);
      setMessage(`Hint: ${puzzle.hints[moveIndex]}`);
    }
  };

  const handleTryAgain = () => {
    setCurrentFen(puzzle.initialPosition);
    setStatus('ready');
    setMoveIndex(0);
    setMessage('Your turn. Find the best move!');
    setShowHint(false);
    
    // Reset timer
    clearInterval(timerInterval);
    setTimer(0);
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const handleNextPuzzle = () => {
    // This would be handled by the parent component
    onComplete && onComplete({
      puzzleId: puzzle.id,
      timeSpent: timer,
      hintsUsed: 3 - hintsRemaining,
      nextPuzzle: true
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!puzzle) {
    return <div className="puzzle-loading">Loading puzzle...</div>;
  }

  return (
    <div className="puzzle-view">
      <div className="puzzle-header">
        <div className="puzzle-info">
          <h2>Puzzle #{puzzle.id}</h2>
          <div className="puzzle-details">
            <span className="puzzle-rating">Rating: {puzzle.rating}</span>
            <span className="puzzle-theme">Theme: {puzzle.theme}</span>
          </div>
        </div>
        <div className="puzzle-timer">Time: {formatTime(timer)}</div>
      </div>
      
      <div className="puzzle-board">
        <Chessboard 
          fen={currentFen} 
          onMove={handleMove} 
          orientation={puzzle.orientation || 'white'} 
          allowMoves={status !== 'success' && status !== 'failed'}
          showHints={showHint}
        />
      </div>
      
      <div className="puzzle-controls">
        <div className={`puzzle-message ${status}`}>{message}</div>
        
        <div className="puzzle-buttons">
          {status === 'ready' || status === 'solving' ? (
            <button 
              className="hint-button" 
              onClick={handleHint} 
              disabled={hintsRemaining === 0}
            >
              Hint ({hintsRemaining})
            </button>
          ) : (
            <>
              <button className="try-again-button" onClick={handleTryAgain}>
                Try Again
              </button>
              <button className="next-puzzle-button" onClick={handleNextPuzzle}>
                Next Puzzle
              </button>
            </>
          )}
        </div>
      </div>
      
      {puzzle.explanation && status === 'success' && (
        <div className="puzzle-explanation">
          <h3>Explanation</h3>
          <p>{puzzle.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default PuzzleView;