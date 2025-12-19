import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import ChessboardComponent from '../chessboard/Chessboard';
import { getStockfish } from '../../services/stockfish';
import { getGameDatabase } from '../../services/gameDatabase';
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import {
  Undo as UndoIcon,
  FlipCameraAndroid as FlipIcon,
  Assessment as AnalyzeIcon,
  Save as SaveIcon,
  RestartAlt as NewGameIcon,
  Psychology,
  Psychology as ThinkingIcon,
  Timer as ClockIcon
} from '@mui/icons-material';

const ComputerGame = () => {
  // Game state
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [playerColor, setPlayerColor] = useState('white');
  const [gameStatus, setGameStatus] = useState('setup'); // setup, playing, paused, ended
  
  // Computer settings
  const [difficulty, setDifficulty] = useState(5); // 1-10
  const [timePerMove, setTimePerMove] = useState(2000); // milliseconds
  const [showHints, setShowHints] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(true);
  const [useOpeningBook, setUseOpeningBook] = useState(true);
  
  // Engine state
  const [engine, setEngine] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [bestMove, setBestMove] = useState(null);
  const [hintMove, setHintMove] = useState(null);
  
  // UI state
  const [showNewGameDialog, setShowNewGameDialog] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  
  // Clock state (optional time control)
  const [timeControl, setTimeControl] = useState(null); // null or { initial: minutes, increment: seconds }
  const [whiteClock, setWhiteClock] = useState(null);
  const [blackClock, setBlackClock] = useState(null);
  const [activeClockInterval, setActiveClockInterval] = useState(null);
  
  // Initialize engine
  useEffect(() => {
    const initEngine = async () => {
      try {
        const stockfish = await getStockfish();
        setEngine(stockfish);
      } catch (error) {
        console.error('Failed to initialize engine:', error);
        setSnackbarMessage('Failed to load chess engine');
        setShowSnackbar(true);
      }
    };
    initEngine();
    
    return () => {
      if (activeClockInterval) {
        clearInterval(activeClockInterval);
      }
    };
  }, []);
  
  // Make computer move
  const makeComputerMove = useCallback(async () => {
    if (!engine || thinking || gameStatus !== 'playing') return;
    if (game.isGameOver()) return;
    
    const currentTurn = game.turn();
    const isComputerTurn = (currentTurn === 'w' && playerColor === 'black') || 
                          (currentTurn === 'b' && playerColor === 'white');
    
    if (!isComputerTurn) return;
    
    setThinking(true);
    
    try {
      // Calculate depth based on difficulty
      const depth = Math.max(1, Math.min(20, difficulty * 2));
      
      // Get best move from engine
      const analysis = await engine.analyze(fen, depth, timePerMove);
      
      if (analysis.bestMove && gameStatus === 'playing') {
        const move = {
          from: analysis.bestMove.substring(0, 2),
          to: analysis.bestMove.substring(2, 4),
          promotion: analysis.bestMove[4] || undefined
        };
        
        const result = game.move(move);
        
        if (result) {
          const newFen = game.fen();
          setFen(newFen);
          
          // Update move history
          const newHistory = moveHistory.slice(0, currentMoveIndex + 1);
          newHistory.push({
            move: result,
            fen: newFen,
            san: result.san,
            evaluation: analysis.score || analysis.mate
          });
          setMoveHistory(newHistory);
          setCurrentMoveIndex(newHistory.length - 1);
          
          // Update evaluation
          if (showEvaluation) {
            setEvaluation({
              score: analysis.score,
              mate: analysis.mate,
              depth: analysis.depth
            });
          }
          
          // Check game status
          checkGameStatus();
        }
      }
    } catch (error) {
      console.error('Computer move error:', error);
    } finally {
      setThinking(false);
    }
  }, [engine, fen, game, gameStatus, difficulty, timePerMove, thinking, playerColor, moveHistory, currentMoveIndex, showEvaluation]);
  
  // Handle human move
  const handleMove = useCallback((move) => {
    if (gameStatus !== 'playing' || thinking) return false;
    
    const currentTurn = game.turn();
    const isPlayerTurn = (currentTurn === 'w' && playerColor === 'white') || 
                        (currentTurn === 'b' && playerColor === 'black');
    
    if (!isPlayerTurn) return false;
    
    try {
      const result = game.move(move);
      
      if (result) {
        const newFen = game.fen();
        setFen(newFen);
        
        // Update move history
        const newHistory = moveHistory.slice(0, currentMoveIndex + 1);
        newHistory.push({
          move: result,
          fen: newFen,
          san: result.san
        });
        setMoveHistory(newHistory);
        setCurrentMoveIndex(newHistory.length - 1);
        
        // Clear hints
        setHintMove(null);
        
        // Check game status
        checkGameStatus();
        
        // Trigger computer move
        setTimeout(() => {
          makeComputerMove();
        }, 100);
        
        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    
    return false;
  }, [game, gameStatus, thinking, playerColor, moveHistory, currentMoveIndex, makeComputerMove]);
  
  // Check game status
  const checkGameStatus = () => {
    if (game.isCheckmate()) {
      setGameStatus('ended');
      const winner = game.turn() === 'w' ? 'Black' : 'White';
      setSnackbarMessage(`Checkmate! ${winner} wins!`);
      setShowSnackbar(true);
      saveGame('checkmate', winner);
    } else if (game.isDraw()) {
      setGameStatus('ended');
      setSnackbarMessage('Game drawn!');
      setShowSnackbar(true);
      saveGame('draw');
    } else if (game.isCheck()) {
      setSnackbarMessage('Check!');
      setShowSnackbar(true);
    }
  };
  
  // Save game to database
  const saveGame = async (result, winner = null) => {
    try {
      const db = await getGameDatabase();
      
      const gameData = {
        pgn: game.pgn(),
        white: playerColor === 'white' ? 'Player' : `Computer (Level ${difficulty})`,
        black: playerColor === 'black' ? 'Player' : `Computer (Level ${difficulty})`,
        result: winner === 'White' ? '1-0' : winner === 'Black' ? '0-1' : '1/2-1/2',
        timeControl: timeControl ? `${timeControl.initial}+${timeControl.increment}` : 'unlimited',
        moves: moveHistory.map(m => m.san),
        date: new Date().toISOString()
      };
      
      await db.saveGame(gameData);
      setSnackbarMessage('Game saved to database');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  };
  
  // Start new game
  const startNewGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
    setGameStatus('playing');
    setEvaluation(null);
    setBestMove(null);
    setHintMove(null);
    setShowNewGameDialog(false);
    
    // Set up clocks if time control is enabled
    if (timeControl) {
      const initialTime = timeControl.initial * 60 * 1000; // Convert to milliseconds
      setWhiteClock(initialTime);
      setBlackClock(initialTime);
    }
    
    // If computer plays white, make first move
    if (playerColor === 'black') {
      setTimeout(() => {
        makeComputerMove();
      }, 500);
    }
  };
  
  // Get hint
  const getHint = async () => {
    if (!engine || thinking || gameStatus !== 'playing') return;
    
    setThinking(true);
    try {
      const analysis = await engine.analyze(fen, 15);
      if (analysis.bestMove) {
        setHintMove({
          from: analysis.bestMove.substring(0, 2),
          to: analysis.bestMove.substring(2, 4)
        });
        
        setTimeout(() => {
          setHintMove(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to get hint:', error);
    } finally {
      setThinking(false);
    }
  };
  
  // Undo move
  const undoMove = () => {
    if (currentMoveIndex < 0 || thinking) return;
    
    // Undo two moves (player and computer)
    let movesToUndo = 2;
    if (currentMoveIndex === 0) movesToUndo = 1;
    
    const newGame = new Chess();
    const targetIndex = Math.max(-1, currentMoveIndex - movesToUndo);
    
    for (let i = 0; i <= targetIndex; i++) {
      newGame.move(moveHistory[i].move);
    }
    
    setGame(newGame);
    setFen(newGame.fen());
    setCurrentMoveIndex(targetIndex);
  };
  
  // Flip board
  const flipBoard = () => {
    setPlayerColor(playerColor === 'white' ? 'black' : 'white');
  };
  
  // Format time for display
  const formatTime = (ms) => {
    if (!ms) return '--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Get evaluation display
  const getEvalDisplay = () => {
    if (!evaluation) return null;
    
    if (evaluation.mate !== null) {
      return `M${Math.abs(evaluation.mate)}`;
    }
    
    const score = playerColor === 'white' ? evaluation.score : -evaluation.score;
    return score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
  };
  
  // Trigger computer move when needed
  useEffect(() => {
    if (gameStatus === 'playing' && !thinking) {
      const currentTurn = game.turn();
      const isComputerTurn = (currentTurn === 'w' && playerColor === 'black') || 
                            (currentTurn === 'b' && playerColor === 'white');
      
      if (isComputerTurn) {
        makeComputerMove();
      }
    }
  }, [gameStatus, fen, makeComputerMove]);
  
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Board Section */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            {/* Game Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                Play vs Computer
              </Typography>
              
              {thinking && (
                <Chip
                  icon={<ThinkingIcon />}
                  label="Computer thinking..."
                  color="primary"
                  size="small"
                />
              )}
              
              {evaluation && showEvaluation && gameStatus === 'playing' && (
                <Chip
                  label={getEvalDisplay()}
                  color={evaluation.score > 0 ? 'success' : evaluation.score < 0 ? 'error' : 'default'}
                  size="small"
                />
              )}
            </Box>
            
            {/* Time Display */}
            {timeControl && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Chip
                  icon={<ClockIcon />}
                  label={`Black: ${formatTime(blackClock)}`}
                  variant={game.turn() === 'b' ? 'filled' : 'outlined'}
                />
                <Chip
                  icon={<ClockIcon />}
                  label={`White: ${formatTime(whiteClock)}`}
                  variant={game.turn() === 'w' ? 'filled' : 'outlined'}
                />
              </Box>
            )}
            
            {/* Chess Board */}
            <ChessboardComponent
              fen={fen}
              onMove={handleMove}
              orientation={playerColor}
              allowMoves={gameStatus === 'playing' && !thinking}
              highlightedSquares={hintMove ? [hintMove.from, hintMove.to] : []}
            />
            
            {/* Board Controls */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Tooltip title="New Game">
                <IconButton onClick={() => setShowNewGameDialog(true)} color="primary">
                  <NewGameIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Undo Move">
                <IconButton 
                  onClick={undoMove} 
                  disabled={currentMoveIndex < 0 || thinking || gameStatus !== 'playing'}
                >
                  <UndoIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Get Hint">
                <IconButton 
                  onClick={getHint} 
                  disabled={thinking || gameStatus !== 'playing' || !showHints}
                  color="info"
                >
                  <Psychology />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Flip Board">
                <IconButton onClick={flipBoard}>
                  <FlipIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Analyze Position">
                <IconButton 
                  onClick={() => {/* Navigate to analysis */}} 
                  color="secondary"
                >
                  <AnalyzeIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Save Game">
                <IconButton 
                  onClick={() => saveGame('*')} 
                  disabled={moveHistory.length === 0}
                  color="success"
                >
                  <SaveIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
        
        {/* Settings & Info Panel */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Game Settings
            </Typography>
            
            {/* Difficulty Slider */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>
                Difficulty: {difficulty}
              </Typography>
              <Slider
                value={difficulty}
                onChange={(e, v) => setDifficulty(v)}
                min={1}
                max={10}
                marks
                disabled={gameStatus === 'playing'}
                color="primary"
              />
            </Box>
            
            {/* Settings Switches */}
            <FormControlLabel
              control={
                <Switch
                  checked={showHints}
                  onChange={(e) => setShowHints(e.target.checked)}
                />
              }
              label="Show Hints"
              sx={{ display: 'block', mb: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={showEvaluation}
                  onChange={(e) => setShowEvaluation(e.target.checked)}
                />
              }
              label="Show Evaluation"
              sx={{ display: 'block', mb: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={useOpeningBook}
                  onChange={(e) => setUseOpeningBook(e.target.checked)}
                  disabled={gameStatus === 'playing'}
                />
              }
              label="Use Opening Book"
              sx={{ display: 'block', mb: 3 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            {/* Move History */}
            <Typography variant="h6" gutterBottom>
              Moves
            </Typography>
            
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              <List dense>
                {moveHistory.map((move, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${Math.floor(index / 2) + 1}${index % 2 === 0 ? '.' : '...'} ${move.san}`}
                      secondary={move.evaluation ? `Eval: ${move.evaluation}` : null}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            
            {/* Game Status */}
            {gameStatus === 'ended' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Game Over! Start a new game to play again.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* New Game Dialog */}
      <Dialog open={showNewGameDialog} onClose={() => setShowNewGameDialog(false)}>
        <DialogTitle>New Game Settings</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Play as</InputLabel>
            <Select
              value={playerColor}
              onChange={(e) => setPlayerColor(e.target.value)}
              label="Play as"
            >
              <MenuItem value="white">White</MenuItem>
              <MenuItem value="black">Black</MenuItem>
              <MenuItem value="random">Random</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Time Control</InputLabel>
            <Select
              value={timeControl ? `${timeControl.initial}+${timeControl.increment}` : 'unlimited'}
              onChange={(e) => {
                if (e.target.value === 'unlimited') {
                  setTimeControl(null);
                } else {
                  const [initial, increment] = e.target.value.split('+').map(Number);
                  setTimeControl({ initial, increment });
                }
              }}
              label="Time Control"
            >
              <MenuItem value="unlimited">Unlimited</MenuItem>
              <MenuItem value="1+0">Bullet (1+0)</MenuItem>
              <MenuItem value="3+0">Blitz (3+0)</MenuItem>
              <MenuItem value="3+2">Blitz (3+2)</MenuItem>
              <MenuItem value="5+0">Blitz (5+0)</MenuItem>
              <MenuItem value="5+3">Blitz (5+3)</MenuItem>
              <MenuItem value="10+0">Rapid (10+0)</MenuItem>
              <MenuItem value="10+5">Rapid (10+5)</MenuItem>
              <MenuItem value="15+10">Rapid (15+10)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewGameDialog(false)}>Cancel</Button>
          <Button onClick={startNewGame} variant="contained" color="primary">
            Start Game
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default ComputerGame;
