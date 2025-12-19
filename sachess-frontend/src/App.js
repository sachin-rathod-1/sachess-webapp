import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Paper,
  useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import TimelineIcon from '@mui/icons-material/Timeline';
import TargetIcon from '@mui/icons-material/GpsFixed';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import './App.css';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

// Puzzle Components
import DailyPuzzle from './components/puzzles/DailyPuzzle';

// Training Components
import TrainingSelection from './components/training/TrainingSelection';
import TrainingMode from './components/training/TrainingMode';

// Profile Components
import Profile from './components/profile/Profile';

// Game Components
import GameLobby from './components/game/GameLobby';
import MultiplayerGame from './components/game/MultiplayerGame';
import Leaderboard from './components/game/Leaderboard';

// Lazy load components for better performance
const ComputerGame = lazy(() => import('./components/game/ComputerGame'));
const AnalysisBoard = lazy(() => import('./components/analysis/AnalysisBoard'));
const Tournament = lazy(() => import('./components/tournament/Tournament'));

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4d90fe',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.3rem',
      lineHeight: 1.4,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 20px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Home Component
const Home = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box component={motion.div} 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center', 
          justifyContent: 'space-between',
          py: 6, 
          gap: 4 
        }}
      >
        <Box component={motion.div} variants={itemVariants} sx={{ flex: 1 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            Improve Your Chess Skills with Daily Puzzles
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
            Enhance your tactical vision, pattern recognition, and calculation abilities with our curated chess puzzles.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button 
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variant="contained" 
              color="primary" 
              size="large"
              href="/daily"
            >
              Try Daily Puzzle
            </Button>
            <Button 
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variant="outlined" 
              color="primary" 
              size="large"
              href="/signup"
            >
              Create Account
            </Button>
          </Box>
        </Box>
        
        <Box component={motion.div} variants={itemVariants} sx={{ 
          flex: 1,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Paper 
            component={motion.div}
            whileHover={{ 
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              rotate: [0, 1, -1, 1, 0],
              transition: { duration: 0.5 }
            }}
            elevation={4}
            sx={{ 
              width: '100%', 
              maxWidth: 400,
              height: 400,
              backgroundImage: 'url(https://media.gettyimages.com/id/517495883/photo/king-chess-piece-surrounded.jpg?s=612x612&w=0&k=20&c=_3Tak-RAFbQHwQrU5vuSY5O7cVM2Jr0HWH4t-Cq8QC4=)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              borderRadius: 3
            }}
          />
        </Box>
      </Box>

      <Box component={motion.div} 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        sx={{ py: 8, textAlign: 'center' }}
      >
        <Typography component={motion.h2} variants={itemVariants} variant="h2" gutterBottom>
          Why Chess Puzzles?
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              component={motion.div}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)'
              }}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <SportsEsportsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h3" component="h3" gutterBottom>
                  Improve Pattern Recognition
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Train your brain to recognize tactical patterns that appear in your games.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              component={motion.div}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)'
              }}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <TimelineIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h3" component="h3" gutterBottom>
                  Track Your Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor your improvement with detailed statistics and performance metrics.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              component={motion.div}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)'
              }}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <TargetIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h3" component="h3" gutterBottom>
                  Targeted Training
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Focus on specific tactical themes to strengthen your weaknesses.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              component={motion.div}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)'
              }}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <LocalFireDepartmentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h3" component="h3" gutterBottom>
                  Daily Challenges
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Solve the daily puzzle to maintain your streak and stay sharp.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box 
        component={motion.div}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.7 }
        }}
        viewport={{ once: true }}
        sx={{ 
          py: 8, 
          textAlign: 'center',
          bgcolor: 'primary.light',
          borderRadius: 4,
          mb: 8,
          px: 3,
          color: 'white'
        }}
      >
        <Typography variant="h2" component="h2" gutterBottom>
          Ready to Improve Your Chess?
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          Join thousands of players who use our platform to enhance their chess skills.
        </Typography>
        <Button 
          component={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variant="contained" 
          color="secondary" 
          size="large"
          href="/signup"
          sx={{ 
            py: 1.5, 
            px: 4, 
            fontSize: '1.1rem',
            bgcolor: 'white',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.9)',
            }
          }}
        >
          Get Started for Free
        </Button>
      </Box>
    </Container>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function AppContent() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Typography>Loading...</Typography></Box>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/daily" element={<DailyPuzzle />} />
            <Route path="/training" element={<TrainingSelection />} />
            <Route path="/training/:theme" element={<TrainingMode />} />
            <Route path="/play" element={<GameLobby />} />
            <Route path="/play/computer" element={<ComputerGame />} />
            <Route path="/game/:gameId" element={<ProtectedRoute><MultiplayerGame /></ProtectedRoute>} />
            <Route path="/analysis" element={<AnalysisBoard />} />
            <Route path="/tournaments" element={<Tournament />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Box>
      <Footer />
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <GameProvider>
            <AppContent />
          </GameProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
