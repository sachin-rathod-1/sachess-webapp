import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';
import { getSoundEffects } from '../../services/soundEffects';

const GameClock = ({ 
  whiteTime, 
  blackTime, 
  isWhiteTurn, 
  isRunning, 
  onTimeUp,
  increment = 0,
  onTimeUpdate 
}) => {
  const [whiteTimeLeft, setWhiteTimeLeft] = useState(whiteTime);
  const [blackTimeLeft, setBlackTimeLeft] = useState(blackTime);
  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const soundEffects = getSoundEffects();

  useEffect(() => {
    setWhiteTimeLeft(whiteTime);
    setBlackTimeLeft(blackTime);
  }, [whiteTime, blackTime]);

  useEffect(() => {
    if (isRunning && (whiteTimeLeft > 0 && blackTimeLeft > 0)) {
      lastUpdateRef.current = Date.now();
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastUpdateRef.current;
        lastUpdateRef.current = now;

        if (isWhiteTurn) {
          setWhiteTimeLeft(prev => {
            const newTime = Math.max(0, prev - elapsed);
            
            // Play low time warning
            if (newTime < 10000 && newTime > 9000) {
              soundEffects.playLowTimeSound();
            }
            
            // Play tick sound for last 10 seconds
            if (newTime < 10000) {
              soundEffects.playTickSound();
            }
            
            if (newTime === 0) {
              onTimeUp?.('white');
            }
            
            onTimeUpdate?.('white', newTime);
            return newTime;
          });
        } else {
          setBlackTimeLeft(prev => {
            const newTime = Math.max(0, prev - elapsed);
            
            // Play low time warning
            if (newTime < 10000 && newTime > 9000) {
              soundEffects.playLowTimeSound();
            }
            
            // Play tick sound for last 10 seconds
            if (newTime < 10000) {
              soundEffects.playTickSound();
            }
            
            if (newTime === 0) {
              onTimeUp?.('black');
            }
            
            onTimeUpdate?.('black', newTime);
            return newTime;
          });
        }
      }, 100);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isRunning, isWhiteTurn, whiteTimeLeft, blackTimeLeft, onTimeUp, onTimeUpdate]);

  // Add increment when turn changes
  useEffect(() => {
    if (increment > 0 && isRunning) {
      if (isWhiteTurn) {
        // Black just moved, add increment to black's time
        setBlackTimeLeft(prev => prev + increment * 1000);
      } else {
        // White just moved, add increment to white's time
        setWhiteTimeLeft(prev => prev + increment * 1000);
      }
    }
  }, [isWhiteTurn]);

  const formatTime = (ms) => {
    if (ms <= 0) return '0:00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (ms < 10000) {
      // Show tenths of second for last 10 seconds
      const tenths = Math.floor((ms % 1000) / 100);
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
    }
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getClockStyle = (timeLeft, isActive) => ({
    bgcolor: isActive ? 'primary.main' : 'background.paper',
    color: isActive ? 'primary.contrastText' : 'text.primary',
    opacity: timeLeft === 0 ? 0.5 : 1,
    border: isActive ? '2px solid' : '1px solid',
    borderColor: timeLeft < 10000 ? 'error.main' : isActive ? 'primary.dark' : 'divider',
    transition: 'all 0.3s ease',
    boxShadow: isActive ? 3 : 1
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Black Clock */}
      <Paper 
        elevation={!isWhiteTurn && isRunning ? 3 : 1}
        sx={{
          p: 2,
          textAlign: 'center',
          ...getClockStyle(blackTimeLeft, !isWhiteTurn && isRunning)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!isWhiteTurn && isRunning && <TimerIcon sx={{ mr: 1, animation: 'pulse 1s infinite' }} />}
          <Typography variant="h4" fontFamily="monospace" fontWeight="bold">
            {formatTime(blackTimeLeft)}
          </Typography>
        </Box>
      </Paper>

      {/* White Clock */}
      <Paper 
        elevation={isWhiteTurn && isRunning ? 3 : 1}
        sx={{
          p: 2,
          textAlign: 'center',
          ...getClockStyle(whiteTimeLeft, isWhiteTurn && isRunning)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isWhiteTurn && isRunning && <TimerIcon sx={{ mr: 1, animation: 'pulse 1s infinite' }} />}
          <Typography variant="h4" fontFamily="monospace" fontWeight="bold">
            {formatTime(whiteTimeLeft)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default GameClock;
