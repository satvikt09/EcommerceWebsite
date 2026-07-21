package com.satvik.ecommerce.service;

import com.satvik.ecommerce.dto.ReviewRequest;
import com.satvik.ecommerce.dto.ReviewResponse;
import com.satvik.ecommerce.dto.UpdateReviewRequest;
import com.satvik.ecommerce.entity.Product;
import com.satvik.ecommerce.entity.Review;
import com.satvik.ecommerce.entity.User;
import com.satvik.ecommerce.enums.Role;
import com.satvik.ecommerce.exception.ResourceAlreadyExistsException;
import com.satvik.ecommerce.exception.ResourceNotFoundException;
import com.satvik.ecommerce.mapper.ReviewMapper;
import com.satvik.ecommerce.repository.ProductRepository;
import com.satvik.ecommerce.repository.ReviewRepository;
import com.satvik.ecommerce.repository.UserRepository;
import com.satvik.ecommerce.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Spy
    private ReviewMapper reviewMapper;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    private User user;
    private User otherUser;
    private Product product;
    private Review review;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.setContext(securityContext);

        user = User.builder()
                .id(1L)
                .fullName("John Doe")
                .email("john@example.com")
                .password("password")
                .role(Role.USER)
                .build();

        otherUser = User.builder()
                .id(2L)
                .fullName("Jane Doe")
                .email("jane@example.com")
                .password("password")
                .role(Role.USER)
                .build();

        product = Product.builder()
                .id(1L)
                .name("Reviewed Product")
                .price(BigDecimal.valueOf(100))
                .stock(10)
                .averageRating(0.0)
                .reviewCount(0)
                .build();

        review = Review.builder()
                .id(1L)
                .user(user)
                .product(product)
                .rating(4)
                .reviewText("Good product")
                .createdDate(LocalDateTime.now())
                .build();
    }

    private void mockAuthentication() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("john@example.com");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
    }

    @Test
    void addReview_ShouldAddReview_WhenNotAlreadyReviewed() {
        mockAuthentication();
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(reviewRepository.existsByUserAndProductId(user, 1L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenReturn(review);
        when(reviewRepository.findByProductId(1L)).thenReturn(Collections.singletonList(review));

        ReviewRequest request = ReviewRequest.builder()
                .productId(1L)
                .rating(4)
                .reviewText("Good product")
                .build();

        ReviewResponse response = reviewService.addReview(request);

        assertNotNull(response);
        assertEquals(4, response.getRating());
        assertEquals("Good product", response.getReviewText());
        assertEquals(1, product.getReviewCount());
        assertEquals(4.0, product.getAverageRating());
    }

    @Test
    void addReview_ShouldThrowException_WhenAlreadyReviewed() {
        mockAuthentication();
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(reviewRepository.existsByUserAndProductId(user, 1L)).thenReturn(true);

        ReviewRequest request = ReviewRequest.builder()
                .productId(1L)
                .rating(5)
                .reviewText("Duplicate review")
                .build();

        assertThrows(ResourceAlreadyExistsException.class, () -> reviewService.addReview(request));
    }

    @Test
    void updateReview_ShouldUpdateRatingAndText_WhenOwner() {
        mockAuthentication();
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(Review.class))).thenReturn(review);

        // Mock statistics update
        Review updatedReview = Review.builder()
                .id(1L)
                .user(user)
                .product(product)
                .rating(5)
                .reviewText("Excellent product")
                .build();
        when(reviewRepository.findByProductId(1L)).thenReturn(Collections.singletonList(updatedReview));

        UpdateReviewRequest request = UpdateReviewRequest.builder()
                .rating(5)
                .reviewText("Excellent product")
                .build();

        ReviewResponse response = reviewService.updateReview(1L, request);

        assertNotNull(response);
        assertEquals(5, response.getRating());
        assertEquals("Excellent product", response.getReviewText());
        assertEquals(5.0, product.getAverageRating());
    }

    @Test
    void updateReview_ShouldThrowException_WhenNotOwner() {
        mockAuthentication();
        review.setUser(otherUser);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        UpdateReviewRequest request = UpdateReviewRequest.builder()
                .rating(5)
                .reviewText("Hack attempt")
                .build();

        assertThrows(IllegalStateException.class, () -> reviewService.updateReview(1L, request));
    }

    @Test
    void deleteReview_ShouldDelete_WhenOwner() {
        mockAuthentication();
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.findByProductId(1L)).thenReturn(Collections.emptyList());

        reviewService.deleteReview(1L);

        verify(reviewRepository, times(1)).delete(review);
        assertEquals(0, product.getReviewCount());
        assertEquals(0.0, product.getAverageRating());
    }
}
