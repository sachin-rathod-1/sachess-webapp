import React, { useState, useEffect, useCallback } from 'react';
import ChessboardComponent from '../chessboard/Chessboard';
import { Chess } from 'chess.js';
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
  IconButton,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TimerIcon from '@mui/icons-material/Timer';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { motion, AnimatePresence } from 'framer-motion';

// Styled Components for better layout
const PuzzleContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('md')]: {
    height: 'auto',
    minHeight: '100vh'
  }
}));

const MainContent = styled(Grid)(({ theme }) => ({
  flex: 1,
  overflow: 'hidden',
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1)
  }
}));

const BoardSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(2)
  }
}));

const ControlsSection = styled(Paper)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  [theme.breakpoints.down('md')]: {
    height: 'auto',
    maxHeight: 'none'
  }
}));

const MessageBar = styled(Paper)(({ theme, status }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  padding: theme.spacing(1.5, 3),
  zIndex: 1300,
  backgroundColor: status === 'success' ? theme.palette.success.main : 
                   status === 'failed' ? theme.palette.error.main :
                   status === 'hint' ? theme.palette.info.main :
                   theme.palette.primary.main,
  color: theme.palette.common.white,
  boxShadow: theme.shadows[8],
  borderRadius: theme.spacing(3),
  maxWidth: '90%',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 2),
    fontSize: '0.875rem'
  }
}));

const QuickActionButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: theme.shadows[8]
  },
  transition: 'all 0.3s ease',
  zIndex: 1200
}));

