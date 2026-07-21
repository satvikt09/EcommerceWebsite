import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Skeleton,
  Snackbar,
  Fade,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAuth } from '../context/AuthContext';
import {
  getWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
  type Wishlist
} from '../services/wishlistService';
import WishlistItemComponent from '../components/WishlistItem';
import BreadcrumbHeader from '../components/BreadcrumbHeader';
import EmptyState from '../components/EmptyState';

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Snackbar notifications
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');

  const fetchWishlistData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWishlist();
      setWishlist(data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication required. Please sign in to view your wishlist.');
      } else {
        setError('Failed to fetch your wishlist. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setError('Authentication required. Please sign in to view your wishlist.');
        setLoading(false);
      } else {
        fetchWishlistData();
      }
    }
  }, [user, authLoading]);

  const handleRemoveItem = async (itemId: number) => {
    try {
      const updatedWishlist = await removeFromWishlist(itemId);
      setWishlist(updatedWishlist);
      setSnackbarMessage('Item removed from wishlist.');
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to remove item.');
      setSnackbarSeverity('error');
    }
  };

  const handleMoveToCart = async (itemId: number) => {
    try {
      const updatedWishlist = await moveToCart(itemId);
      setWishlist(updatedWishlist);
      setSnackbarMessage('Item moved to cart successfully!');
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to move item to cart.');
      setSnackbarSeverity('error');
    }
  };

  const handleClearWishlist = async () => {
    try {
      const updatedWishlist = await clearWishlist();
      setWishlist(updatedWishlist);
      setSnackbarMessage('Wishlist cleared.');
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to clear wishlist.');
      setSnackbarSeverity('error');
    }
  };

  if (authLoading || loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Skeleton width="30%" height={40} sx={{ mb: 4 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from(new Array(3)).map((_, idx) => (
            <Skeleton key={idx} variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 6, mb: 6, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 3, display: 'inline-flex', alignItems: 'center' }}>
          {error}
        </Alert>
        <Box sx={{ mt: 2 }}>
          {!user ? (
            <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          ) : (
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
              Back to Shop
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  const items = wishlist?.items || [];
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <Container maxWidth="md" sx={{ mt: 3, mb: 6 }}>
        <BreadcrumbHeader items={[{ label: 'Wishlist' }]} />
        <EmptyState
          icon={<FavoriteBorderIcon sx={{ fontSize: 72 }} />}
          title="Your Wishlist is Empty"
          description="Save your favorite items here while exploring the store to buy them later."
          actionLabel="Explore Catalog"
          onAction={() => navigate('/')}
        />
      </Container>
    );
  }

  return (
    <Fade in timeout={400}>
      <Container maxWidth="md" sx={{ mt: 2, mb: 6 }}>
        <BreadcrumbHeader items={[{ label: 'Wishlist' }]} />

        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 4 }}>
          My Wishlist ({items.length} {items.length === 1 ? 'item' : 'items'})
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((item) => (
            <WishlistItemComponent
              key={item.id}
              item={item}
              onRemove={handleRemoveItem}
              onMoveToCart={handleMoveToCart}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleClearWishlist}
          >
            Clear Wishlist
          </Button>
        </Box>

        <Snackbar
          open={snackbarMessage !== null}
          autoHideDuration={4000}
          onClose={() => setSnackbarMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbarMessage(null)}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Fade>
  );
};

export default WishlistPage;
