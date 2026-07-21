package com.satvik.ecommerce.service;

import com.satvik.ecommerce.dto.AdminDashboardResponse;
import com.satvik.ecommerce.dto.OrderResponse;
import com.satvik.ecommerce.dto.ProductResponse;
import com.satvik.ecommerce.dto.ProductStatusRequest;
import com.satvik.ecommerce.dto.UpdateOrderStatusRequest;
import com.satvik.ecommerce.dto.UpdateStockRequest;
import com.satvik.ecommerce.entity.Category;
import com.satvik.ecommerce.entity.Order;
import com.satvik.ecommerce.entity.Product;
import com.satvik.ecommerce.enums.OrderStatus;
import com.satvik.ecommerce.exception.ResourceNotFoundException;
import com.satvik.ecommerce.mapper.OrderMapper;
import com.satvik.ecommerce.repository.*;
import com.satvik.ecommerce.service.impl.AdminServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Spy
    private OrderMapper orderMapper;

    @InjectMocks
    private AdminServiceImpl adminService;

    private Product product;
    private Order order;

    @BeforeEach
    void setUp() {
        Category category = Category.builder()
                .id(1L)
                .name("Electronics")
                .description("Desc")
                .build();

        product = Product.builder()
                .id(1L)
                .name("Test Product")
                .price(BigDecimal.valueOf(100))
                .stock(5)
                .brand("Brand")
                .category(category)
                .averageRating(4.0)
                .reviewCount(1)
                .enabled(true)
                .build();

        order = Order.builder()
                .id(1L)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(200))
                .orderItems(new ArrayList<>())
                .build();
    }

    @Test
    void getDashboardStats_ShouldReturnSummary() {
        when(userRepository.count()).thenReturn(10L);
        when(productRepository.count()).thenReturn(50L);
        when(orderRepository.count()).thenReturn(5L);
        when(orderRepository.getTotalRevenue()).thenReturn(BigDecimal.valueOf(1500));
        when(categoryRepository.count()).thenReturn(4L);

        when(productRepository.findByStockLessThanEqual(10)).thenReturn(Collections.singletonList(product));

        Page<Order> orderPage = new PageImpl<>(Collections.singletonList(order));
        when(orderRepository.findAll(any(Pageable.class))).thenReturn(orderPage);

        AdminDashboardResponse response = adminService.getDashboardStats();

        assertNotNull(response);
        assertEquals(10L, response.getTotalUsers());
        assertEquals(50L, response.getTotalProducts());
        assertEquals(5L, response.getTotalOrders());
        assertEquals(BigDecimal.valueOf(1500), response.getTotalRevenue());
        assertEquals(4L, response.getTotalCategories());
        assertEquals(1, response.getLowStockProducts().size());
        assertEquals(1, response.getRecentOrders().size());
    }

    @Test
    void updateProductStock_ShouldUpdateStock() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        UpdateStockRequest request = UpdateStockRequest.builder()
                .stock(20)
                .build();

        ProductResponse response = adminService.updateProductStock(1L, request);

        assertNotNull(response);
        assertEquals(20, response.getStock());
    }

    @Test
    void toggleProductStatus_ShouldToggleEnabled() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        ProductStatusRequest request = ProductStatusRequest.builder()
                .enabled(false)
                .build();

        ProductResponse response = adminService.toggleProductStatus(1L, request);

        assertNotNull(response);
        assertFalse(response.getEnabled());
    }

    @Test
    void updateOrderStatus_ShouldUpdateStatus_WhenTransitionIsValid() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.CONFIRMED)
                .build();

        OrderResponse response = adminService.updateOrderStatus(1L, request);

        assertNotNull(response);
        assertEquals(OrderStatus.CONFIRMED, response.getStatus());
    }

    @Test
    void updateOrderStatus_ShouldThrowException_WhenTransitionIsInvalid() {
        order.setStatus(OrderStatus.DELIVERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.PENDING) // Cannot transition back from DELIVERED to PENDING
                .build();

        assertThrows(IllegalStateException.class, () -> adminService.updateOrderStatus(1L, request));
    }
}
