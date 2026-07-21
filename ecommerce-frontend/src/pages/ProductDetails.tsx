import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Rating,
  Chip,
  TextField,
  Skeleton,
  Alert,
  Snackbar,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Paper,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAuth } from '../context/AuthContext';
import {
  getProductById,
  getProductsByCategory,
  addToCart,
  addToWishlist,
} from '../services/productService';
import type { Product } from '../components/ProductCard';
import ReviewList from '../components/ReviewList';
import BreadcrumbHeader from '../components/BreadcrumbHeader';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery state
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Quantity selector state
  const [quantity, setQuantity] = useState<number>(1);

  // Snackbar feedback state
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'warning' | 'error'>('success');

  const fetchProductData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const prodId = parseInt(id, 10);
      if (isNaN(prodId)) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      const data = await getProductById(prodId);
      setProduct(data);

      // Create gallery list
      const mainImg = data.imageUrl || 'https://via.placeholder.com/600x600?text=No+Image';
      const gallery = [
        mainImg,
        data.imageUrl ? `${data.imageUrl}?v=1` : 'https://via.placeholder.com/600x600?text=Side+View',
        data.imageUrl ? `${data.imageUrl}?v=2` : 'https://via.placeholder.com/600x600?text=Alt+Angle',
      ];
      setGalleryImages(gallery);
      setSelectedImage(mainImg);

      // Fetch related products
      if (data.category?.id) {
        try {
          const related = await getProductsByCategory(data.category.id);
          const filtered = related.filter((p) => p.id !== data.id).slice(0, 4);
          setRelatedProducts(filtered);
        } catch (catErr) {
          console.error('Error fetching related products:', catErr);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Product not found.');
      } else {
        setError('Failed to load product details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
    setQuantity(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      setSnackbarMessage('Please sign in to add items to your cart.');
      setSnackbarSeverity('warning');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      setSnackbarMessage(`Added ${quantity} of ${product.name} to cart.`);
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to add item to cart.');
      setSnackbarSeverity('error');
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      setSnackbarMessage('Please sign in to add items to your wishlist.');
      setSnackbarSeverity('warning');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    if (!product) return;
    try {
      await addToWishlist(product.id);
      setSnackbarMessage(`${product.name} added to wishlist.`);
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to add item to wishlist.');
      setSnackbarSeverity('error');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      setSnackbarMessage('Please sign in to complete your purchase.');
      setSnackbarSeverity('warning');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      navigate('/cart');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to initialize checkout.');
      setSnackbarSeverity('error');
    }
  };

  // Re-fetch product data when reviews update to update the average rating
  const handleReviewsUpdated = () => {
    fetchProductData();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={450} sx={{ borderRadius: 2, mb: 2 }} />
            <Grid container spacing={2}>
              {Array.from(new Array(3)).map((_, i) => (
                <Grid size={4} key={i}>
                  <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton width="40%" height={30} sx={{ mb: 1 }} />
            <Skeleton width="80%" height={48} sx={{ mb: 2 }} />
            <Skeleton width="30%" height={24} sx={{ mb: 2 }} />
            <Skeleton width="50%" height={40} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={120} sx={{ mb: 3 }} />
            <Skeleton width="100%" height={56} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3, display: 'inline-flex', alignItems: 'center' }}>
          {error || 'An unexpected error occurred.'}
        </Alert>
        <Box>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
            Back to Shop
          </Button>
        </Box>
      </Container>
    );
  }

  // Discount & original price calculations
  const discountPercentage = product.id % 2 === 0 ? 20 : 15;
  const originalPrice = product.price / (1 - discountPercentage / 100);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <BreadcrumbHeader
        items={[
          { label: 'Products', path: '/' },
          { label: product.category?.name || 'Category', path: '/' },
          { label: product.name }
        ]}
      />

      {/* Main product display */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Left Side: Images */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 3, display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              component="img"
              src={selectedImage}
              alt={product.name}
              sx={{
                width: '100%',
                maxHeight: 450,
                objectFit: 'contain',
                borderRadius: 2,
              }}
            />
          </Paper>
          <Grid container spacing={2}>
            {galleryImages.map((img, i) => (
              <Grid size={4} key={i}>
                <Paper
                  elevation={selectedImage === img ? 4 : 1}
                  sx={{
                    p: 0.5,
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: selectedImage === img ? '2px solid' : '2px solid transparent',
                    borderColor: 'primary.main',
                    transition: 'all 0.2s',
                    '&:hover': { elevation: 3 },
                  }}
                  onClick={() => setSelectedImage(img)}
                >
                  <Box
                    component="img"
                    src={img}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    sx={{
                      width: '100%',
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1.5,
                    }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Right Side: Product Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
            <Box>
              {product.brand && (
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                  {product.brand}
                </Typography>
              )}
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                {product.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Rating value={product.averageRating || 0} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  ({product.reviewCount || 0} reviews)
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Chip
                  label={product.category?.name || 'Uncategorized'}
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
            </Box>

            {/* Price Section */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>
                  ${product.price.toFixed(2)}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  ${originalPrice.toFixed(2)}
                </Typography>
                <Chip
                  label={`${discountPercentage}% OFF`}
                  color="error"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Paper>

            {/* Stock Availability */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Availability:</Typography>
              {isOutOfStock ? (
                <Chip label="Out of Stock" color="error" variant="filled" />
              ) : isLowStock ? (
                <Chip label={`Only ${product.stock} Left`} color="warning" variant="filled" />
              ) : (
                <Chip label="In Stock" color="success" variant="filled" />
              )}
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {product.description}
            </Typography>

            <Divider />

            {/* Actions Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 'auto' }}>
              {!isOutOfStock && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Quantity:</Typography>
                  <TextField
                    type="number"
                    slotProps={{
                      htmlInput: { min: 1, max: product.stock }
                    }}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (val >= 1 && val <= product.stock) {
                        setQuantity(val);
                      }
                    }}
                    size="small"
                    sx={{ width: 80 }}
                  />
                </Box>
              )}

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    sx={{ py: 1.5, fontWeight: 600 }}
                  >
                    Add to Cart
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    fullWidth
                    startIcon={<FlashOnIcon />}
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    sx={{ py: 1.5, fontWeight: 600 }}
                  >
                    Buy Now
                  </Button>
                </Grid>
                <Grid size={12}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    fullWidth
                    startIcon={<FavoriteIcon />}
                    onClick={handleAddToWishlist}
                    sx={{ py: 1 }}
                  >
                    Add to Wishlist
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
            Related Products
          </Typography>
          <Grid container spacing={3}>
            {relatedProducts.map((p) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={p.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea onClick={() => navigate(`/products/${p.id}`)} sx={{ flexGrow: 1 }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={p.imageUrl || 'https://via.placeholder.com/200x160?text=No+Image'}
                      alt={p.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                        {p.category?.name}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3, minHeight: 40 }}>
                        {p.name}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mt: 'auto' }}>
                        ${p.price.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Reviews Section */}
      <ReviewList productId={product.id} onReviewsUpdated={handleReviewsUpdated} />

      {/* Feedback Snackbars */}
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
  );
};

export default ProductDetails;
