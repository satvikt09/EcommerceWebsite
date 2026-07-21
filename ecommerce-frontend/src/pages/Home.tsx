import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import {
  Container,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Fade,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import type { Product, Category } from '../components/ProductCard';
import EmptyState from '../components/EmptyState';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async (searchKeyword = '', categoryId = '') => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: 0, size: 20 };
      if (searchKeyword.trim()) {
        params.keyword = searchKeyword.trim();
      }
      if (categoryId) {
        params.categoryId = categoryId;
      }

      const response = await axiosInstance.get('/products/search/advanced', { params });
      setProducts(response.data.content || []);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication required. Please sign in to view products.');
      } else {
        setError('Failed to fetch products. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(keyword, selectedCategory);
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    fetchProducts(keyword, catId);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCategory('');
    fetchProducts('', '');
  };

  return (
    <Fade in timeout={500}>
      <Container maxWidth="xl" sx={{ mt: 3, mb: 6 }}>
        {/* Hero Banner Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: '#ffffff',
          }}
        >
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
            Discover Premium Electronics & Tech
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 650, mb: 3 }}>
            Explore top-tier laptops, high-fidelity sound systems, smart wearables, and official accessories at competitive prices.
          </Typography>

          {/* Search and Filters Bar */}
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <TextField
              placeholder="Search products by name or brand..."
              variant="outlined"
              size="small"
              fullWidth
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      {keyword && (
                        <IconButton size="small" onClick={() => setKeyword('')}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small" type="submit" color="primary">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl size="small" sx={{ minWidth: 200, width: { xs: '100%', md: 'auto' } }}>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={selectedCategory}
                label="Category"
                onChange={(e) => handleCategoryChange(e.target.value as string)}
              >
                <MenuItem value="">
                  <em>All Categories</em>
                </MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(keyword || selectedCategory) && (
              <Button variant="outlined" color="secondary" onClick={handleClearFilters} sx={{ whiteSpace: 'nowrap' }}>
                Clear Filters
              </Button>
            )}
          </Box>
        </Paper>

        {/* Content Area */}
        {error ? (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Alert severity="warning" sx={{ mb: 2, display: 'inline-flex', alignItems: 'center' }}>
              {error}
            </Alert>
            {error.includes('Authentication') && (
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </Box>
            )}
          </Box>
        ) : loading ? (
          <Grid container spacing={3}>
            {Array.from(new Array(8)).map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2, mb: 1.5 }} />
                <Skeleton width="40%" sx={{ mb: 0.5 }} />
                <Skeleton width="80%" sx={{ mb: 0.5 }} />
                <Skeleton width="60%" />
              </Grid>
            ))}
          </Grid>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<ShoppingBagIcon sx={{ fontSize: 64 }} />}
            title="No Products Match Your Search"
            description="We couldn't find any products matching your current query or category filter."
            actionLabel="Reset Search Filters"
            onAction={handleClearFilters}
          />
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Fade>
  );
};

export default Home;
