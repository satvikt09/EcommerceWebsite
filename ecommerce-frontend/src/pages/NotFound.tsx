import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import FindInPageIcon from '@mui/icons-material/FindInPage';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 3 }}>
        <Box sx={{ color: 'primary.main', mb: 2, display: 'flex', justifyContent: 'center' }}>
          <FindInPageIcon sx={{ fontSize: 72 }} />
        </Box>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
          The page you are looking for does not exist, has been removed, or is temporarily unavailable.
        </Typography>
        <Button variant="contained" color="primary" size="large" onClick={() => navigate('/')}>
          Back to Store Catalog
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFound;
