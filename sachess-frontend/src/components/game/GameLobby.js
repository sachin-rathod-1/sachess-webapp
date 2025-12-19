import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';

const TimeControlCard = styled(Card)(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}));

const SearchingOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
}));

const timeControls = [
  { label: 'Bullet', time: 1, increment: 0, description: '1 min' },
  { label: 'Bullet', time: 2, increment: 1, description: '2+1' },
  { label: 'Blitz', time: 3, increment: 0, description: '3 min' },
  { label: 'Blitz', time: 5, increment: 0, description: '5 min' },
  { label: 'Blitz', time: 5, increment: 3, description: '5+3' },
  { label: 'Rapid', time: 10, increment: 0, description: '10 min' },
  { label: 'Rapid', time: 15, increment: 10, description: '15+10' },
  { label: 'Classical', time: 30, increment: 0, description: '30 min' }
];

const GameLobby = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    isSearching,
    waitingGames,
    startMatchmaking,
    cancelMatchmaking,
    createGame,
    joinGame,
    createInvitation,
    acceptInvitation,
    fetchWaitingGames,
    currentGame
  } = useGame();

  const [selectedTimeControl, setSelectedTimeControl] = useState(timeControls[5]); // 10 min default
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWaitingGames();
      const interval = setInterval(fetchWaitingGames, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchWaitingGames]);

  useEffect(() => {
    if (currentGame && currentGame.status === 'ACTIVE') {
      navigate(`/play/${currentGame.id}`);
    }
  }, [currentGame, navigate]);

  const handlePlayOnline = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await startMatchmaking(selectedTimeControl.time, selectedTimeControl.increment);
    } catch (err) {
      setError('Failed to start matchmaking');
    }
  };

  const handleCancelSearch = async () => {
    await cancelMatchmaking();
  };

  const handleCreateInvite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const code = await createInvitation(selectedTimeControl.time, selectedTimeControl.increment);
      setInviteCode(code);
      setInviteDialogOpen(true);
    } catch (err) {
      setError('Failed to create invitation');
    }
  };

  const handleJoinWithCode = async () => {
    if (!joinCode.trim()) return;
    try {
      await acceptInvitation(joinCode.trim().toUpperCase());
      setJoinDialogOpen(false);
      setJoinCode('');
    } catch (err) {
      setError('Invalid or expired invitation code');
    }
  };

  const handleJoinGame = async (gameId) => {
    try {
      await joinGame(gameId);
    } catch (err) {
      setError('Failed to join game');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreatePrivateGame = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const game = await createGame(selectedTimeControl.time, selectedTimeControl.increment);
      navigate(`/play/${game.id}`);
    } catch (err) {
      setError('Failed to create game');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <AnimatePresence>
        {isSearching && (
          <SearchingOverlay
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
            <Typography variant="h5" color="white" gutterBottom>
              Finding opponent...
            </Typography>
            <Typography variant="body1" color="grey.400" sx={{ mb: 3 }}>
              {selectedTimeControl.description} game
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancelSearch}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Cancel
            </Button>
          </SearchingOverlay>
        )}
      </AnimatePresence>

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Play Chess
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Time Control Selection */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon /> Select Time Control
              </Typography>
              <Grid container spacing={2}>
                {timeControls.map((tc, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <TimeControlCard
                      selected={selectedTimeControl === tc}
                      onClick={() => setSelectedTimeControl(tc)}
                      component={motion.div}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h5" fontWeight="bold">
                          {tc.description}
                        </Typography>
                        <Chip
                          label={tc.label}
                          size="small"
                          color={tc.label === 'Bullet' ? 'error' : tc.label === 'Blitz' ? 'warning' : 'success'}
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </TimeControlCard>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Play Buttons */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  onClick={handlePlayOnline}
                  sx={{ py: 2, fontSize: '1.1rem' }}
                  component={motion.button}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Play Online
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<PersonAddIcon />}
                  onClick={handleCreateInvite}
                  sx={{ py: 2, fontSize: '1.1rem' }}
                  component={motion.button}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Play with Friend
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => setJoinDialogOpen(true)}
                  sx={{ py: 2 }}
                >
                  Join with Code
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleCreatePrivateGame}
                  sx={{ py: 2 }}
                >
                  Create Private Game
                </Button>
              </Grid>
            </Grid>
          </Grid>

          {/* Waiting Games */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon /> Open Games
                </Typography>
                <IconButton onClick={fetchWaitingGames} size="small">
                  <RefreshIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {waitingGames.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No open games available
                </Typography>
              ) : (
                <List>
                  {waitingGames.slice(0, 5).map((game) => (
                    <ListItem
                      key={game.id}
                      component={motion.div}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      sx={{ bgcolor: 'background.default', borderRadius: 1, mb: 1 }}
                    >
                      <ListItemAvatar>
                        <Avatar>{game.whitePlayer?.username?.[0] || '?'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={game.whitePlayer?.username || 'Anonymous'}
                        secondary={`${game.timeControlMinutes}+${game.incrementSeconds} • ${game.whitePlayer?.rating || 1200}`}
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleJoinGame(game.id)}
                          disabled={game.whitePlayer?.id === user?.id}
                        >
                          Join
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite a Friend</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Share this code with your friend:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              value={inviteCode}
              InputProps={{
                readOnly: true,
                sx: { fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }
              }}
            />
            <IconButton onClick={handleCopyCode} color={copied ? 'success' : 'default'}>
              <ContentCopyIcon />
            </IconButton>
          </Box>
          {copied && (
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              Copied to clipboard!
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Time control: {selectedTimeControl.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Join Dialog */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Join Game</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Enter the invitation code:
          </Typography>
          <TextField
            fullWidth
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            sx={{ mt: 2 }}
            inputProps={{ style: { textTransform: 'uppercase' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleJoinWithCode} disabled={!joinCode.trim()}>
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GameLobby;
