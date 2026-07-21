package com.satvik.ecommerce.repository;

import com.satvik.ecommerce.entity.Review;
import com.satvik.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Long productId);
    List<Review> findByUser(User user);
    boolean existsByUserAndProductId(User user, Long productId);
    Optional<Review> findByIdAndUser(Long id, User user);
}
