package com.satvik.ecommerce.service;

import com.satvik.ecommerce.dto.CartItemRequest;
import com.satvik.ecommerce.dto.WishlistItemRequest;
import com.satvik.ecommerce.dto.WishlistResponse;
import com.satvik.ecommerce.entity.Product;
import com.satvik.ecommerce.entity.User;
import com.satvik.ecommerce.entity.Wishlist;
import com.satvik.ecommerce.entity.WishlistItem;
import com.satvik.ecommerce.enums.Role;
import com.satvik.ecommerce.exception.ResourceAlreadyExistsException;
import com.satvik.ecommerce.exception.ResourceNotFoundException;
import com.satvik.ecommerce.mapper.WishlistMapper;
import com.satvik.ecommerce.repository.ProductRepository;
import com.satvik.ecommerce.repository.UserRepository;
import com.satvik.ecommerce.repository.WishlistRepository;
import com.satvik.ecommerce.service.impl.WishlistServiceImpl;
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
class WishlistServiceImplTest {

    @Mock
    private WishlistRepository wishlistRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CartService cartService;

    @Spy
    private WishlistMapper wishlistMapper;

    @InjectMocks
    private WishlistServiceImpl wishlistService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    private User user;
    private Product product;
    private Wishlist wishlist;

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
                .name("Wishlist Product")
                .price(BigDecimal.valueOf(150))
                .stock(5)
                .build();

        wishlist = Wishlist.builder()
                .id(1L)
                .user(user)
                .wishlistItems(new ArrayList<>())
                .build();
    }

    private void mockAuthentication() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("john@example.com");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
    }

    @Test
    void getWishlist_ShouldCreateWishlist_WhenNotExists() {
        mockAuthentication();
        when(wishlistRepository.findByUser(user)).thenReturn(Optional.empty());
        when(wishlistRepository.save(any(Wishlist.class))).thenAnswer(inv -> inv.getArgument(0));

        WishlistResponse response = wishlistService.getWishlist();

        assertNotNull(response);
        assertEquals(user.getId(), response.getUserId());
        assertTrue(response.getItems().isEmpty());
        verify(wishlistRepository, times(1)).save(any(Wishlist.class));
    }

    @Test
    void addToWishlist_ShouldAddProduct_WhenNotDuplicate() {
        mockAuthentication();
        when(wishlistRepository.findByUser(user)).thenReturn(Optional.of(wishlist));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(wishlistRepository.save(any(Wishlist.class))).thenReturn(wishlist);

        WishlistItemRequest request = WishlistItemRequest.builder()
                .productId(1L)
                .build();

        WishlistResponse response = wishlistService.addToWishlist(request);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals(1L, response.getItems().get(0).getProductId());
    }

    @Test
    void addToWishlist_ShouldThrowResourceAlreadyExistsException_WhenDuplicate() {
        mockAuthentication();
        WishlistItem item = WishlistItem.builder()
                .id(1L)
                .wishlist(wishlist)
                .product(product)
                .build();
        wishlist.addWishlistItem(item);

        when(wishlistRepository.findByUser(user)).thenReturn(Optional.of(wishlist));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        WishlistItemRequest request = WishlistItemRequest.builder()
                .productId(1L)
                .build();

        assertThrows(ResourceAlreadyExistsException.class, () -> wishlistService.addToWishlist(request));
    }

    @Test
    void removeFromWishlist_ShouldRemoveItem() {
        mockAuthentication();
        WishlistItem item = WishlistItem.builder()
                .id(1L)
                .wishlist(wishlist)
                .product(product)
                .build();
        wishlist.addWishlistItem(item);

        when(wishlistRepository.findByUser(user)).thenReturn(Optional.of(wishlist));
        when(wishlistRepository.save(any(Wishlist.class))).thenReturn(wishlist);

        WishlistResponse response = wishlistService.removeFromWishlist(1L);

        assertNotNull(response);
        assertTrue(response.getItems().isEmpty());
    }

    @Test
    void moveToCart_ShouldAddProductToCartAndRemoveFromWishlist() {
        mockAuthentication();
        WishlistItem item = WishlistItem.builder()
                .id(1L)
                .wishlist(wishlist)
                .product(product)
                .build();
        wishlist.addWishlistItem(item);

        when(wishlistRepository.findByUser(user)).thenReturn(Optional.of(wishlist));
        when(wishlistRepository.save(any(Wishlist.class))).thenReturn(wishlist);

        WishlistResponse response = wishlistService.moveToCart(1L);

        assertNotNull(response);
        assertTrue(response.getItems().isEmpty());
        verify(cartService, times(1)).addToCart(any(CartItemRequest.class));
    }
}
