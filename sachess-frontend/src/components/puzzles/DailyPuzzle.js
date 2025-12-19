import React, { useState, useEffect } from 'react';
import PuzzleViewImproved from './PuzzleViewImproved';
import { getDailyPuzzle } from '../../data/puzzles';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion, AnimatePresence } from 'framer-motion';

const StreakChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.warning.light,
  color: theme.palette.warning.contrastText,
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: theme.palette.warning.dark,
  }
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  }
}));

const DailyPuzzle = () => {
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [lastCompletedDaily, setLastCompletedDaily] = useState(null);
  const [completedToday, setCompletedToday] = useState(false);

  useEffect(() => {
    // Load streak data from localStorage
    const savedStreak = localStorage.getItem('dailyPuzzleStreak');
    const lastCompleted = localStorage.getItem('lastCompletedDaily');
    const today = new Date().toISOString().split('T')[0];
    
    if (savedStreak) {
      setStreakCount(parseInt(savedStreak));
    }
    
    if (lastCompleted) {
      setLastCompletedDaily(lastCompleted);
      setCompletedToday(lastCompleted === today);
    }
    
    // Load the daily puzzle
    try {
      const dailyPuzzle = getDailyPuzzle();
      setPuzzle(dailyPuzzle);
    } catch (err) {
      setError('Failed to load daily puzzle');
      console.error('Error loading puzzle:', err);
    }
  }, []);

  const handlePuzzleComplete = (result) => {
    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastCompleted = localStorage.getItem('lastCompletedDaily');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastCompleted === yesterdayStr) {
      // Continuing streak
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      localStorage.setItem('streakCount', newStreak.toString());
    } else if (lastCompleted !== today) {
      // New streak
      setStreakCount(1);
      localStorage.setItem('streakCount', '1');
    }
    
    // Mark as completed
    localStorage.setItem('lastCompletedDaily', today);
    localStorage.setItem('dailyPuzzleStreak', streakCount.toString());
    setCompletedToday(true);
    
    // In a real app, we would send the result to the server
    console.log('Puzzle completed:', result);
  };

  const handlePuzzleFail = (result) => {
    // In a real app, we would send the result to the server
    console.log('Puzzle failed:', result);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading daily puzzle...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'error.light',
            color: 'error.contrastText'
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom>
            Oops!
          </Typography>
          <Typography variant="body1" paragraph>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{ py: 4 }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #4d90fe 30%, #357ae8 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Daily Puzzle
        </Typography>
        
        <StreakChip 
          icon={<LocalFireDepartmentIcon />} 
          label={`${streakCount} day streak`}
          size="medium"
        />
      </Box>
      
      <AnimatePresence mode="wait">
        {completedToday ? (
          <Paper 
            component={motion.div}
            key="completed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: 'success.light',
              color: 'success.contrastText',
              mb: 4
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom>
              You've completed today's puzzle!
            </Typography>
            <Typography variant="body1" paragraph>
              Come back tomorrow for a new challenge.
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} sm={6}>
                <StatCard 
                  component={motion.div}
                  whileHover={{ scale: 1.03 }}
                  elevation={2}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <LocalFireDepartmentIcon 
                      color="warning" 
                      sx={{ fontSize: 48, mb: 1 }}
                    />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Current Streak
                    </Typography>
                    <Typography variant="h4" color="text.primary">
                      {streakCount} days
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatCard 
                  component={motion.div}
                  whileHover={{ scale: 1.03 }}
                  elevation={2}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CalendarTodayIcon 
                      color="primary" 
                      sx={{ fontSize: 48, mb: 1 }}
                    />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Next Puzzle
                    </Typography>
                    <Typography variant="h4" color="text.primary">
                      {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
            </Grid>
          </Paper>
        ) : (
          <Box 
            component={motion.div}
            key="puzzle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <PuzzleViewImproved 
              puzzle={puzzle} 
              onComplete={handlePuzzleComplete} 
              onFail={handlePuzzleFail} 
            />
          </Box>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default DailyPuzzle;