import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import ChessboardComponent from '../chessboard/Chessboard';
import GameClock from './GameClock';
import { getSoundEffects } from '../../services/soundEffects';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  LinearProgress,
  Alert,
  Collapse,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FlagIcon from '@mui/icons-material/Flag';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import GameChat from './GameChat';

const PlayerCard = styled(Paper)(({ theme, active }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  backgroundColor: active ? theme.palette.primary.light : theme.palette.background.paper,
  color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
  transition: 'all 0.3s ease'
}));

const TimerDisplay = styled(Box)(({ theme, low }) => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  backgroundColor: low ? theme.palette.error.main : theme.palette.grey[200],
  color: low ? theme.palette.error.contrastText : theme.palette.text.primary
}));

const ChessboardContainer = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  maxWidth: 600,
  margin: '0 auto'
}));

const AnalysisBar = styled(Box)(({ theme, evaluation }) => ({
  height: 20,
  borderRadius: 4,
  overflow: 'hidden',
  backgroundColor: theme.palette.grey[800],
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: `${Math.min(100, Math.max(0, 50 + evaluation / 20))}%`,
    backgroundColor: theme.palette.common.white,
    transition: 'width 0.3s ease'
  }
}));

const MultiplayerGame = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentGame,
    loadGame,
    makeMove,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    requestAnalysis,
    analysis,
    leaveGame
  } = useGame();

  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState({});
  const [lastMove, setLastMove] = useState(null);
  const [resignDialogOpen, setResignDialogOpen] = useState(false);
  const [drawDialogOpen, setDrawDialogOpen] = useState(false);
  const [gameOverDialogOpen, setGameOverDialogOpen] = useState(false);
  const [timeControl, setTimeControl] = useState({ initial: 600000, increment: 0 }); // 10+0
  const [whiteTime, setWhiteTime] = useState(600000); // 10 minutes in ms
  const [blackTime, setBlackTime] = useState(600000);
  const [isClockRunning, setIsClockRunning] = useState(false);
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, playing, checkmate, draw, timeout
  const [gameResult, setGameResult] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);
  const [playerColor, setPlayerColor] = useState('white');
  const soundEffects = getSoundEffects();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const timerRef = useRef(null);
  const stompClient = useRef(null);

  // Load game on mount
  useEffect(() => {
    if (gameId) {
      loadGame(gameId).catch(() => {
        navigate('/play');
      });
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameId, loadGame, navigate]);

  // Update game state when currentGame changes
  useEffect(() => {
    if (currentGame) {
      try {
        const newGame = new Chess(currentGame.currentFen);
        setGame(newGame);
      } catch (e) {
        console.error('Invalid FEN:', e);
      }

      // Set board orientation and player color based on player
      if (user) {
        if (currentGame.blackPlayer?.id === user.id) {
          setBoardOrientation('black');
          setPlayerColor('black');
        } else {
          setBoardOrientation('white');
          setPlayerColor('white');
        }
      }
      
      // Set game status
      if (currentGame.status === 'ACTIVE') {
        setGameStatus('playing');
        // Start clock if game has moves
        if (currentGame.moves?.length > 0 && !isClockRunning) {
          setIsClockRunning(true);
        }
      }

      // Update timers
      setWhiteTime(currentGame.whiteTimeRemaining || 600000);
      setBlackTime(currentGame.blackTimeRemaining || 600000);

      // Check for game over
      if (currentGame.status === 'COMPLETED' && currentGame.result) {
        setGameOverDialogOpen(true);
      }
    }
  }, [currentGame, user]);

  // Timer countdown
  useEffect(() => {
    if (currentGame?.status === 'ACTIVE') {
      timerRef.current = setInterval(() => {
        if (currentGame.currentTurn === 'WHITE') {
          setWhiteTime(prev => Math.max(0, prev - 100));
        } else {
          setBlackTime(prev => Math.max(0, prev - 100));
        }
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentGame?.status, currentGame?.currentTurn]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isMyTurn = useCallback(() => {
    if (!currentGame || !user) return false;
    const isWhite = currentGame.whitePlayer?.id === user.id;
    return (isWhite && currentGame.currentTurn === 'WHITE') ||
           (!isWhite && currentGame.currentTurn === 'BLACK');
  }, [currentGame, user]);

  const getMoveOptions = useCallback((square) => {
    if (!isMyTurn()) return {};

    const moves = game.moves({
      square,
      verbose: true
    });

    if (moves.length === 0) return {};

    const newSquares = {};
    moves.forEach((move) => {
      newSquares[move.to] = {
        background: game.get(move.to)
          ? 'radial-gradient(circle, rgba(255,0,0,.3) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
    });

    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };

    return newSquares;
  }, [game, isMyTurn]);

  const onSquareClick = useCallback((square) => {
    if (!isMyTurn()) return;

    // If we have a selected square, try to make a move
    if (selectedSquare) {
      const moves = game.moves({
        square: selectedSquare,
        verbose: true
      });

      const foundMove = moves.find(m => m.from === selectedSquare && m.to === square);

      if (foundMove) {
        // Check for promotion
        const promotion = foundMove.promotion ? 'q' : null;
        
        // Send move to server
        makeMove(selectedSquare, square, promotion);
        
        setLastMove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setPossibleMoves({});
        return;
      }
    }

    // Select new square
    const piece = game.get(square);
    if (piece) {
      const isWhitePiece = piece.color === 'w';
      const isWhitePlayer = currentGame?.whitePlayer?.id === user?.id;

      if ((isWhitePiece && isWhitePlayer) || (!isWhitePiece && !isWhitePlayer)) {
        setSelectedSquare(square);
        setPossibleMoves(getMoveOptions(square));
        return;
      }
    }

    setSelectedSquare(null);
    setPossibleMoves({});
  }, [selectedSquare, game, isMyTurn, makeMove, getMoveOptions, currentGame, user]);

  const onPieceDrop = useCallback((sourceSquare, targetSquare) => {
    if (!isMyTurn()) return false;

    const moves = game.moves({
      square: sourceSquare,
      verbose: true
    });

    const foundMove = moves.find(m => m.from === sourceSquare && m.to === targetSquare);

    if (foundMove) {
      const promotion = foundMove.promotion ? 'q' : null;
      makeMove(sourceSquare, targetSquare, promotion);
      setLastMove({ from: sourceSquare, to: targetSquare });
      return true;
    }

    return false;
  }, [game, isMyTurn, makeMove]);

  const handleResign = () => {
    resign();
    setResignDialogOpen(false);
  };

  const handleOfferDraw = () => {
    offerDraw();
    setDrawDialogOpen(false);
  };

  const handleAcceptDraw = () => {
    acceptDraw();
  };

  const handleDeclineDraw = () => {
    declineDraw();
  };

  const handleRequestAnalysis = () => {
    setShowAnalysis(true);
    requestAnalysis(currentGame?.currentFen);
  };

  const handleBackToLobby = () => {
    leaveGame();
    navigate('/play');
  };

  const getGameResultText = () => {
    if (!currentGame?.result) return '';
    
    const results = {
      'WHITE_WINS': 'White wins!',
      'BLACK_WINS': 'Black wins!',
      'DRAW': 'Draw!',
      'STALEMATE': 'Stalemate!',
      'WHITE_TIMEOUT': 'White ran out of time!',
      'BLACK_TIMEOUT': 'Black ran out of time!',
      'WHITE_RESIGNED': 'White resigned!',
      'BLACK_RESIGNED': 'Black resigned!'
    };

    return results[currentGame.result] || currentGame.result;
  };

  const getResultForPlayer = () => {
    if (!currentGame?.result || !user) return null;
    
    const isWhite = currentGame.whitePlayer?.id === user.id;
    const whiteWins = ['WHITE_WINS', 'BLACK_TIMEOUT', 'BLACK_RESIGNED'].includes(currentGame.result);
    const blackWins = ['BLACK_WINS', 'WHITE_TIMEOUT', 'WHITE_RESIGNED'].includes(currentGame.result);
    
    if ((isWhite && whiteWins) || (!isWhite && blackWins)) return 'win';
    if ((isWhite && blackWins) || (!isWhite && whiteWins)) return 'loss';
    return 'draw';
  };

  // Find king square for check highlighting
  const getKingSquare = useCallback(() => {
    const board = game.board();
    const turn = game.turn();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'k' && piece.color === turn) {
          const file = String.fromCharCode(97 + col); // a-h
          const rank = 8 - row; // 1-8
          return `${file}${rank}`;
        }
      }
    }
    return null;
  }, [game]);

  const kingSquare = game.inCheck() ? getKingSquare() : null;

  const customSquareStyles = {
    ...possibleMoves,
    ...(lastMove ? {
      [lastMove.from]: { backgroundColor: 'rgba(255, 255, 0, 0.3)' },
      [lastMove.to]: { backgroundColor: 'rgba(255, 255, 0, 0.3)' }
    } : {}),
    ...(kingSquare ? {
      [kingSquare]: { backgroundColor: 'rgba(255, 0, 0, 0.5)' }
    } : {})
  };

  const handleMove = useCallback((move) => {
    if (!isMyTurn() || gameStatus !== 'playing') return false;
    
    try {
      const result = game.move(move);
      if (result) {
        const newFen = game.fen();
        setFen(newFen);
        setMoveHistory(prev => [...prev, result]);
        
        // Play move sound
        soundEffects.playMoveSound(result);
        
        // Send move via WebSocket if available
        if (stompClient.current && stompClient.current.connected) {
          stompClient.current.send(`/app/game/${gameId}/move`, {}, JSON.stringify({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
            fen: newFen
          }));
        }
        
        // Start clock if first move
        if (moveHistory.length === 0 && !isClockRunning) {
          setIsClockRunning(true);
          soundEffects.playGameStartSound();
        }
        
        // Check game status
        checkGameStatus();
        
        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    
    return false;
  }, [game, gameId, gameStatus, moveHistory, isClockRunning, isMyTurn]);

  const checkGameStatus = () => {
    if (game.isCheckmate()) {
      setGameStatus('checkmate');
      setIsClockRunning(false);
      const winner = game.turn() === 'w' ? 'Black' : 'White';
      setGameResult(`${winner} wins by checkmate!`);
      soundEffects.playGameEndSound(playerColor === winner.toLowerCase() ? 'victory' : 'defeat');
    } else if (game.isDraw()) {
      setGameStatus('draw');
      setIsClockRunning(false);
      setGameResult('Game drawn!');
      soundEffects.playGameEndSound('draw');
    } else if (game.isCheck()) {
      soundEffects.playCheckSound();
    }
  };

  const handleTimeUp = (color) => {
    setIsClockRunning(false);
    const winner = color === 'white' ? 'Black' : 'White';
    setGameStatus('timeout');
    setGameResult(`${winner} wins on time!`);
    soundEffects.playGameEndSound(playerColor === winner.toLowerCase() ? 'victory' : 'defeat');
  };

  if (!currentGame) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading game...</Typography>
      </Container>
    );
  }

  const opponent = currentGame.whitePlayer?.id === user?.id 
    ? currentGame.blackPlayer 
    : currentGame.whitePlayer;

  const myInfo = currentGame.whitePlayer?.id === user?.id 
    ? currentGame.whitePlayer 
    : currentGame.blackPlayer;

  const isWhite = currentGame.whitePlayer?.id === user?.id;

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Grid container spacing={3}>
        {/* Left Panel - Game Info */}
        <Grid item xs={12} md={3}>
          <Box sx={{ position: 'sticky', top: 80 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToLobby}
              sx={{ mb: 2 }}
            >
              Back to Lobby
            </Button>

            {/* Opponent Info */}
            <PlayerCard 
              active={!isMyTurn()} 
              sx={{ mb: 2 }}
              component={motion.div}
              animate={{ scale: !isMyTurn() ? 1.02 : 1 }}
            >
              <Avatar sx={{ width: 48, height: 48 }}>
                {opponent?.username?.[0] || '?'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {opponent?.username || 'Waiting...'}
                </Typography>
                <Typography variant="body2">
                  Rating: {opponent?.rating || '?'}
                </Typography>
              </Box>
              <TimerDisplay low={!isWhite ? whiteTime < 30000 : blackTime < 30000}>
                {formatTime(isWhite ? blackTime : whiteTime)}
              </TimerDisplay>
            </PlayerCard>

            {/* My Info */}
            <PlayerCard 
              active={isMyTurn()} 
              sx={{ mb: 2 }}
              component={motion.div}
              animate={{ scale: isMyTurn() ? 1.02 : 1 }}
            >
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                {myInfo?.username?.[0] || user?.username?.[0] || '?'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {myInfo?.username || user?.username || 'You'}
                </Typography>
                <Typography variant="body2">
                  Rating: {myInfo?.rating || user?.rating || 1200}
                </Typography>
              </Box>
              <TimerDisplay low={isWhite ? whiteTime < 30000 : blackTime < 30000}>
                {formatTime(isWhite ? whiteTime : blackTime)}
              </TimerDisplay>
            </PlayerCard>

            {/* Game Controls */}
            {currentGame.status === 'ACTIVE' && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Tooltip title="Resign">
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setResignDialogOpen(true)}
                    startIcon={<FlagIcon />}
                    fullWidth
                  >
                    Resign
                  </Button>
                </Tooltip>
                <Tooltip title="Offer Draw">
                  <Button
                    variant="outlined"
                    onClick={() => setDrawDialogOpen(true)}
                    startIcon={<HandshakeIcon />}
                    fullWidth
                  >
                    Draw
                  </Button>
                </Tooltip>
              </Box>
            )}

            {/* Draw Offer Alert */}
            {currentGame.status === 'DRAW_OFFERED' && currentGame.drawOfferedBy !== user?.id && (
              <Alert
                severity="info"
                sx={{ mb: 2 }}
                action={
                  <Box>
                    <Button color="success" size="small" onClick={handleAcceptDraw}>
                      Accept
                    </Button>
                    <Button color="error" size="small" onClick={handleDeclineDraw}>
                      Decline
                    </Button>
                  </Box>
                }
              >
                Opponent offers a draw
              </Alert>
            )}

            {/* Analysis Button */}
            <Button
              variant="outlined"
              startIcon={<AnalyticsIcon />}
              onClick={handleRequestAnalysis}
              fullWidth
              sx={{ mb: 2 }}
            >
              Analyze Position
            </Button>

            {/* Analysis Display */}
            {showAnalysis && analysis && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Engine Analysis
                </Typography>
                <AnalysisBar evaluation={analysis.evaluation} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Eval: {analysis.mate ? `Mate in ${analysis.mate}` : `${(analysis.evaluation / 100).toFixed(2)}`}
                </Typography>
                <Typography variant="body2">
                  Best: {analysis.bestMove}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Depth: {analysis.depth}
                </Typography>
              </Paper>
            )}

            {/* Game Clock */}
            <GameClock
              whiteTime={whiteTime}
              blackTime={blackTime}
              isWhiteTurn={game.turn() === 'w'}
              isRunning={isClockRunning && gameStatus === 'playing'}
              onTimeUp={handleTimeUp}
              increment={timeControl.increment}
              onTimeUpdate={(color, time) => {
                if (color === 'white') setWhiteTime(time);
                else setBlackTime(time);
              }}
            />

            {/* Game Status */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Game Info
              </Typography>
              <Typography variant="body2">
                Time: {currentGame.timeControlMinutes}+{currentGame.incrementSeconds}
              </Typography>
              <Typography variant="body2">
                Status: {currentGame.status}
              </Typography>
              <Typography variant="body2">
                Moves: {currentGame.moves?.length || 0}
              </Typography>
            </Paper>
          </Box>
        </Grid>

        {/* Center - Chessboard */}
        <Grid item xs={12} md={6}>
          <ChessboardContainer>
            <ChessboardComponent
              fen={game.fen()}
              onMove={handleMove}
              orientation={boardOrientation}
              allowMoves={isMyTurn() && gameStatus === 'playing'}
              lastMove={lastMove}
              customSquareStyles={customSquareStyles}
            />
          </ChessboardContainer>

          {/* Move History */}
          <Paper sx={{ mt: 2, p: 2, maxHeight: 150, overflow: 'auto' }}>
            <Typography variant="subtitle2" gutterBottom>
              Moves
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {currentGame.pgn || 'No moves yet'}
            </Typography>
          </Paper>
        </Grid>

        {/* Right Panel - Chat */}
        <Grid item xs={12} md={3}>
          <GameChat gameId={gameId} />
        </Grid>
      </Grid>

      {/* Resign Dialog */}
      <Dialog open={resignDialogOpen} onClose={() => setResignDialogOpen(false)}>
        <DialogTitle>Resign Game?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to resign? This will count as a loss.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResign} color="error" variant="contained">
            Resign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Draw Dialog */}
      <Dialog open={drawDialogOpen} onClose={() => setDrawDialogOpen(false)}>
        <DialogTitle>Offer Draw?</DialogTitle>
        <DialogContent>
          <Typography>Do you want to offer a draw to your opponent?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDrawDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleOfferDraw} variant="contained">
            Offer Draw
          </Button>
        </DialogActions>
      </Dialog>

      {/* Game Over Dialog */}
      <Dialog open={gameOverDialogOpen} onClose={() => setGameOverDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          Game Over
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            {getGameResultText()}
          </Typography>
          <Chip
            label={getResultForPlayer() === 'win' ? 'Victory!' : getResultForPlayer() === 'loss' ? 'Defeat' : 'Draw'}
            color={getResultForPlayer() === 'win' ? 'success' : getResultForPlayer() === 'loss' ? 'error' : 'default'}
            sx={{ fontSize: '1.2rem', py: 2, px: 3 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="contained" onClick={handleBackToLobby}>
            Back to Lobby
          </Button>
          <Button variant="outlined" onClick={() => setGameOverDialogOpen(false)}>
            Review Game
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MultiplayerGame;
