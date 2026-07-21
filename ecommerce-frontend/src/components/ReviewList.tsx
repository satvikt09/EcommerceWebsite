import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  Alert,
  Snackbar,
  Divider,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import {
  getReviewsByProduct,
  getMyReviews,
  updateReview,
  deleteReview,
  addReview,
  type Review
} from '../services/reviewService';
import ReviewForm from './ReviewForm';

interface ReviewListProps {
  productId: number;
  onReviewsUpdated?: () => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId, onReviewsUpdated }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Deleting state
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  // Snackbar notifications
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const productReviews = await getReviewsByProduct(productId);
      setReviews(productReviews);

      if (user) {
        const userOwnReviews = await getMyReviews();
        setMyReviews(userOwnReviews);
      }
    } catch (err: any) {
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, user]);

  const handleAddReview = async (rating: number, text: string) => {
    try {
      const newRev = await addReview(productId, rating, text);
      setReviews((prev) => [newRev, ...prev]);
      if (user) {
        setMyReviews((prev) => [newRev, ...prev]);
      }
      setSnackbarMessage('Review submitted successfully!');
      setSnackbarSeverity('success');
      if (onReviewsUpdated) {
        onReviewsUpdated();
      }
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to submit review');
      setSnackbarSeverity('error');
    }
  };

  const handleUpdateReview = async (rating: number, text: string) => {
    if (!editingReview) return;
    try {
      const updated = await updateReview(editingReview.id, rating, text);
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setMyReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditingReview(null);
      setSnackbarMessage('Review updated successfully!');
      setSnackbarSeverity('success');
      if (onReviewsUpdated) {
        onReviewsUpdated();
      }
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to update review');
      setSnackbarSeverity('error');
    }
  };

  const handleDeleteReview = async () => {
    if (!deletingReviewId) return;
    try {
      await deleteReview(deletingReviewId);
      setReviews((prev) => prev.filter((r) => r.id !== deletingReviewId));
      setMyReviews((prev) => prev.filter((r) => r.id !== deletingReviewId));
      setDeletingReviewId(null);
      setSnackbarMessage('Review deleted successfully!');
      setSnackbarSeverity('success');
      if (onReviewsUpdated) {
        onReviewsUpdated();
      }
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to delete review');
      setSnackbarSeverity('error');
    }
  };

  const isOwnReview = (review: Review) => {
    return myReviews.some((r) => r.id === review.id);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 3 }}>
        Customer Reviews ({loading ? '...' : reviews.length})
      </Typography>

      {/* Add Review Form */}
      {user ? (
        <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Write a Review
          </Typography>
          <ReviewForm onSubmit={handleAddReview} />
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          Please sign in to write or manage your reviews.
        </Alert>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from(new Array(3)).map((_, idx) => (
            <Card key={idx} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Skeleton width="30%" height={24} sx={{ mb: 1 }} />
                <Skeleton width="20%" height={20} sx={{ mb: 1 }} />
                <Skeleton width="80%" height={18} sx={{ mb: 1 }} />
                <Skeleton width="60%" height={18} />
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : reviews.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No reviews yet. Be the first to share your thoughts!
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reviews.map((review) => {
            const own = isOwnReview(review);
            return (
              <Card key={review.id} sx={{ borderRadius: 2, position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {review.userFullName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.5 }}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(review.createdDate)}
                        </Typography>
                      </Box>
                    </Box>
                    {own && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => setEditingReview(review)}
                          aria-label="Edit review"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeletingReviewId(review.id)}
                          aria-label="Delete review"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-line' }}>
                    {review.reviewText}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingReview}
        onClose={() => setEditingReview(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Your Review</DialogTitle>
        <DialogContent>
          {editingReview && (
            <Box sx={{ pt: 1 }}>
              <ReviewForm
                initialRating={editingReview.rating}
                initialText={editingReview.reviewText}
                submitButtonText="Update Review"
                onSubmit={handleUpdateReview}
                onCancel={() => setEditingReview(null)}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deletingReviewId !== null}
        onClose={() => setDeletingReviewId(null)}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Review?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete your review? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingReviewId(null)}>Cancel</Button>
          <Button onClick={handleDeleteReview} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default ReviewList;
