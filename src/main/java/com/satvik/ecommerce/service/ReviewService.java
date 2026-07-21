package com.satvik.ecommerce.service;

import com.satvik.ecommerce.dto.ReviewRequest;
import com.satvik.ecommerce.dto.ReviewResponse;
import com.satvik.ecommerce.dto.UpdateReviewRequest;

import java.util.List;

public interface ReviewService {
    ReviewResponse addReview(ReviewRequest request);
    ReviewResponse updateReview(Long reviewId, UpdateReviewRequest request);
    void deleteReview(Long reviewId);
    List<ReviewResponse> getReviewsByProduct(Long productId);
    List<ReviewResponse> getAuthenticatedUserReviews();
}
