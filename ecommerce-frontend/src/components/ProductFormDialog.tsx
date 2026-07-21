import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import type { Product, Category } from '../components/ProductCard';
import type { ProductRequest } from '../services/adminProductService';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (productData: ProductRequest) => Promise<void>;
  categories: Category[];
  productToEdit?: Product | null;
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onClose,
  onSave,
  categories,
  productToEdit
}) => {
  const [name, setName] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      if (productToEdit) {
        setName(productToEdit.name);
        setBrand(productToEdit.brand || '');
        setPrice(productToEdit.price.toString());
        setStock(productToEdit.stock.toString());
        setImageUrl(productToEdit.imageUrl || '');
        setCategoryId(productToEdit.category?.id?.toString() || '');
        setDescription(productToEdit.description || '');
      } else {
        setName('');
        setBrand('');
        setPrice('');
        setStock('');
        setImageUrl('');
        setCategoryId('');
        setDescription('');
      }
      setErrors({});
    }
  }, [open, productToEdit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!categoryId) newErrors.categoryId = 'Category is required';

    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      newErrors.price = 'Price is required';
    } else if (priceNum <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum)) {
      newErrors.stock = 'Stock is required';
    } else if (stockNum < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        brand: brand.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        imageUrl: imageUrl.trim(),
        categoryId: parseInt(categoryId, 10),
        description: description.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrors({ api: err.response?.data?.message || 'Failed to save product.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {productToEdit ? 'Edit Product' : 'Add New Product'}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Product Name */}
            <Grid size={12}>
              <TextField
                label="Product Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
                disabled={submitting}
              />
            </Grid>

            {/* Brand */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Brand"
                fullWidth
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={submitting}
              />
            </Grid>

            {/* Category Dropdown */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.categoryId} required>
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  value={categoryId}
                  label="Category"
                  onChange={(e) => setCategoryId(e.target.value as string)}
                  disabled={submitting}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && <FormHelperText>{errors.categoryId}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Price */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Price ($)"
                type="number"
                slotProps={{ htmlInput: { step: '0.01', min: '0.01' } }}
                fullWidth
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={!!errors.price}
                helperText={errors.price}
                required
                disabled={submitting}
              />
            </Grid>

            {/* Stock */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Stock Quantity"
                type="number"
                slotProps={{ htmlInput: { min: '0' } }}
                fullWidth
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                error={!!errors.stock}
                helperText={errors.stock}
                required
                disabled={submitting}
              />
            </Grid>

            {/* Image URL */}
            <Grid size={12}>
              <TextField
                label="Image URL"
                fullWidth
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={submitting}
              />
            </Grid>

            {/* Description */}
            <Grid size={12}>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
              />
            </Grid>
          </Grid>

          {errors.api && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.api}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Product'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ProductFormDialog;