const PuzzleViewImproved = ({ puzzle, onComplete, onFail, onNext }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [currentFen, setCurrentFen] = useState('');
  const [status, setStatus] = useState('ready');
  const [moveIndex, setMoveIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  // Initialize puzzle
  useEffect(() => {
    if (puzzle && puzzle.fen) {
      setCurrentFen(puzzle.fen);
      setStatus('solving');
      setMoveIndex(0);
      setShowHint(false);
      setMessage(`${puzzle.title} - ${puzzle.theme}`);
      setTimer(0);
      setHintsUsed(0);
      setAttempts(0);
    }
  }, [puzzle]);

  // Timer
  useEffect(() => {
    let interval = null;
    if (status === 'solving') {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMove = useCallback((move) => {
    if (!puzzle || status !== 'solving') return;

    const expectedMove = puzzle.solution[moveIndex];
    
    if (move === expectedMove) {
      setMoveIndex(moveIndex + 1);
      
      if (moveIndex + 1 >= puzzle.solution.length) {
        // Puzzle solved!
        setStatus('success');
        setMessage('Excellent! Puzzle solved! 🎉');
        
        if (onComplete) {
          onComplete({
            timeSpent: timer,
            hintsUsed,
            attempts: attempts + 1
          });
        }
      } else {
        setMessage('Good move! Continue...');
        
        // Make opponent's move if needed
        if (moveIndex + 1 < puzzle.solution.length) {
          setTimeout(() => {
            const game = new Chess(currentFen);
            const nextMove = puzzle.solution[moveIndex + 1];
            const move = {
              from: nextMove.substring(0, 2),
              to: nextMove.substring(2, 4),
              promotion: nextMove[4] || undefined
            };
            game.move(move);
            setCurrentFen(game.fen());
            setMoveIndex(moveIndex + 2);
          }, 500);
        }
      }
    } else {
      setAttempts(attempts + 1);
      setStatus('failed');
      setMessage('Wrong move! Try again.');
      
      setTimeout(() => {
        setStatus('solving');
        setMessage('');
      }, 2000);
    }
  }, [puzzle, moveIndex, status, timer, hintsUsed, attempts, currentFen, onComplete]);

  const handleHint = () => {
    if (!puzzle || status !== 'solving') return;
    
    setShowHint(true);
    setHintsUsed(hintsUsed + 1);
    setMessage(puzzle.hint || 'Think about the position...');
    
    setTimeout(() => {
      setShowHint(false);
      setMessage('');
    }, 3000);
  };

  const handleReset = () => {
    if (!puzzle) return;
    
    setCurrentFen(puzzle.fen);
    setStatus('solving');
    setMoveIndex(0);
    setShowHint(false);
    setMessage('Puzzle reset. Try again!');
    setAttempts(attempts + 1);
  };

  const handleShowSolution = () => {
    if (!puzzle) return;
    
    setMessage(`Solution: ${puzzle.solution.join(', ')}`);
    setStatus('revealed');
  };

  if (!puzzle) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography>No puzzle loaded</Typography>
      </Box>
    );
  }

  return (
    <PuzzleContainer>
      <MainContent container spacing={isTablet ? 2 : 3}>
        {/* Board Section - Takes more space on desktop */}
        <Grid item xs={12} md={8}>
          <BoardSection>
            {/* Puzzle Title and Info */}
            <Box sx={{ width: '100%', mb: 2, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                {puzzle.title}
              </Typography>
              <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
                <Chip 
                  label={puzzle.theme} 
                  color="primary" 
                  size="small"
                />
                <Chip 
                  label={puzzle.difficulty} 
                  color={puzzle.difficulty === 'Easy' ? 'success' : 
                         puzzle.difficulty === 'Medium' ? 'warning' : 'error'}
                  size="small"
                />
                <Chip
                  icon={<TimerIcon />}
                  label={formatTime(timer)}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>

            {/* Chess Board - Responsive sizing */}
            <Box 
              sx={{ 
                width: '100%',
                maxWidth: isMobile ? '100%' : isTablet ? '400px' : '500px',
                aspectRatio: '1/1'
              }}
            >
              <ChessboardComponent
                fen={currentFen}
                onMove={handleMove}
                orientation="white"
                allowMoves={status === 'solving'}
                showHints={showHint}
              />
            </Box>
          </BoardSection>
        </Grid>

        {/* Controls Section */}
        <Grid item xs={12} md={4}>
          <ControlsSection elevation={2}>
            {/* Status Display */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Puzzle Status
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Attempts
                  </Typography>
                  <Typography variant="body2">
                    {attempts}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    Hints Used
                  </Typography>
                  <Typography variant="body2">
                    {hintsUsed}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Button
                variant="contained"
                color="info"
                startIcon={<LightbulbIcon />}
                onClick={handleHint}
                disabled={status !== 'solving' || showHint}
                fullWidth
              >
                Get Hint
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ReplayIcon />}
                onClick={handleReset}
                disabled={status === 'success'}
                fullWidth
              >
                Reset Puzzle
              </Button>
              
              <Button
                variant="outlined"
                color="warning"
                onClick={handleShowSolution}
                disabled={status === 'success' || status === 'revealed'}
                fullWidth
              >
                Show Solution
              </Button>

              {status === 'success' && onNext && (
                <Button
                  variant="contained"
                  color="success"
                  endIcon={<NavigateNextIcon />}
                  onClick={onNext}
                  fullWidth
                >
                  Next Puzzle
                </Button>
              )}
            </Box>

            {/* Explanation Section */}
            {puzzle.explanation && status === 'success' && (
              <Fade in={status === 'success'}>
                <Card variant="outlined" sx={{ backgroundColor: theme.palette.success.light }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Explanation
                    </Typography>
                    <Typography variant="body2">
                      {puzzle.explanation}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            )}
          </ControlsSection>
        </Grid>
      </MainContent>

      {/* Message Bar - Shows at bottom, always visible */}
      <AnimatePresence>
        {message && (
          <Zoom in={true}>
            <MessageBar 
              status={showHint ? 'hint' : status}
              component={motion.div}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                {status === 'success' && <CheckCircleIcon />}
                {status === 'failed' && <ErrorIcon />}
                {showHint && <LightbulbIcon />}
                <Typography variant="body1">{message}</Typography>
              </Box>
            </MessageBar>
          </Zoom>
        )}
      </AnimatePresence>

      {/* Quick Action Buttons for mobile */}
      {isMobile && (
        <>
          <QuickActionButton
            color="info"
            onClick={handleHint}
            disabled={status !== 'solving'}
            sx={{ bottom: 80, right: 16 }}
          >
            <LightbulbIcon />
          </QuickActionButton>
          
          <QuickActionButton
            color="primary"
            onClick={handleReset}
            sx={{ bottom: 140, right: 16 }}
          >
            <ReplayIcon />
          </QuickActionButton>
        </>
      )}
    </PuzzleContainer>
  );
};

export default PuzzleViewImproved;
