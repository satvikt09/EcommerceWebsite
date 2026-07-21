import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LocalMallIcon from '@mui/icons-material/LocalMall';

import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  const drawerContent = (
    <Box onClick={handleDrawerToggle} sx={{ width: 260, pt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, mb: 2 }}>
        <StorefrontIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          ShopNexus
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/" selected={isActive('/')}>
            <ListItemIcon><StorefrontIcon color={isActive('/') ? 'primary' : 'inherit'} /></ListItemIcon>
            <ListItemText primary="Products Catalog" />
          </ListItemButton>
        </ListItem>
        {user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/cart" selected={isActive('/cart')}>
                <ListItemIcon><ShoppingCartIcon color={isActive('/cart') ? 'primary' : 'inherit'} /></ListItemIcon>
                <ListItemText primary="Cart" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/wishlist" selected={isActive('/wishlist')}>
                <ListItemIcon><FavoriteIcon color={isActive('/wishlist') ? 'primary' : 'inherit'} /></ListItemIcon>
                <ListItemText primary="Wishlist" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/orders" selected={isActive('/orders')}>
                <ListItemIcon><LocalMallIcon color={isActive('/orders') ? 'primary' : 'inherit'} /></ListItemIcon>
                <ListItemText primary="My Orders" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/profile" selected={isActive('/profile')}>
                <ListItemIcon><PersonIcon color={isActive('/profile') ? 'primary' : 'inherit'} /></ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>

            {user.role === 'ADMIN' && (
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/admin/analytics" selected={location.pathname.startsWith('/admin')}>
                  <ListItemIcon><AdminPanelSettingsIcon color={location.pathname.startsWith('/admin') ? 'primary' : 'inherit'} /></ListItemIcon>
                  <ListItemText primary="Admin Portal" />
                </ListItemButton>
              </ListItem>
            )}

            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/login">
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/register">
                <ListItemText primary="Register" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Brand Logo & Mobile Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <StorefrontIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 800,
                  letterSpacing: '.05rem',
                  color: 'primary.main',
                  fontSize: { xs: '1.1rem', sm: '1.3rem' },
                }}
              >
                ShopNexus
              </Typography>
            </Box>
          </Box>

          {/* Desktop Nav Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Button
              component={RouterLink}
              to="/"
              color={isActive('/') ? 'primary' : 'inherit'}
              sx={{ fontWeight: isActive('/') ? 700 : 500 }}
            >
              Catalog
            </Button>
            {user && (
              <>
                <Button
                  component={RouterLink}
                  to="/orders"
                  color={isActive('/orders') ? 'primary' : 'inherit'}
                  sx={{ fontWeight: isActive('/orders') ? 700 : 500 }}
                >
                  Orders
                </Button>
                {user.role === 'ADMIN' && (
                  <Button
                    component={RouterLink}
                    to="/admin/analytics"
                    color={location.pathname.startsWith('/admin') ? 'primary' : 'inherit'}
                    startIcon={<AdminPanelSettingsIcon />}
                    sx={{ fontWeight: location.pathname.startsWith('/admin') ? 700 : 500 }}
                  >
                    Admin Portal
                  </Button>
                )}
              </>
            )}
          </Box>

          {/* User Controls & Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle Button */}
            <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <Brightness7Icon color="warning" /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {user && (
              <>
                {/* Wishlist Icon Badge */}
                <Tooltip title="Wishlist">
                  <IconButton component={RouterLink} to="/wishlist" color={isActive('/wishlist') ? 'primary' : 'inherit'}>
                    <Badge color="error" variant="dot">
                      <FavoriteIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Cart Icon Badge */}
                <Tooltip title="Shopping Cart">
                  <IconButton component={RouterLink} to="/cart" color={isActive('/cart') ? 'primary' : 'inherit'}>
                    <Badge color="primary" variant="dot">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Profile Avatar Menu */}
                <IconButton onClick={handleMenuOpen} sx={{ p: 0.5, ml: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 700 }}>
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    elevation: 3,
                    sx: { minWidth: 200, mt: 1.5, borderRadius: 2 },
                  }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {user.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem component={RouterLink} to="/profile">
                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                    My Profile
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/orders">
                    <ListItemIcon><LocalMallIcon fontSize="small" /></ListItemIcon>
                    My Orders
                  </MenuItem>
                  {user.role === 'ADMIN' && (
                    <MenuItem component={RouterLink} to="/admin/analytics">
                      <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}

            {!user && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button component={RouterLink} to="/login" variant="outlined" size="small">
                  Login
                </Button>
                <Button component={RouterLink} to="/register" variant="contained" size="small">
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {drawerContent}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
