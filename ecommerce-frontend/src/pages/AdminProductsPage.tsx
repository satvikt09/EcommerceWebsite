import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  Snackbar,
  Alert,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import SearchIcon from '@mui/icons-material/Search';

import { useAuth } from '../context/AuthContext';
import {
  getAllProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  toggleProductStatus,
  type ProductRequest
} from '../services/adminProductService';
import type { Product, Category } from '../components/ProductCard';
import ProductFormDialog from '../components/ProductFormDialog';

type OrderBy = 'name' | 'price' | 'stock';
type Order = 'asc' | 'desc';

const AdminProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Sorting state
  const [orderBy, setOrderBy] = useState<OrderBy>('name');
  const [order, setOrder] = useState<Order>('asc');

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Reusable Form Dialog state
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete Dialog state
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  // Stock Dialog state
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockInput, setStockInput] = useState<string>('');
  const [stockError, setStockError] = useState<string | null>(null);

  // Snackbar feedback state
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const prodData = await getAllProducts();
      setProducts(prodData);
      const catData = await getCategories();
      setCategories(catData);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Access denied. Administrator privileges are required.');
      } else {
        setError('Failed to retrieve catalog details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'ADMIN') {
        setError('Access denied. Administrator privileges are required.');
        setLoading(false);
      } else {
        fetchData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) navigate('/admin/analytics');
    if (newValue === 1) navigate('/admin/products');
    if (newValue === 2) navigate('/admin/categories');
    if (newValue === 3) navigate('/admin/users');
  };

  // Request sort
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Pagination actions
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Status toggle
  const handleToggleStatus = async (product: Product) => {
    try {
      const updated = await toggleProductStatus(product.id, !product.enabled);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSnackbarMessage(`Status updated for ${product.name}`);
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to update status.');
      setSnackbarSeverity('error');
    }
  };

  // Stock edit save
  const handleSaveStock = async () => {
    if (!stockProduct) return;
    const stockVal = parseInt(stockInput, 10);
    if (isNaN(stockVal) || stockVal < 0) {
      setStockError('Stock must be a positive integer.');
      return;
    }
    setStockError(null);
    try {
      const updated = await updateProductStock(stockProduct.id, stockVal);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setStockProduct(null);
      setSnackbarMessage(`Stock updated for ${stockProduct.name}`);
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to update stock.');
      setSnackbarSeverity('error');
    }
  };

  // Delete product action
  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;
    try {
      await deleteProduct(deletingProductId);
      setProducts((prev) => prev.filter((p) => p.id !== deletingProductId));
      setDeletingProductId(null);
      setSnackbarMessage('Product deleted successfully.');
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to delete product.');
      setSnackbarSeverity('error');
    }
  };

  // Form Save callback (handles both Create and Update)
  const handleSaveProductForm = async (productData: ProductRequest) => {
    if (editingProduct) {
      const updated = await updateProduct(editingProduct.id, productData);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSnackbarMessage(`Product ${updated.name} updated.`);
      setSnackbarSeverity('success');
    } else {
      const created = await createProduct(productData);
      setProducts((prev) => [created, ...prev]);
      setSnackbarMessage(`Product ${created.name} added successfully.`);
      setSnackbarSeverity('success');
    }
    setOpenForm(false);
    setEditingProduct(null);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setOpenForm(true);
  };

  const handleOpenStock = (product: Product) => {
    setStockProduct(product);
    setStockInput(product.stock.toString());
    setStockError(null);
  };

  // Filter & search logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory =
      selectedCategory === 'ALL' || p.category?.id?.toString() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    if (orderBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (orderBy === 'price') {
      comparison = a.price - b.price;
    } else if (orderBy === 'stock') {
      comparison = a.stock - b.stock;
    }
    return order === 'asc' ? comparison : -comparison;
  });

  // Paginated chunk
  const paginatedProducts = sortedProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (authLoading || loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Skeleton width="40%" height={40} />
          <Skeleton width="15%" height={40} />
        </Box>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3, display: 'inline-flex', alignItems: 'center' }}>
          {error}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Tab Navigation Menu */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={1} onChange={handleTabChange} aria-label="admin navigation panels">
          <Tab label="Analytics" sx={{ fontWeight: 600 }} />
          <Tab label="Products" sx={{ fontWeight: 600 }} />
          <Tab label="Categories" sx={{ fontWeight: 600 }} />
          <Tab label="Users" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Product Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ fontWeight: 600 }}
        >
          Add Product
        </Button>
      </Box>

      {/* Filter panel */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Search Name / Brand"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-select-label">Filter Category</InputLabel>
              <Select
                labelId="category-filter-select-label"
                id="category-filter-select"
                value={selectedCategory}
                label="Filter Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Table container */}
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table aria-label="products table">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Brand</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={orderBy === 'price'}
                  direction={orderBy === 'price' ? order : 'asc'}
                  onClick={() => handleRequestSort('price')}
                >
                  Price
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={orderBy === 'stock'}
                  direction={orderBy === 'stock' ? order : 'asc'}
                  onClick={() => handleRequestSort('stock')}
                >
                  Stock
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.map((prod) => (
              <TableRow key={prod.id} hover>
                <TableCell>
                  <Avatar
                    src={prod.imageUrl || 'https://via.placeholder.com/40?text=No+Img'}
                    variant="rounded"
                    sx={{ width: 40, height: 40 }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{prod.name}</TableCell>
                <TableCell>{prod.category?.name || 'Uncategorized'}</TableCell>
                <TableCell>{prod.brand || '-'}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>${prod.price.toFixed(2)}</TableCell>
                <TableCell>{prod.stock}</TableCell>
                <TableCell>
                  <Chip
                    label={prod.enabled ? 'Enabled' : 'Disabled'}
                    color={prod.enabled ? 'success' : 'default'}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEdit(prod)}
                      aria-label="Edit product"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleOpenStock(prod)}
                      aria-label="Edit stock"
                    >
                      <InventoryIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color={prod.enabled ? 'warning' : 'success'}
                      onClick={() => handleToggleStatus(prod)}
                      aria-label={prod.enabled ? 'Disable product' : 'Enable product'}
                    >
                      {prod.enabled ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeletingProductId(prod.id)}
                      aria-label="Delete product"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No products found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={handleSaveProductForm}
        categories={categories}
        productToEdit={editingProduct}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingProductId !== null} onClose={() => setDeletingProductId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Product?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeletingProductId(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Update Dialog */}
      <Dialog open={stockProduct !== null} onClose={() => setStockProduct(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Stock Quantity</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the new stock quantity for <strong>{stockProduct?.name}</strong>.
          </DialogContentText>
          <TextField
            label="Stock Quantity"
            type="number"
            slotProps={{ htmlInput: { min: '0' } }}
            fullWidth
            value={stockInput}
            onChange={(e) => setStockInput(e.target.value)}
            error={!!stockError}
            helperText={stockError}
            required
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setStockProduct(null)}>Cancel</Button>
          <Button onClick={handleSaveStock} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* SnackBar Notifications */}
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

export default AdminProductsPage;
