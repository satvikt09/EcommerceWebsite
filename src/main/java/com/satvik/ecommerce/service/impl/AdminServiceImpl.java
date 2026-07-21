package com.satvik.ecommerce.service.impl;

import com.satvik.ecommerce.dto.*;
import com.satvik.ecommerce.entity.Order;
import com.satvik.ecommerce.entity.Product;
import com.satvik.ecommerce.enums.OrderStatus;
import com.satvik.ecommerce.exception.ResourceNotFoundException;
import com.satvik.ecommerce.mapper.OrderMapper;
import com.satvik.ecommerce.repository.*;
import com.satvik.ecommerce.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;
    private final OrderMapper orderMapper;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        long totalCategories = categoryRepository.count();

        // Low-stock products (threshold: stock <= 10)
        List<ProductResponse> lowStockProducts = productRepository.findByStockLessThanEqual(10).stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());

        // Recent 5 orders
        List<OrderResponse> recentOrders = orderRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "orderDate"))
        ).getContent().stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .totalCategories(totalCategories)
                .lowStockProducts(lowStockProducts)
                .recentOrders(recentOrders)
                .build();
    }

    @Override
    public ProductResponse updateProductStock(Long productId, UpdateStockRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        product.setStock(request.getStock());
        Product savedProduct = productRepository.save(product);
        return mapToProductResponse(savedProduct);
    }

    @Override
    public ProductResponse toggleProductStatus(Long productId, ProductStatusRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        product.setEnabled(request.getEnabled());
        Product savedProduct = productRepository.save(product);
        return mapToProductResponse(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "orderDate")).stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus currentStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        if (!isValidTransition(currentStatus, newStatus)) {
            throw new IllegalStateException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        return orderMapper.toResponse(savedOrder);
    }

    private boolean isValidTransition(OrderStatus current, OrderStatus next) {
        if (current == next) {
            return true;
        }
        switch (current) {
            case PENDING:
                return next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;
            case CONFIRMED:
                return next == OrderStatus.SHIPPED || next == OrderStatus.CANCELLED;
            case SHIPPED:
                return next == OrderStatus.DELIVERED;
            case DELIVERED:
            case CANCELLED:
            default:
                return false;
        }
    }

    private ProductResponse mapToProductResponse(Product product) {
        CategoryResponse categoryResponse = CategoryResponse.builder()
                .id(product.getCategory().getId())
                .name(product.getCategory().getName())
                .description(product.getCategory().getDescription())
                .build();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .brand(product.getBrand())
                .imageUrl(product.getImageUrl())
                .category(categoryResponse)
                .averageRating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .enabled(product.getEnabled())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> AdminUserResponse.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .enabled(user.getEnabled() == null || user.getEnabled())
                        .orderCount(orderRepository.countByUser(user))
                        .registrationDate(user.getRegistrationDate() == null ? java.time.LocalDateTime.now() : user.getRegistrationDate())
                        .build()
                ).collect(Collectors.toList());
    }

    @Override
    public AdminUserResponse updateUserRole(Long userId, UserRoleRequest request) {
        com.satvik.ecommerce.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setRole(request.getRole());
        com.satvik.ecommerce.entity.User saved = userRepository.save(user);
        return AdminUserResponse.builder()
                .id(saved.getId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .enabled(saved.getEnabled() == null || saved.getEnabled())
                .orderCount(orderRepository.countByUser(saved))
                .registrationDate(saved.getRegistrationDate() == null ? java.time.LocalDateTime.now() : saved.getRegistrationDate())
                .build();
    }

    @Override
    public AdminUserResponse updateUserStatus(Long userId, UserStatusRequest request) {
        com.satvik.ecommerce.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setEnabled(request.getEnabled());
        com.satvik.ecommerce.entity.User saved = userRepository.save(user);
        return AdminUserResponse.builder()
                .id(saved.getId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .enabled(saved.getEnabled() == null || saved.getEnabled())
                .orderCount(orderRepository.countByUser(saved))
                .registrationDate(saved.getRegistrationDate() == null ? java.time.LocalDateTime.now() : saved.getRegistrationDate())
                .build();
    }
}
