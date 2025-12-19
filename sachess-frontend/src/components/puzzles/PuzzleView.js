import React, { useState, useEffect } from 'react';
import ChessboardComponent from '../chessboard/Chessboard';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Chip, 
  Grid, 
  Card, 
  CardContent,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TimerIcon from '@mui/icons-material/Timer';
import ReplayIcon from '@mui/icons-material/Replay';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion, AnimatePresence } from 'framer-motion';

const PuzzleHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  }
}));

const PuzzleTimer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  [theme.breakpoints.down('sm')]: {
    alignSelf: 'flex-end',
  }
}));

const PuzzleMessage = styled(Alert)(({ theme, status }) => ({
  marginBottom: theme.spacing(3),
  animation: status === 'success' || status === 'failed' ? 'pulse 2s infinite' : 'none',
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(0, 0, 0, 0.1)',
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(0, 0, 0, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
    },
  }
}));

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const PuzzleView = ({ puzzle, onComplete, onFail }) => {
  const [currentFen, setCurrentFen] = useState(DEFAULT_FEN);
  const [status, setStatus] = useState('ready'); // ready, solving, success, failed
  const [moveIndex, setMoveIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    if (puzzle && puzzle.initialPosition) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const getAlertSeverity = () => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'solving':
        return 'info';
      default:
        return 'info';
    }
  };

  if (!puzzle) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 300 
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading puzzle...
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{ maxWidth: 800, mx: 'auto', px: 2 }}
    >
      <PuzzleHeader>
        <Box>
          <Typography variant="h4" component="h2" gutterBottom>
            Puzzle #{puzzle.id}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`Rating: ${puzzle.rating}`} 
              color="primary" 
              variant="outlined" 
              size="small"
            />
            <Chip 
              label={`Theme: ${puzzle.theme}`} 
              color="secondary" 
              variant="outlined" 
              size="small"
            />
          </Box>
        </Box>
        <PuzzleTimer>
          <TimerIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6" component="span">
            {formatTime(timer)}
          </Typography>
        </PuzzleTimer>
      </PuzzleHeader>
      
      <Box sx={{ mb: 4 }}>
        <ChessboardComponent 
          fen={currentFen} 
          onMove={handleMove} 
          orientation={puzzle.orientation || 'white'} 
          allowMoves={status !== 'success' && status !== 'failed'}
          showHints={showHint}
        />
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <AnimatePresence mode="wait">
          <PuzzleMessage 
            component={motion.div}
            key={message}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            severity={getAlertSeverity()}
            variant="filled"
            status={status}
          >
            {message}
          </PuzzleMessage>
        </AnimatePresence>
        
        <Grid container spacing={2} justifyContent="center">
          {status === 'ready' || status === 'solving' ? (
            <Grid item>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<LightbulbIcon />}
                onClick={handleHint}
                disabled={hintsRemaining === 0}
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Hint ({hintsRemaining})
              </Button>
            </Grid>
          ) : (
            <>
              <Grid item>
                <Button 
                  variant="outlined" 
                  color="primary"
                  startIcon={<ReplayIcon />}
                  onClick={handleTryAgain}
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Again
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="contained" 
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNextPuzzle}
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next Puzzle
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
      
      {puzzle.explanation && status === 'success' && (
        <Card 
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          elevation={3}
          sx={{ 
            mt: 4, 
            borderLeft: `4px solid ${theme.palette.success.main}`,
            borderRadius: 2
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Explanation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {puzzle.explanation}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PuzzleView;