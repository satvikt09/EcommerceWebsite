import React, { useState, useEffect } from 'react';
import { Box, Button, Rating, Typography, TextField } from '@mui/material';

interface ReviewFormProps {
  initialRating?: number;
  initialText?: string;
  submitButtonText?: string;
  onSubmit: (rating: number, text: string) => Promise<void>;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  initialRating = 5,
  initialText = '',
  submitButtonText = 'Submit Review',
  onSubmit,
  onCancel
}) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [reviewText, setReviewText] = useState<string>(initialText);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setRating(initialRating);
    setReviewText(initialText);
  }, [initialRating, initialText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(rating, reviewText.trim());
      if (!initialText) {
        // Reset form for fresh submission
        setReviewText('');
        setRating(5);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography component="legend" sx={{ fontWeight: 600 }}>Your Rating:</Typography>
        <Rating
          name="review-rating"
          value={rating}
          precision={1}
          onChange={(_, newValue) => {
            if (newValue !== null) {
              setRating(newValue);
            }
          }}
          disabled={submitting}
        />
      </Box>

      <TextField
        label="Share your thoughts"
        multiline
        rows={4}
        fullWidth
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        error={!!error}
        helperText={error}
        disabled={submitting}
        required
      />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        {onCancel && (
          <Button variant="outlined" color="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="contained" color="primary" disabled={submitting}>
          {submitting ? 'Submitting...' : submitButtonText}
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewForm;
