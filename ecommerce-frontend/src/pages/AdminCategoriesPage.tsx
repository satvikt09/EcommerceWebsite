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
  Tabs,
  Tab,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

import { useAuth } from '../context/AuthContext';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryRequest,
  type CategoryResponse
} from '../services/adminCategoryService';
import { getAllProducts } from '../services/adminProductService';
import type { Product } from '../components/ProductCard';
import CategoryFormDialog from '../components/CategoryFormDialog';

const AdminCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic counts of products per category
  const [productCounts, setProductCounts] = useState<Record<number, number>>({});

  // Filters / search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form Dialog state
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);

  // Delete Confirmation Dialog state
  const [deletingCat, setDeletingCat] = useState<CategoryResponse | null>(null);

  // Snackbar notifications
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const catData = await getCategories();
      setCategories(catData);
      const prodData = await getAllProducts();
      setProducts(prodData);

      // Compute counts
      const counts: Record<number, number> = {};
      prodData.forEach((p) => {
        if (p.category?.id) {
          counts[p.category.id] = (counts[p.category.id] || 0) + 1;
        }
      });
      setProductCounts(counts);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Access denied. Administrator privileges are required.');
      } else {
        setError('Failed to retrieve categories. Please try again.');
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

  // Tab navigation index
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) navigate('/admin/analytics');
    if (newValue === 1) navigate('/admin/products');
    if (newValue === 2) navigate('/admin/categories');
    if (newValue === 3) navigate('/admin/users');
  };

  // Create or update category
  const handleSaveForm = async (catData: CategoryRequest) => {
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, catData);
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setSnackbarMessage(`Category "${updated.name}" updated successfully.`);
      } else {
        const created = await createCategory(catData);
        setCategories((prev) => [...prev, created]);
        setSnackbarMessage(`Category "${created.name}" added successfully.`);
      }
      setSnackbarSeverity('success');
      setOpenForm(false);
      setEditingCategory(null);
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to save category.');
      setSnackbarSeverity('error');
    }
  };

  // Delete Category confirm
  const handleDeleteConfirm = async () => {
    if (!deletingCat) return;
    try {
      await deleteCategory(deletingCat.id);
      setCategories((prev) => prev.filter((c) => c.id !== deletingCat.id));
      setSnackbarMessage(`Category "${deletingCat.name}" deleted.`);
      setSnackbarSeverity('success');
      setDeletingCat(null);
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to delete category.');
      setSnackbarSeverity('error');
    }
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (cat: CategoryResponse) => {
    setEditingCategory(cat);
    setOpenForm(true);
  };

  // Filters by name
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Skeleton width="40%" height={40} sx={{ mb: 4 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
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
        <Tabs value={2} onChange={handleTabChange} aria-label="admin navigation panels">
          <Tab label="Analytics" sx={{ fontWeight: 600 }} />
          <Tab label="Products" sx={{ fontWeight: 600 }} />
          <Tab label="Categories" sx={{ fontWeight: 600 }} />
          <Tab label="Users" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Categories Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Category Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ fontWeight: 600 }}
        >
          Add Category
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          label="Search Categories"
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
      </Paper>

      {/* Categories Table */}
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table aria-label="categories table">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, width: '25%' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '45%' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '15%' }}>Products Count</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, width: '15%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategories.map((cat) => {
              const count = productCounts[cat.id] || 0;
              return (
                <TableRow key={cat.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{cat.name}</TableCell>
                  <TableCell color="text.secondary">
                    {cat.description || <Typography variant="caption" color="text.disabled">No description</Typography>}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{count}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEdit(cat)}
                        aria-label="Edit category"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeletingCat(cat)}
                        aria-label="Delete category"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No categories found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form Modal Dialog */}
      <CategoryFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={handleSaveForm}
        categoryToEdit={editingCategory}
      />

      {/* Delete confirmation warning dialog */}
      <Dialog open={deletingCat !== null} onClose={() => setDeletingCat(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Category?</DialogTitle>
        <DialogContent>
          {deletingCat && (productCounts[deletingCat.id] || 0) > 0 ? (
            <DialogContentText color="error">
              <strong>Warning:</strong> The category &ldquo;{deletingCat.name}&rdquo; has{' '}
              <strong>{productCounts[deletingCat.id]}</strong> associated products. Deleting it may cause Database Integrity failures or leave products uncategorized.
            </DialogContentText>
          ) : (
            <DialogContentText>
              Are you sure you want to permanently delete category &ldquo;{deletingCat?.name}&rdquo;?
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeletingCat(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notification updates */}
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

export default AdminCategoriesPage;
