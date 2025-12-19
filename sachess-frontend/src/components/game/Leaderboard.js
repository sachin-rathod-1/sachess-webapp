import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { motion } from 'framer-motion';
import { leaderboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const RankCell = styled(TableCell)(({ theme, rank }) => ({
  fontWeight: 'bold',
  fontSize: rank <= 3 ? '1.2rem' : '1rem',
  color: rank === 1 
    ? '#FFD700' 
    : rank === 2 
      ? '#C0C0C0' 
      : rank === 3 
        ? '#CD7F32' 
        : theme.palette.text.primary
}));

const PlayerRow = styled(TableRow)(({ theme, isCurrentUser }) => ({
  backgroundColor: isCurrentUser ? theme.palette.primary.light + '20' : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

const Leaderboard = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardAPI.getLeaderboard(100);
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player =>
    player.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankIcon = (rank) => {
    if (rank === 1) return <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 28 }} />;
    if (rank === 2) return <EmojiEventsIcon sx={{ color: '#C0C0C0', fontSize: 24 }} />;
    if (rank === 3) return <EmojiEventsIcon sx={{ color: '#CD7F32', fontSize: 22 }} />;
    return rank;
  };

  const getWinRate = (player) => {
    if (player.gamesPlayed === 0) return 0;
    return Math.round((player.wins / player.gamesPlayed) * 100);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading leaderboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
            Leaderboard
          </Typography>
          <TextField
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ width: 250 }}
          />
        </Box>

        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Player</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Rating</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Games</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>W/L/D</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Win Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPlayers.map((player, index) => (
                <PlayerRow
                  key={player.id}
                  isCurrentUser={user?.id === player.id}
                  component={motion.tr}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <RankCell rank={index + 1}>
                    {getRankIcon(index + 1)}
                  </RankCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {player.username?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {player.username}
                          {user?.id === player.id && (
                            <Chip label="You" size="small" color="primary" sx={{ ml: 1 }} />
                          )}
                        </Typography>
                        {player.isOnline && (
                          <Chip label="Online" size="small" color="success" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {player.rating}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {player.gamesPlayed}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      <span style={{ color: 'green' }}>{player.wins}</span>
                      {' / '}
                      <span style={{ color: 'red' }}>{player.losses}</span>
                      {' / '}
                      <span style={{ color: 'gray' }}>{player.draws}</span>
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${getWinRate(player)}%`}
                      color={getWinRate(player) >= 50 ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </PlayerRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredPlayers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No players found matching "{searchQuery}"
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Leaderboard;
