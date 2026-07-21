package com.satvik.ecommerce.repository;

import com.satvik.ecommerce.entity.Cart;
import com.satvik.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
    Optional<Cart> findByUserEmail(String email);
}
