import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { getStockfish } from '../../services/stockfish';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  IconButton,
  Slider,
  TextField,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Grid,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
  FirstPage as FirstIcon,
  LastPage as LastIcon,
  FlipCameraAndroid as FlipIcon,
  CloudDownload as ImportIcon,
  CloudUpload as ExportIcon,
  Computer as EngineIcon,
  Assessment as EvalIcon,
  Lightbulb as HintIcon,
  ContentCopy as CopyIcon,
  Delete as ClearIcon
} from '@mui/icons-material';

const AnalysisBoard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Chess game state
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [pgn, setPgn] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [orientation, setOrientation] = useState('white');
  const [gameStatus, setGameStatus] = useState(null); // checkmate, stalemate, draw, check, normal
  
  // Analysis state
  const [engine, setEngine] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [bestMoves, setBestMoves] = useState([]);
  const [depth, setDepth] = useState(20);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  
  // UI state
  const [showVariations, setShowVariations] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000);
  const autoPlayRef = useRef(null);
  
  // Board size calculation
  const getBoardSize = () => {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    
    if (vw > 1024) {
      return Math.min(vh * 0.65, 650);
    } else if (vw > 768) {
      return Math.min(vw * 0.55, 500);
    } else {
      return Math.min(vw * 0.85, 400);
    }
  };
  
  const [boardSize, setBoardSize] = useState(getBoardSize());
  
  // Initialize Stockfish engine
  useEffect(() => {
    const initEngine = async () => {
      try {
        const stockfish = await getStockfish();
        setEngine(stockfish);
      } catch (error) {
        console.error('Failed to load engine:', error);
      }
    };
    initEngine();
    
    const handleResize = () => setBoardSize(getBoardSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Auto-analyze on position change
  useEffect(() => {
    if (autoAnalyze && engine && !analyzing) {
      analyzePosition();
    }
  }, [fen, autoAnalyze]);
  
  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && currentMoveIndex < moveHistory.length - 1) {
      autoPlayRef.current = setTimeout(() => {
        goToMove(currentMoveIndex + 1);
      }, playSpeed);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [autoPlay, currentMoveIndex, playSpeed, moveHistory]);
  
  const analyzePosition = async () => {
    if (!engine || analyzing) return;
    
    setAnalyzing(true);
    try {
      const analysis = await engine.analyze(fen, depth);
      setEvaluation({
        score: analysis.score,
        mate: analysis.mate,
        bestMove: analysis.bestMove,
        depth: analysis.depth
      });
      
      const topMoves = await engine.getTopMoves(fen, 3, depth);
      setBestMoves(topMoves);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };
  
  const onDrop = (sourceSquare, targetSquare) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });
      
      if (move) {
        const newFen = game.fen();
        setFen(newFen);
        
        // Update move history
        const newHistory = moveHistory.slice(0, currentMoveIndex + 1);
        newHistory.push({
          move,
          fen: newFen,
          san: move.san,
          annotation: getAnnotation(move, game)
        });
        setMoveHistory(newHistory);
        setCurrentMoveIndex(newHistory.length - 1);
        setPgn(game.pgn());
        
        // Check game status
        updateGameStatus();
        
        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    return false;
  };
  
  const updateGameStatus = () => {
    if (game.isCheckmate()) {
      setGameStatus('checkmate');
    } else if (game.isStalemate()) {
      setGameStatus('stalemate');
    } else if (game.isDraw()) {
      setGameStatus('draw');
    } else if (game.isCheck()) {
      setGameStatus('check');
    } else {
      setGameStatus('normal');
    }
  };
  
  const getAnnotation = (move, gameState) => {
    let annotation = '';
    if (move.flags.includes('c')) annotation = 'x'; // Capture
    if (gameState.isCheck()) annotation += '+';
    if (gameState.isCheckmate()) annotation = '#';
    if (move.flags.includes('k')) annotation = 'O-O'; // Kingside castle
    if (move.flags.includes('q')) annotation = 'O-O-O'; // Queenside castle
    return annotation;
  };
  
  const goToMove = (index) => {
    if (index < -1 || index >= moveHistory.length) return;
    
    const newGame = new Chess();
    
    if (index >= 0) {
      for (let i = 0; i <= index; i++) {
        newGame.move(moveHistory[i].move);
      }
    }
    
    setGame(newGame);
    setFen(newGame.fen());
    setCurrentMoveIndex(index);
    setPgn(newGame.pgn());
    updateGameStatus();
  };
  
  const flipBoard = () => {
    setOrientation(orientation === 'white' ? 'black' : 'white');
  };
  
  const clearBoard = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setPgn('');
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
    setEvaluation(null);
    setBestMoves([]);
  };
  
  const importPGN = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pgn';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const pgnText = event.target.result;
        loadPGN(pgnText);
      };
      reader.readAsText(file);
    };
    input.click();
  };
  
  const loadPGN = (pgnText) => {
    try {
      const newGame = new Chess();
      newGame.loadPgn(pgnText);
      
      // Build move history
      const history = [];
      const moves = newGame.history({ verbose: true });
      
      const tempGame = new Chess();
      moves.forEach(move => {
        tempGame.move(move);
        history.push({
          move,
          fen: tempGame.fen(),
          san: move.san
        });
      });
      
      setGame(newGame);
      setFen(newGame.fen());
      setPgn(pgnText);
      setMoveHistory(history);
      setCurrentMoveIndex(history.length - 1);
    } catch (error) {
      console.error('Failed to load PGN:', error);
    }
  };
  
  const exportPGN = () => {
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game_${Date.now()}.pgn`;
    a.click();
  };
  
  const copyFEN = () => {
    navigator.clipboard.writeText(fen);
  };
  
  const getEvalDisplay = () => {
    if (!evaluation) return '0.0';
    
    if (evaluation.mate !== null) {
      return `M${Math.abs(evaluation.mate)}`;
    }
    
    const score = game.turn() === 'w' ? evaluation.score : -evaluation.score;
    return score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
  };
  
  const getEvalBarHeight = () => {
    if (!evaluation) return 50;
    
    if (evaluation.mate !== null) {
      return evaluation.mate > 0 ? 100 : 0;
    }
    
    const score = Math.max(-10, Math.min(10, evaluation.score));
    return 50 + (score * 5);
  };
  
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Grid container spacing={2} sx={{ flex: 1, p: 2 }}>
        {/* Board Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Board Controls */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ButtonGroup size="small">
                <Tooltip title="First move">
                  <IconButton onClick={() => goToMove(-1)} disabled={currentMoveIndex < 0}>
                    <FirstIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Previous move">
                  <IconButton onClick={() => goToMove(currentMoveIndex - 1)} disabled={currentMoveIndex < 0}>
                    <PrevIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={autoPlay ? 'Pause' : 'Play'}>
                  <IconButton onClick={() => setAutoPlay(!autoPlay)}>
                    {autoPlay ? <PauseIcon /> : <PlayIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Next move">
                  <IconButton onClick={() => goToMove(currentMoveIndex + 1)} disabled={currentMoveIndex >= moveHistory.length - 1}>
                    <NextIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Last move">
                  <IconButton onClick={() => goToMove(moveHistory.length - 1)} disabled={currentMoveIndex >= moveHistory.length - 1}>
                    <LastIcon />
                  </IconButton>
                </Tooltip>
              </ButtonGroup>
              
              <ButtonGroup size="small">
                <Tooltip title="Flip board">
                  <IconButton onClick={flipBoard}>
                    <FlipIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Analyze position">
                  <IconButton onClick={analyzePosition} disabled={analyzing}>
                    <EngineIcon color={autoAnalyze ? 'primary' : 'default'} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Import PGN">
                  <IconButton onClick={importPGN}>
                    <ImportIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export PGN">
                  <IconButton onClick={exportPGN} disabled={!pgn}>
                    <ExportIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear board">
                  <IconButton onClick={clearBoard}>
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              </ButtonGroup>
            </Box>
            
            {/* Chess Board with Evaluation Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {/* Evaluation Bar */}
                {!isMobile && (
                  <Paper sx={{ width: 40, height: boardSize, position: 'relative', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        height: `${getEvalBarHeight()}%`,
                        bgcolor: 'common.white',
                        transition: 'height 0.3s ease',
                        borderTop: '2px solid',
                        borderColor: 'divider'
                      }}
                    />
                    <Typography
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}
                    >
                      {getEvalDisplay()}
                    </Typography>
                  </Paper>
                )}
                
                {/* Chess Board */}
                <Chessboard
                  position={fen}
                  onPieceDrop={onDrop}
                  boardOrientation={orientation}
                  boardWidth={boardSize}
                  customDarkSquareStyle={{ backgroundColor: '#b58863' }}
                  customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Analysis Panel */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Analysis
            </Typography>
            
            {/* Engine Analysis */}
            {analyzing && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">Analyzing position...</Typography>
              </Box>
            )}
            
            {evaluation && !analyzing && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Evaluation
                  </Typography>
                  <Typography variant="h5" color={evaluation.score > 0 ? 'success.main' : evaluation.score < 0 ? 'error.main' : 'text.primary'}>
                    {getEvalDisplay()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Depth: {evaluation.depth}
                  </Typography>
                </CardContent>
              </Card>
            )}
            
            {/* Best Moves */}
            {bestMoves.length > 0 && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Best Lines
                  </Typography>
                  <List dense>
                    {bestMoves.map((line, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={line.moves.slice(0, 5).join(' ')}
                          secondary={`Score: ${line.score ? line.score.toFixed(1) : 'M' + line.mate}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
            
            {/* Game Status Alert */}
            {gameStatus && gameStatus !== 'normal' && (
              <Alert 
                severity={
                  gameStatus === 'checkmate' ? 'success' :
                  gameStatus === 'check' ? 'warning' :
                  'info'
                }
                sx={{ mb: 2 }}
              >
                {gameStatus === 'checkmate' && `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`}
                {gameStatus === 'stalemate' && 'Stalemate - Draw!'}
                {gameStatus === 'draw' && 'Draw!'}
                {gameStatus === 'check' && 'Check!'}
              </Alert>
            )}
            
            {/* Move History */}
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Moves
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {moveHistory.map((move, index) => {
                    const moveNumber = Math.floor(index / 2) + 1;
                    const isWhite = index % 2 === 0;
                    const notation = move.san + (move.annotation || '');
                    
                    return (
                      <Chip
                        key={index}
                        label={`${moveNumber}${isWhite ? '.' : '...'} ${notation}`}
                        onClick={() => goToMove(index)}
                        color={index === currentMoveIndex ? 'primary' : 'default'}
                        size="small"
                      />
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
            
            {/* Settings */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Analysis Depth
              </Typography>
              <Slider
                value={depth}
                onChange={(e, v) => setDepth(v)}
                min={10}
                max={30}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalysisBoard;
