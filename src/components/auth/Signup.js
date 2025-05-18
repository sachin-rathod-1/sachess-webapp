import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Divider, 
  Alert,
  IconButton,
  InputAdornment,
  Link,
  Grid,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { motion } from 'framer-motion';

const SocialButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1.2),
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  }
}));

const GoogleButton = styled(SocialButton)(({ theme }) => ({
  backgroundColor: '#fff',
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.grey[300]}`,
  '&:hover': {
    backgroundColor: '#f5f5f5',
  }
}));

const FacebookButton = styled(SocialButton)(({ theme }) => ({
  backgroundColor: '#4267B2',
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: '#365899',
  }
}));

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    try {
      // Here we would connect to the backend API for user registration
      // For now, we'll just simulate a successful signup
      console.log('Signing up with:', name, email, password);
      
      // Simulate JWT token storage
      localStorage.setItem('chessToken', 'sample-jwt-token');
      localStorage.setItem('user', JSON.stringify({ email, name }));
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error('Signup error:', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container maxWidth="sm">
      <Box 
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ 
          my: 8, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Create Your Account
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              variant="filled"
            >
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={agreeToTerms} 
                  onChange={(e) => setAgreeToTerms(e.target.checked)} 
                  color="primary" 
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link component={RouterLink} to="/terms" color="primary">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link component={RouterLink} to="/privacy" color="primary">
                    Privacy Policy
                  </Link>
                </Typography>
              }
              sx={{ mt: 2 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                borderRadius: 1,
                fontWeight: 600
              }}
              component={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!agreeToTerms}
            >
              Create Account
            </Button>
            
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Link 
                component={RouterLink} 
                to="/login" 
                variant="body2"
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Already have an account? Login
              </Link>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>
          
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <GoogleButton 
              fullWidth 
              startIcon={<GoogleIcon />}
              component={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign up with Google
            </GoogleButton>
            
            <FacebookButton 
              fullWidth 
              startIcon={<FacebookIcon />}
              component={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign up with Facebook
            </FacebookButton>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Signup;