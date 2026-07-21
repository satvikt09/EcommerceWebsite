package com.satvik.ecommerce.mapper;

import com.satvik.ecommerce.dto.ReviewResponse;
import com.satvik.ecommerce.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review review) {
        if (review == null) {
            return null;
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userFullName(review.getUser().getFullName())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .rating(review.getRating())
                .reviewText(review.getReviewText())
                .createdDate(review.getCreatedDate())
                .build();
    }
}
