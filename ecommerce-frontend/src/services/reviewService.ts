import axiosInstance from '../api/axiosInstance';

export interface Review {
  id: number;
  userId: number;
  userFullName: string;
  productId: number;
  productName: string;
  rating: number;
  reviewText: string;
  createdDate: string;
}

export const getReviewsByProduct = async (productId: number): Promise<Review[]> => {
  const response = await axiosInstance.get<Review[]>(`/reviews/product/${productId}`);
  return response.data;
};

export const getMyReviews = async (): Promise<Review[]> => {
  const response = await axiosInstance.get<Review[]>(`/reviews/my`);
  return response.data;
};

export const addReview = async (productId: number, rating: number, reviewText: string): Promise<Review> => {
  const response = await axiosInstance.post<Review>('/reviews', { productId, rating, reviewText });
  return response.data;
};

export const updateReview = async (reviewId: number, rating: number, reviewText: string): Promise<Review> => {
  const response = await axiosInstance.put<Review>(`/reviews/${reviewId}`, { rating, reviewText });
  return response.data;
};

export const deleteReview = async (reviewId: number): Promise<void> => {
  await axiosInstance.delete(`/reviews/${reviewId}`);
};
