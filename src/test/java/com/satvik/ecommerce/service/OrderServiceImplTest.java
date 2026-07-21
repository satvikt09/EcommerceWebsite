package com.satvik.ecommerce.service;

import com.satvik.ecommerce.dto.CheckoutRequest;
import com.satvik.ecommerce.dto.OrderResponse;
import com.satvik.ecommerce.entity.*;
import com.satvik.ecommerce.enums.OrderStatus;
import com.satvik.ecommerce.enums.Role;
import com.satvik.ecommerce.exception.InsufficientStockException;
import com.satvik.ecommerce.exception.ResourceNotFoundException;
import com.satvik.ecommerce.mapper.OrderMapper;
import com.satvik.ecommerce.repository.*;
import com.satvik.ecommerce.service.impl.OrderServiceImpl;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Spy
    private OrderMapper orderMapper;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    private User user;
    private Product product;
    private Cart cart;
    private CartItem cartItem;

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

        product = Product.builder()
                .id(1L)
                .name("Order Product")
                .price(BigDecimal.valueOf(100))
                .stock(10)
                .build();

        cart = Cart.builder()
                .id(1L)
                .user(user)
                .cartItems(new ArrayList<>())
                .build();

        cartItem = CartItem.builder()
                .id(1L)
                .cart(cart)
                .product(product)
                .quantity(2)
                .build();
    }

    private void mockAuthentication() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("john@example.com");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
    }

    @Test
    void checkout_ShouldThrowException_WhenCartIsEmpty() {
        mockAuthentication();
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));

        CheckoutRequest request = CheckoutRequest.builder()
                .shippingAddress("123 Main St")
                .build();

        assertThrows(IllegalStateException.class, () -> orderService.checkout(request));
    }

    @Test
    void checkout_ShouldThrowException_WhenStockIsInsufficient() {
        mockAuthentication();
        cart.addCartItem(cartItem);
        cartItem.setQuantity(12); // stock is 10

        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));

        CheckoutRequest request = CheckoutRequest.builder()
                .shippingAddress("123 Main St")
                .build();

        assertThrows(InsufficientStockException.class, () -> orderService.checkout(request));
    }

    @Test
    void checkout_ShouldCreateOrder_WhenDetailsAreValid() {
        mockAuthentication();
        cart.addCartItem(cartItem);

        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(1L);
            return o;
        });

        CheckoutRequest request = CheckoutRequest.builder()
                .shippingAddress("123 Main St")
                .build();

        OrderResponse response = orderService.checkout(request);

        assertNotNull(response);
        assertEquals(OrderStatus.PENDING, response.getStatus());
        assertEquals(BigDecimal.valueOf(200), response.getTotalAmount());
        assertEquals("123 Main St", response.getShippingAddress());
        assertEquals(8, product.getStock()); // stock reduced from 10 to 8
        assertTrue(cart.getCartItems().isEmpty()); // cart cleared
    }

    @Test
    void cancelOrder_ShouldRestoreStock_WhenOrderIsPending() {
        mockAuthentication();
        Order order = Order.builder()
                .id(1L)
                .user(user)
                .status(OrderStatus.PENDING)
                .orderItems(new ArrayList<>())
                .totalAmount(BigDecimal.valueOf(200))
                .build();

        OrderItem item = OrderItem.builder()
                .id(1L)
                .order(order)
                .product(product)
                .productName(product.getName())
                .productPrice(product.getPrice())
                .quantity(2)
                .subtotal(BigDecimal.valueOf(200))
                .build();
        order.addOrderItem(item);

        when(orderRepository.findByIdAndUser(1L, user)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderResponse response = orderService.cancelOrder(1L);

        assertNotNull(response);
        assertEquals(OrderStatus.CANCELLED, response.getStatus());
        assertEquals(12, product.getStock()); // stock restored from 10 to 12
    }

    @Test
    void cancelOrder_ShouldThrowException_WhenOrderIsAlreadyCancelled() {
        mockAuthentication();
        Order order = Order.builder()
                .id(1L)
                .user(user)
                .status(OrderStatus.CANCELLED)
                .orderItems(new ArrayList<>())
                .totalAmount(BigDecimal.valueOf(200))
                .build();

        when(orderRepository.findByIdAndUser(1L, user)).thenReturn(Optional.of(order));

        assertThrows(IllegalStateException.class, () -> orderService.cancelOrder(1L));
    }
}
