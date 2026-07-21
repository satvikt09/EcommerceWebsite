import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
} from '@mui/material';
import type { CategoryRequest, CategoryResponse } from '../services/adminCategoryService';

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (categoryData: CategoryRequest) => Promise<void>;
  categoryToEdit?: CategoryResponse | null;
}

const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open,
  onClose,
  onSave,
  categoryToEdit
}) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Validation / submitting states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setDescription(categoryToEdit.description || '');
      } else {
        setName('');
        setDescription('');
      }
      setErrors({});
    }
  }, [open, categoryToEdit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Category name is required';
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
        description: description.trim()
      });
      onClose();
    } catch (err: any) {
      setErrors({ api: err.response?.data?.message || 'Failed to save category.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {categoryToEdit ? 'Edit Category' : 'Add New Category'}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Category Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
              disabled={submitting}
              autoFocus
            />

            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </Box>

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
            {submitting ? 'Saving...' : 'Save Category'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CategoryFormDialog;
