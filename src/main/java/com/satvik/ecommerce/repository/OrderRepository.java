package com.satvik.ecommerce.repository;

import com.satvik.ecommerce.entity.Order;
import com.satvik.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByOrderDateDesc(User user);
    Optional<Order> findByIdAndUser(Long id, User user);
    long countByUser(User user);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status <> com.satvik.ecommerce.enums.OrderStatus.CANCELLED")
    BigDecimal getTotalRevenue();
}
