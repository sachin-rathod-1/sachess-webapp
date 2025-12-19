import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  Button, 
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import ChessIcon from '@mui/icons-material/Casino';
import { motion } from 'framer-motion';

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(3),
  marginTop: theme.spacing(6),
}));

const FooterTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  position: 'relative',
  paddingBottom: theme.spacing(1),
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 40,
    height: 2,
    backgroundColor: theme.palette.primary.main,
  }
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.grey[400],
  textDecoration: 'none',
  marginBottom: theme.spacing(1),
  display: 'block',
  transition: 'color 0.2s',
  '&:hover': {
    color: theme.palette.primary.main,
  }
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  marginRight: theme.spacing(1),
  transition: 'all 0.3s',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    transform: 'translateY(-3px)',
  }
}));

const PremiumButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: theme.spacing(1),
}));

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ChessIcon sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                  Chess Puzzles
                </Typography>
              </Box>
              <Typography variant="body2" color="grey.400" paragraph>
                Improve your chess skills with daily puzzles and targeted training.
              </Typography>
              <Box>
                <SocialButton 
                  component="a" 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <TwitterIcon />
                </SocialButton>
                <SocialButton 
                  component="a" 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </SocialButton>
                <SocialButton 
                  component="a" 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </SocialButton>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <FooterTitle variant="h6">Quick Links</FooterTitle>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <FooterLink component={RouterLink} to="/">Home</FooterLink>
                <FooterLink component={RouterLink} to="/daily">Daily Puzzle</FooterLink>
                <FooterLink component={RouterLink} to="/puzzles">Puzzles</FooterLink>
                <FooterLink component={RouterLink} to="/training">Training</FooterLink>
                <FooterLink component={RouterLink} to="/leaderboard">Leaderboard</FooterLink>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <FooterTitle variant="h6">Resources</FooterTitle>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <FooterLink component={RouterLink} to="/faq">FAQ</FooterLink>
                <FooterLink component={RouterLink} to="/blog">Chess Blog</FooterLink>
                <FooterLink component={RouterLink} to="/tutorials">Tutorials</FooterLink>
                <FooterLink href="https://lichess.org" target="_blank" rel="noopener noreferrer">Lichess</FooterLink>
                <FooterLink href="https://chess.com" target="_blank" rel="noopener noreferrer">Chess.com</FooterLink>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <FooterTitle variant="h6">Premium</FooterTitle>
              <Typography variant="body2" color="grey.400" paragraph>
                Unlock unlimited puzzles, advanced analytics, and more with Premium.
              </Typography>
              <PremiumButton 
                component={RouterLink} 
                to="/premium"
                variant="contained" 
                color="primary"
                fullWidth
              >
                Upgrade to Premium
              </PremiumButton>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          <Typography variant="body2" color="grey.500">
            &copy; {currentYear} Chess Puzzles. All rights reserved.
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 3,
              mt: { xs: 2, sm: 0 }
            }}
          >
            <FooterLink component={RouterLink} to="/terms" variant="body2">Terms of Service</FooterLink>
            <FooterLink component={RouterLink} to="/privacy" variant="body2">Privacy Policy</FooterLink>
            <FooterLink component={RouterLink} to="/contact" variant="body2">Contact Us</FooterLink>
          </Box>
        </Box>
      </Container>
    </FooterContainer>
  );
};

export default Footer;