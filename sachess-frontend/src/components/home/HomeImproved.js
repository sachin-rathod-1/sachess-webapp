import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  LinearProgress,
  Tabs,
  Tab,
  Badge,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  PlayArrow as PlayIcon,
  Computer as ComputerIcon,
  Assessment as AnalysisIcon,
  Extension as PuzzleIcon,
  School as TrainingIcon,
  EmojiEvents as TournamentIcon,
  Leaderboard as LeaderboardIcon,
  Group as FriendsIcon,
  Videocam as WatchIcon,
  MenuBook as LearnIcon,
  Speed as BlitzIcon,
  Timer as RapidIcon,
  AllInclusive as ClassicalIcon,
  Psychology as BulletIcon,
  TrendingUp as ImprovingIcon,
  LocalFireDepartment as StreakIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getDailyPuzzle } from '../../data/puzzles';

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  color: theme.palette.common.white,
  padding: theme.spacing(8, 0),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4, 0),
  }
}));

const QuickPlayCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[12],
  }
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

const LiveGameItem = styled(ListItem)(({ theme }) => ({
  transition: 'background-color 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const HomeImproved = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [dailyPuzzle, setDailyPuzzle] = useState(null);
  const [liveGames, setLiveGames] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(Math.floor(Math.random() * 5000) + 1000);
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load daily puzzle
      const puzzle = getDailyPuzzle();
      setDailyPuzzle(puzzle);
      
      // Mock live games
      const mockLiveGames = [
        { id: 1, white: 'Magnus_C', whiteRating: 2850, black: 'Hikaru_N', blackRating: 2830, timeControl: '3+0' },
        { id: 2, white: 'FireOnBoard', whiteRating: 2750, black: 'DrDrunkenstein', blackRating: 2780, timeControl: '5+0' },
        { id: 3, white: 'ChessWarrior', whiteRating: 2650, black: 'TacticalMaster', blackRating: 2680, timeControl: '10+0' },
      ];
      setLiveGames(mockLiveGames);
      
      // Mock top players
      const mockTopPlayers = [
        { rank: 1, name: 'Magnus_C', rating: 2850, country: '🇳🇴', trend: 'up' },
        { rank: 2, name: 'Hikaru_N', rating: 2830, country: '🇺🇸', trend: 'stable' },
        { rank: 3, name: 'FireOnBoard', rating: 2750, country: '🇮🇳', trend: 'up' },
        { rank: 4, name: 'DrDrunkenstein', rating: 2780, country: '🇷🇺', trend: 'down' },
        { rank: 5, name: 'ChessKing', rating: 2720, country: '🇨🇳', trend: 'up' },
      ];
      setTopPlayers(mockTopPlayers);
      
      // Mock user stats if authenticated
      if (isAuthenticated && user) {
        setUserStats({
          rating: user.rating || 1500,
          gamesPlayed: user.gamesPlayed || 0,
          winRate: user.wins ? ((user.wins / (user.gamesPlayed || 1)) * 100).toFixed(1) : 0,
          puzzleStreak: parseInt(localStorage.getItem('dailyPuzzleStreak') || '0'),
          rank: Math.floor(Math.random() * 1000) + 100
        });
      }
      
      setLoading(false);
    };
    
    loadData();
    
    // Simulate online count updates
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);
  
  const quickPlayModes = [
    {
      title: 'Bullet',
      icon: <BulletIcon fontSize="large" />,
      description: '1 minute games',
      timeControl: '1+0',
      color: 'error'
    },
    {
      title: 'Blitz',
      icon: <BlitzIcon fontSize="large" />,
      description: '3-5 minute games',
      timeControl: '3+2',
      color: 'warning'
    },
    {
      title: 'Rapid',
      icon: <RapidIcon fontSize="large" />,
      description: '10-15 minute games',
      timeControl: '10+5',
      color: 'success'
    },
    {
      title: 'Classical',
      icon: <ClassicalIcon fontSize="large" />,
      description: '30+ minute games',
      timeControl: '30+0',
      color: 'info'
    }
  ];
  
  const mainFeatures = [
    {
      title: 'Play vs Computer',
      icon: <ComputerIcon />,
      description: 'Challenge our AI at various difficulty levels',
      path: '/play/computer',
      color: 'primary'
    },
    {
      title: 'Analysis Board',
      icon: <AnalysisIcon />,
      description: 'Analyze your games with powerful engine',
      path: '/analysis',
      color: 'secondary'
    },
    {
      title: 'Daily Puzzle',
      icon: <PuzzleIcon />,
      description: 'Solve tactical puzzles to improve',
      path: '/puzzles/daily',
      color: 'success'
    },
    {
      title: 'Training',
      icon: <TrainingIcon />,
      description: 'Practice specific chess patterns',
      path: '/training',
      color: 'warning'
    },
    {
      title: 'Tournaments',
      icon: <TournamentIcon />,
      description: 'Join exciting tournaments',
      path: '/tournaments',
      color: 'error'
    },
    {
      title: 'Learn',
      icon: <LearnIcon />,
      description: 'Study openings and endgames',
      path: '/learn',
      color: 'info'
    }
  ];
  
  const handleQuickPlay = (timeControl) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/play?timeControl=${timeControl}`);
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Hero Section */}
      <HeroSection component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '3rem' } }}
              >
                Welcome to SaChess
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Play chess online with millions of players worldwide
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayIcon />}
                  onClick={() => navigate('/play')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  Play Online
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ComputerIcon />}
                  onClick={() => navigate('/play/computer')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Play Computer
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {onlineCount.toLocaleString()}
                </Typography>
                <Typography variant="h6">Players Online Now</Typography>
                {userStats && (
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 3 }}>
                    <Box>
                      <Typography variant="h4">{userStats.rating}</Typography>
                      <Typography variant="body2">Your Rating</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4">{userStats.gamesPlayed}</Typography>
                      <Typography variant="body2">Games Played</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4">{userStats.winRate}%</Typography>
                      <Typography variant="body2">Win Rate</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>
      
      {/* Quick Play Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Quick Play
        </Typography>
        <Grid container spacing={3}>
          {quickPlayModes.map((mode, index) => (
            <Grid item xs={6} sm={3} key={mode.title}>
              <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                <QuickPlayCard onClick={() => handleQuickPlay(mode.timeControl)}>
                  <CardContent sx={{ textAlign: 'center', flex: 1 }}>
                    <Box sx={{ color: `${mode.color}.main`, mb: 2 }}>
                      {mode.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {mode.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mode.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button fullWidth color={mode.color}>
                      Play Now
                    </Button>
                  </CardActions>
                </QuickPlayCard>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Main Features */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mainFeatures.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={feature.title}>
            <Fade in={true} timeout={1000} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => navigate(feature.path)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: `${feature.color}.main`, mr: 2 }}>
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6">{feature.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
      
      {/* Live Games and Leaderboard */}
      <Grid container spacing={3}>
        {/* Live Games */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Badge badgeContent="LIVE" color="error" sx={{ mr: 2 }}>
                <WatchIcon />
              </Badge>
              Top Live Games
            </Typography>
            <List>
              {liveGames.map((game) => (
                <React.Fragment key={game.id}>
                  <LiveGameItem onClick={() => navigate(`/watch/${game.id}`)}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PlayIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body1">
                            {game.white} ({game.whiteRating})
                          </Typography>
                          <Chip label={game.timeControl} size="small" color="primary" />
                          <Typography variant="body1">
                            {game.black} ({game.blackRating})
                          </Typography>
                        </Box>
                      }
                      secondary="In progress..."
                    />
                  </LiveGameItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Top Players */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LeaderboardIcon sx={{ mr: 1 }} />
              Top Players
            </Typography>
            <List>
              {topPlayers.map((player) => (
                <React.Fragment key={player.rank}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: player.rank <= 3 ? 'warning.main' : 'grey.500' }}>
                        {player.rank}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" sx={{ mr: 1 }}>
                            {player.country} {player.name}
                          </Typography>
                          {player.trend === 'up' && <TrendingUp color="success" fontSize="small" />}
                          {player.trend === 'down' && <TrendingUp color="error" fontSize="small" sx={{ transform: 'rotate(180deg)' }} />}
                        </Box>
                      }
                      secondary={`Rating: ${player.rating}`}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
            <Button fullWidth sx={{ mt: 2 }} onClick={() => navigate('/leaderboard')}>
              View Full Leaderboard
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Daily Puzzle Preview */}
      {dailyPuzzle && (
        <Paper sx={{ p: 3, mt: 4, background: `linear-gradient(135deg, ${theme.palette.primary.light}22 0%, ${theme.palette.primary.main}22 100%)` }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <PuzzleIcon sx={{ mr: 1 }} />
            Today's Puzzle
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6">{dailyPuzzle.title}</Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {dailyPuzzle.theme} • {dailyPuzzle.difficulty}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Can you find the winning move? Test your tactical skills with today's puzzle.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PuzzleIcon />}
                onClick={() => navigate('/puzzles/daily')}
              >
                Solve Puzzle
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default HomeImproved;
