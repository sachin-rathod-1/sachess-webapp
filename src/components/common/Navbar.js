import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Box, 
  Container, 
  Avatar, 
  Menu, 
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ChessIcon from '@mui/icons-material/Casino';
import { motion } from 'framer-motion';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  color: theme.palette.text.primary,
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  marginLeft: theme.spacing(2),
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  position: 'relative',
  '&::after': active ? {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: theme.spacing(1),
    right: theme.spacing(1),
    height: 3,
    backgroundColor: theme.palette.primary.main,
  } : {},
}));

const SignUpButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  borderRadius: theme.spacing(1),
}));

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('chessToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('chessToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setMobileMenuOpen(false);
    setAnchorEl(null);
    // Redirect to home page
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const navItems = [
    { path: '/daily', label: 'Daily Puzzle' },
    { path: '/puzzles', label: 'Puzzles' },
    { path: '/training', label: 'Training' },
    { path: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <>
      <StyledAppBar position="sticky" component={motion.nav} initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <LogoContainer component={RouterLink} to="/" onClick={closeMobileMenu}>
              <ChessIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
              <Typography
                variant="h6"
                component="div"
                sx={{ 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Chess Puzzles
              </Typography>
            </LogoContainer>

            <Box sx={{ flexGrow: 1 }} />

            {isMobile ? (
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={toggleMobileMenu}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {navItems.map((item) => (
                  <NavButton
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    active={location.pathname === item.path || 
                           (item.path === '/training' && location.pathname.includes('/training'))}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </NavButton>
                ))}

                {isLoggedIn ? (
                  <>
                    <IconButton 
                      onClick={handleProfileMenuOpen}
                      sx={{ ml: 2 }}
                    >
                      <Avatar 
                        alt={user?.name || 'User'} 
                        src={user?.avatar} 
                        sx={{ 
                          width: 40, 
                          height: 40,
                          bgcolor: 'primary.main',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }} 
                      />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleProfileMenuClose}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <MenuItem 
                        component={RouterLink} 
                        to="/profile"
                        onClick={handleProfileMenuClose}
                      >
                        Profile
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button 
                      component={RouterLink} 
                      to="/login"
                      color="inherit"
                      sx={{ ml: 2 }}
                    >
                      Login
                    </Button>
                    <SignUpButton 
                      component={RouterLink} 
                      to="/signup"
                      variant="contained" 
                      color="primary"
                    >
                      Sign Up
                    </SignUpButton>
                  </>
                )}
              </Box>
            )}
          </Toolbar>
        </Container>
      </StyledAppBar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={isMobile && mobileMenuOpen}
        onClose={closeMobileMenu}
        PaperProps={{
          sx: { width: 250 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Chess Puzzles
          </Typography>
        </Box>
        <List>
          {navItems.map((item) => (
            <ListItem 
              button 
              key={item.path}
              component={RouterLink}
              to={item.path}
              onClick={closeMobileMenu}
              selected={location.pathname === item.path || 
                      (item.path === '/training' && location.pathname.includes('/training'))}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}

          {isLoggedIn ? (
            <>
              <ListItem 
                button 
                component={RouterLink}
                to="/profile"
                onClick={closeMobileMenu}
                selected={location.pathname === '/profile'}
              >
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem 
                button 
                component={RouterLink}
                to="/login"
                onClick={closeMobileMenu}
                selected={location.pathname === '/login'}
              >
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem 
                button 
                component={RouterLink}
                to="/signup"
                onClick={closeMobileMenu}
                selected={location.pathname === '/signup'}
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                <ListItemText primary="Sign Up" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;