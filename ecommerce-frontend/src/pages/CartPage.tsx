import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Divider,
  Alert,
  Skeleton,
  Snackbar,
  Stack,
  Fade,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';

import { useAuth } from '../context/AuthContext';
import {
  getCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  type Cart
} from '../services/cartService';
import CartItemComponent from '../components/CartItem';
import BreadcrumbHeader from '../components/BreadcrumbHeader';
import EmptyState from '../components/EmptyState';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Snackbar notifications
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');

  const fetchCartData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      setCart(data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication required. Please sign in to view your cart.');
      } else {
        setError('Failed to retrieve cart details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setError('Authentication required. Please sign in to view your cart.');
        setLoading(false);
      } else {
        fetchCartData();
      }
    }
  }, [user, authLoading]);

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      const updatedCart = await updateCartItemQuantity(itemId, quantity);
      setCart(updatedCart);
      setSnackbarMessage('Cart updated.');
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to update quantity.');
      setSnackbarSeverity('error');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const updatedCart = await removeFromCart(itemId);
      setCart(updatedCart);
      setSnackbarMessage('Item removed from cart.');
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to remove item.');
      setSnackbarSeverity('error');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setCart(null);
      setSnackbarMessage('Cart cleared.');
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to clear cart.');
      setSnackbarSeverity('error');
    }
  };

  if (authLoading || loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Skeleton width="30%" height={40} sx={{ mb: 4 }} />
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            {Array.from(new Array(3)).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 2, borderRadius: 2 }} />
            ))}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
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

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <Container maxWidth="md" sx={{ mt: 3, mb: 6 }}>
        <BreadcrumbHeader items={[{ label: 'Shopping Cart' }]} />
        <EmptyState
          icon={<ShoppingBagIcon sx={{ fontSize: 72 }} />}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added any products to your cart yet. Explore our top products catalog!"
          actionLabel="Start Shopping"
          onAction={() => navigate('/')}
        />
      </Container>
    );
  }

  // Summary math
  const subtotal = cart?.totalPrice || 0;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;

  return (
    <Fade in timeout={400}>
      <Container maxWidth="lg" sx={{ mt: 2, mb: 6 }}>
        <BreadcrumbHeader items={[{ label: 'Shopping Cart' }]} />

        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 4 }}>
          Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </Typography>

        <Grid container spacing={4}>
          {/* Cart Items List */}
          <Grid size={{ xs: 12, md: 8 }}>
            {items.map((item) => (
              <CartItemComponent
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
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
                onClick={handleClearCart}
              >
                Clear Cart
              </Button>
            </Box>
          </Grid>

          {/* Cart Summary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Order Summary
              </Typography>

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Estimated Shipping</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Estimated Tax (8%)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>${tax.toFixed(2)}</Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 800 }}>
                    ${grandTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<ShoppingCartCheckoutIcon />}
                onClick={() => navigate('/checkout')}
                sx={{ mt: 3, py: 1.2, fontWeight: 700 }}
              >
                Proceed to Checkout
              </Button>
            </Paper>
          </Grid>
        </Grid>

        <Snackbar
          open={Boolean(snackbarMessage)}
          autoHideDuration={3000}
          onClose={() => setSnackbarMessage(null)}
        >
          <Alert severity={snackbarSeverity} onClose={() => setSnackbarMessage(null)}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Fade>
  );
};

export default CartPage;
