import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  Badge,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  AccessTime as ClockIcon,
  Group as PlayersIcon,
  Star as RatingIcon,
  PlayArrow as PlayIcon,
  Add as CreateIcon,
  Timer as TimerIcon,
  Speed as BlitzIcon,
  AllInclusive as ClassicalIcon,
  Psychology as BulletIcon,
  Schedule as ScheduleIcon,
  EmojiEvents,
  MilitaryTech,
  WorkspacePremium
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const Tournament = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [tournaments, setTournaments] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // New tournament form
  const [newTournament, setNewTournament] = useState({
    name: '',
    description: '',
    type: 'swiss',
    timeControl: '5+0',
    rounds: 7,
    maxPlayers: 32,
    minRating: 0,
    maxRating: 3000,
    startTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  });

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = () => {
    // Mock tournaments data
    const mockTournaments = [
      {
        id: 1,
        name: 'Daily Blitz Arena',
        type: 'arena',
        timeControl: '3+0',
        status: 'ongoing',
        players: 156,
        maxPlayers: 0,
        rounds: 0,
        currentRound: 0,
        startTime: new Date(Date.now() - 1800000),
        endTime: new Date(Date.now() + 1800000),
        prizes: ['1st: 100 points', '2nd: 50 points', '3rd: 25 points'],
        minRating: 1200,
        maxRating: 2200
      },
      {
        id: 2,
        name: 'Weekly Swiss',
        type: 'swiss',
        timeControl: '5+3',
        status: 'upcoming',
        players: 24,
        maxPlayers: 64,
        rounds: 7,
        currentRound: 0,
        startTime: new Date(Date.now() + 7200000),
        prizes: ['Trophy + 200 points', '100 points', '50 points'],
        minRating: 1500,
        maxRating: 2500
      },
      {
        id: 3,
        name: 'Beginner Tournament',
        type: 'swiss',
        timeControl: '10+5',
        status: 'upcoming',
        players: 12,
        maxPlayers: 32,
        rounds: 5,
        currentRound: 0,
        startTime: new Date(Date.now() + 3600000),
        prizes: ['Beginner Trophy'],
        minRating: 0,
        maxRating: 1500
      },
      {
        id: 4,
        name: 'Bullet Championship',
        type: 'knockout',
        timeControl: '1+0',
        status: 'finished',
        players: 128,
        maxPlayers: 128,
        rounds: 7,
        currentRound: 7,
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() - 82800000),
        winner: 'BulletMaster',
        prizes: ['Champion Title', '500 points', '250 points'],
        minRating: 1800,
        maxRating: 3000
      }
    ];
    
    setTournaments(mockTournaments);
    
    // Filter user's tournaments
    if (isAuthenticated) {
      setMyTournaments(mockTournaments.filter((t, i) => i < 2));
    }
  };

  const handleJoinTournament = (tournamentId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Mock join tournament
    alert(`Joined tournament ${tournamentId}!`);
    loadTournaments();
  };

  const handleCreateTournament = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Mock create tournament
    console.log('Creating tournament:', newTournament);
    setCreateDialogOpen(false);
    alert('Tournament created successfully!');
    loadTournaments();
  };

  const getTournamentIcon = (type) => {
    switch(type) {
      case 'arena': return <EmojiEvents />;
      case 'swiss': return <MilitaryTech />;
      case 'knockout': return <WorkspacePremium />;
      default: return <TrophyIcon />;
    }
  };

  const getTimeControlIcon = (timeControl) => {
    const [minutes] = timeControl.split('+').map(Number);
    if (minutes <= 1) return <BulletIcon color="error" />;
    if (minutes <= 5) return <BlitzIcon color="warning" />;
    if (minutes <= 10) return <TimerIcon color="success" />;
    return <ClassicalIcon color="info" />;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ongoing': return 'success';
      case 'upcoming': return 'warning';
      case 'finished': return 'default';
      default: return 'default';
    }
  };

  const TournamentCard = ({ tournament }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getTournamentIcon(tournament.type)}
          <Typography variant="h6" sx={{ ml: 1, flex: 1 }}>
            {tournament.name}
          </Typography>
          <Chip 
            label={tournament.status} 
            size="small" 
            color={getStatusColor(tournament.status)}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getTimeControlIcon(tournament.timeControl)}
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              {tournament.timeControl}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PlayersIcon fontSize="small" />
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              {tournament.players}{tournament.maxPlayers > 0 ? `/${tournament.maxPlayers}` : ''}
            </Typography>
          </Box>
          
          {tournament.minRating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RatingIcon fontSize="small" />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {tournament.minRating}-{tournament.maxRating}
              </Typography>
            </Box>
          )}
        </Box>
        
        {tournament.status === 'upcoming' && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              Starts {formatDistanceToNow(tournament.startTime, { addSuffix: true })}
            </Typography>
          </Box>
        )}
        
        {tournament.status === 'ongoing' && (
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Round {tournament.currentRound}/{tournament.rounds || '∞'}</Typography>
              <Typography variant="body2">
                Ends {formatDistanceToNow(tournament.endTime, { addSuffix: true })}
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={tournament.rounds ? (tournament.currentRound / tournament.rounds) * 100 : 50} />
          </Box>
        )}
        
        {tournament.status === 'finished' && tournament.winner && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrophyIcon fontSize="small" color="warning" />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Winner: <strong>{tournament.winner}</strong>
            </Typography>
          </Box>
        )}
        
        {tournament.prizes && tournament.prizes.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">Prizes:</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              {tournament.prizes.slice(0, 3).map((prize, i) => (
                <Chip key={i} label={prize} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
      
      <CardActions>
        {tournament.status === 'upcoming' && (
          <Button 
            fullWidth 
            variant="contained" 
            onClick={() => handleJoinTournament(tournament.id)}
            startIcon={<PlayIcon />}
          >
            Join Tournament
          </Button>
        )}
        {tournament.status === 'ongoing' && (
          <Button 
            fullWidth 
            variant="contained" 
            color="success"
            onClick={() => navigate(`/tournament/${tournament.id}`)}
          >
            View Games
          </Button>
        )}
        {tournament.status === 'finished' && (
          <Button 
            fullWidth 
            variant="outlined"
            onClick={() => navigate(`/tournament/${tournament.id}/results`)}
          >
            View Results
          </Button>
        )}
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tournaments
        </Typography>
        
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<CreateIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Tournament
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All Tournaments" />
          <Tab label="My Tournaments" disabled={!isAuthenticated} />
          <Tab label="Ongoing" />
          <Tab label="Upcoming" />
          <Tab label="Finished" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {(tabValue === 0 ? tournaments :
          tabValue === 1 ? myTournaments :
          tabValue === 2 ? tournaments.filter(t => t.status === 'ongoing') :
          tabValue === 3 ? tournaments.filter(t => t.status === 'upcoming') :
          tournaments.filter(t => t.status === 'finished')
        ).map(tournament => (
          <Grid item xs={12} sm={6} md={4} key={tournament.id}>
            <TournamentCard tournament={tournament} />
          </Grid>
        ))}
      </Grid>

      {/* Create Tournament Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Tournament</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tournament Name"
            value={newTournament.name}
            onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Description"
            value={newTournament.description}
            onChange={(e) => setNewTournament({...newTournament, description: e.target.value})}
            margin="normal"
            multiline
            rows={3}
          />
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newTournament.type}
                  onChange={(e) => setNewTournament({...newTournament, type: e.target.value})}
                  label="Type"
                >
                  <MenuItem value="swiss">Swiss</MenuItem>
                  <MenuItem value="arena">Arena</MenuItem>
                  <MenuItem value="knockout">Knockout</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Time Control</InputLabel>
                <Select
                  value={newTournament.timeControl}
                  onChange={(e) => setNewTournament({...newTournament, timeControl: e.target.value})}
                  label="Time Control"
                >
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
            </Grid>
          </Grid>
          
          <TextField
            fullWidth
            label="Start Time"
            type="datetime-local"
            value={newTournament.startTime}
            onChange={(e) => setNewTournament({...newTournament, startTime: e.target.value})}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTournament} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Tournament;
