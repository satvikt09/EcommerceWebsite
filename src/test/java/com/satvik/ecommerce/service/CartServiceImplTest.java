package com.satvik.ecommerce.service;

import com.satvik.ecommerce.dto.CartItemRequest;
import com.satvik.ecommerce.dto.CartResponse;
import com.satvik.ecommerce.dto.UpdateCartItemRequest;
import com.satvik.ecommerce.entity.Cart;
import com.satvik.ecommerce.entity.CartItem;
import com.satvik.ecommerce.entity.Product;
import com.satvik.ecommerce.entity.User;
import com.satvik.ecommerce.enums.Role;
import com.satvik.ecommerce.exception.InsufficientStockException;
import com.satvik.ecommerce.exception.ResourceNotFoundException;
import com.satvik.ecommerce.mapper.CartMapper;
import com.satvik.ecommerce.repository.CartRepository;
import com.satvik.ecommerce.repository.ProductRepository;
import com.satvik.ecommerce.repository.UserRepository;
import com.satvik.ecommerce.service.impl.CartServiceImpl;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Spy
    private CartMapper cartMapper;

    @InjectMocks
    private CartServiceImpl cartService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    private User user;
    private Product product;
    private Cart cart;

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
                .name("Test Product")
                .price(BigDecimal.valueOf(100))
                .stock(10)
                .build();

        cart = Cart.builder()
                .id(1L)
                .user(user)
                .cartItems(new ArrayList<>())
                .build();
    }

    private void mockAuthentication() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("john@example.com");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
    }

    @Test
    void getCart_ShouldReturnEmptyCart_WhenCartDoesNotExist() {
        mockAuthentication();
        when(cartRepository.findByUser(user)).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CartResponse response = cartService.getCart();

        assertNotNull(response);
        assertEquals(user.getId(), response.getUserId());
        assertTrue(response.getItems().isEmpty());
        assertEquals(BigDecimal.ZERO, response.getTotalPrice());
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    void addToCart_ShouldAddNewItem_WhenStockIsSufficient() {
        mockAuthentication();
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        CartItemRequest request = CartItemRequest.builder()
                .productId(1L)
                .quantity(2)
                .build();

        CartResponse response = cartService.addToCart(request);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals(BigDecimal.valueOf(200), response.getTotalPrice());
        assertEquals(2, response.getItems().get(0).getQuantity());
    }

    @Test
    void addToCart_ShouldThrowInsufficientStockException_WhenQuantityExceedsStock() {
        mockAuthentication();
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        CartItemRequest request = CartItemRequest.builder()
                .productId(1L)
                .quantity(11) // exceeds stock of 10
                .build();

        assertThrows(InsufficientStockException.class, () -> cartService.addToCart(request));
    }

    @Test
    void updateItemQuantity_ShouldUpdate_WhenItemExistsAndStockSufficient() {
        mockAuthentication();
        CartItem cartItem = CartItem.builder()
                .id(1L)
                .cart(cart)
                .product(product)
                .quantity(2)
                .build();
        cart.addCartItem(cartItem);

        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        UpdateCartItemRequest request = UpdateCartItemRequest.builder()
                .quantity(5)
                .build();

        CartResponse response = cartService.updateItemQuantity(1L, request);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals(5, response.getItems().get(0).getQuantity());
    }

    @Test
    void removeItem_ShouldRemoveItemFromCart() {
        mockAuthentication();
        CartItem cartItem = CartItem.builder()
                .id(1L)
                .cart(cart)
                .product(product)
                .quantity(2)
                .build();
        cart.addCartItem(cartItem);

        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        CartResponse response = cartService.removeItem(1L);

        assertNotNull(response);
        assertTrue(response.getItems().isEmpty());
        assertEquals(BigDecimal.ZERO, response.getTotalPrice());
    }
}
