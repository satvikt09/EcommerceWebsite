import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import {
  Box,
  Container,
  Typography,
  Link,
  Stack,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        pt: 6,
        pb: 4,
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Brand Info Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StorefrontIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                ShopNexus
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
              Your premier e-commerce platform for cutting-edge electronics, computers, high-fidelity audio, and modern smart devices. Experience seamless shopping today.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" color="inherit" aria-label="GitHub">
                <GitHubIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="inherit" aria-label="LinkedIn">
                <LinkedInIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="inherit" aria-label="Twitter">
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="inherit" aria-label="Support Email">
                <EmailIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          {/* Quick Links Column */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Quick Navigation
            </Typography>
            <Stack spacing={1}>
              <Link component={RouterLink} to="/" color="text.secondary" underline="hover" variant="body2">
                Products Catalog
              </Link>
              <Link component={RouterLink} to="/cart" color="text.secondary" underline="hover" variant="body2">
                Shopping Cart
              </Link>
              <Link component={RouterLink} to="/wishlist" color="text.secondary" underline="hover" variant="body2">
                Saved Wishlist
              </Link>
              <Link component={RouterLink} to="/orders" color="text.secondary" underline="hover" variant="body2">
                Track Orders
              </Link>
              <Link component={RouterLink} to="/profile" color="text.secondary" underline="hover" variant="body2">
                Account Settings
              </Link>
            </Stack>
          </Grid>

          {/* Catalog Categories */}
          <Grid size={{ xs: 6, sm: 3, md: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Popular Categories
            </Typography>
            <Stack spacing={1}>
              <Link component={RouterLink} to="/" color="text.secondary" underline="hover" variant="body2">
                Electronics & Gadgets
              </Link>
              <Link component={RouterLink} to="/" color="text.secondary" underline="hover" variant="body2">
                Computers & Laptops
              </Link>
              <Link component={RouterLink} to="/" color="text.secondary" underline="hover" variant="body2">
                Headphones & Audio
              </Link>
              <Link component={RouterLink} to="/" color="text.secondary" underline="hover" variant="body2">
                Smart Home Devices
              </Link>
              <Link component={RouterLink} to="/" color="text.secondary" underline="hover" variant="body2">
                Wearable Tech
              </Link>
            </Stack>
          </Grid>

          {/* Tech Stack & Support */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Platform Architecture
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Built with Spring Boot REST Services, React 19, Material UI v7, and Axios API layer.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label="React 19" size="small" variant="outlined" />
              <Chip label="MUI v7" size="small" variant="outlined" color="primary" />
              <Chip label="Spring Boot 3" size="small" variant="outlined" color="success" />
              <Chip label="Vite" size="small" variant="outlined" color="warning" />
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            &copy; {new Date().getFullYear()} ShopNexus Inc. All rights reserved. Designed for excellence.
          </Typography>

          <Stack direction="row" spacing={3}>
            <Link color="text.secondary" variant="caption" underline="hover" href="#">
              Privacy Policy
            </Link>
            <Link color="text.secondary" variant="caption" underline="hover" href="#">
              Terms of Service
            </Link>
            <Link color="text.secondary" variant="caption" underline="hover" href="#">
              System Status
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
