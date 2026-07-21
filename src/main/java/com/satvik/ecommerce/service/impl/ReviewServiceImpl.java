package com.satvik.ecommerce.service.impl;

import com.satvik.ecommerce.dto.ReviewRequest;
import com.satvik.ecommerce.dto.ReviewResponse;
import com.satvik.ecommerce.dto.UpdateReviewRequest;
import com.satvik.ecommerce.entity.Product;
import com.satvik.ecommerce.entity.Review;
import com.satvik.ecommerce.entity.User;
import com.satvik.ecommerce.exception.ResourceAlreadyExistsException;
import com.satvik.ecommerce.exception.ResourceNotFoundException;
import com.satvik.ecommerce.mapper.ReviewMapper;
import com.satvik.ecommerce.repository.ProductRepository;
import com.satvik.ecommerce.repository.ReviewRepository;
import com.satvik.ecommerce.repository.UserRepository;
import com.satvik.ecommerce.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;

    @Override
    public ReviewResponse addReview(ReviewRequest request) {
        User user = getAuthenticatedUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (reviewRepository.existsByUserAndProductId(user, request.getProductId())) {
            throw new ResourceAlreadyExistsException("You have already reviewed this product");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .reviewText(request.getReviewText())
                .createdDate(LocalDateTime.now())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Update product average rating & review count
        updateProductStats(product);

        return reviewMapper.toResponse(savedReview);
    }

    @Override
    public ReviewResponse updateReview(Long reviewId, UpdateReviewRequest request) {
        User user = getAuthenticatedUser();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("You are not authorized to modify this review");
        }

        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());
        Review updatedReview = reviewRepository.save(review);

        // Update product average rating & review count
        updateProductStats(review.getProduct());

        return reviewMapper.toResponse(updatedReview);
    }

    @Override
    public void deleteReview(Long reviewId) {
        User user = getAuthenticatedUser();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("You are not authorized to delete this review");
        }

        Product product = review.getProduct();
        reviewRepository.delete(review);

        // Update product average rating & review count
        updateProductStats(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        return reviewRepository.findByProductId(productId).stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAuthenticatedUserReviews() {
        User user = getAuthenticatedUser();
        return reviewRepository.findByUser(user).stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    private void updateProductStats(Product product) {
        List<Review> reviews = reviewRepository.findByProductId(product.getId());
        int count = reviews.size();
        double average = 0.0;
        if (count > 0) {
            average = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
        }
        product.setReviewCount(count);
        product.setAverageRating(average);
        productRepository.save(product);
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}
