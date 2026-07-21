package com.satvik.ecommerce.service.impl;

import com.satvik.ecommerce.dto.CartItemRequest;
import com.satvik.ecommerce.dto.WishlistItemRequest;
import com.satvik.ecommerce.dto.WishlistResponse;
import com.satvik.ecommerce.entity.Product;
import com.satvik.ecommerce.entity.User;
import com.satvik.ecommerce.entity.Wishlist;
import com.satvik.ecommerce.entity.WishlistItem;
import com.satvik.ecommerce.exception.ResourceAlreadyExistsException;
import com.satvik.ecommerce.exception.ResourceNotFoundException;
import com.satvik.ecommerce.mapper.WishlistMapper;
import com.satvik.ecommerce.repository.ProductRepository;
import com.satvik.ecommerce.repository.UserRepository;
import com.satvik.ecommerce.repository.WishlistRepository;
import com.satvik.ecommerce.service.CartService;
import com.satvik.ecommerce.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final WishlistMapper wishlistMapper;
    private final CartService cartService;

    @Override
    public WishlistResponse getWishlist() {
        Wishlist wishlist = getOrCreateWishlistForAuthenticatedUser();
        return wishlistMapper.toResponse(wishlist);
    }

    @Override
    public WishlistResponse addToWishlist(WishlistItemRequest request) {
        Wishlist wishlist = getOrCreateWishlistForAuthenticatedUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        boolean exists = wishlist.getWishlistItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(request.getProductId()));

        if (exists) {
            throw new ResourceAlreadyExistsException("Product with id '" + request.getProductId() 
                    + "' already exists in the wishlist");
        }

        WishlistItem newItem = WishlistItem.builder()
                .wishlist(wishlist)
                .product(product)
                .build();
        wishlist.addWishlistItem(newItem);

        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        return wishlistMapper.toResponse(savedWishlist);
    }

    @Override
    public WishlistResponse removeFromWishlist(Long itemId) {
        Wishlist wishlist = getOrCreateWishlistForAuthenticatedUser();

        WishlistItem item = wishlist.getWishlistItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found with id: " + itemId));

        wishlist.removeWishlistItem(item);
        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        return wishlistMapper.toResponse(savedWishlist);
    }

    @Override
    public WishlistResponse clearWishlist() {
        Wishlist wishlist = getOrCreateWishlistForAuthenticatedUser();
        wishlist.clearItems();
        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        return wishlistMapper.toResponse(savedWishlist);
    }

    @Override
    public WishlistResponse moveToCart(Long itemId) {
        Wishlist wishlist = getOrCreateWishlistForAuthenticatedUser();

        WishlistItem item = wishlist.getWishlistItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found with id: " + itemId));

        Product product = item.getProduct();

        // 1. Add to Cart (using CartService, which performs stock checks)
        CartItemRequest cartItemRequest = CartItemRequest.builder()
                .productId(product.getId())
                .quantity(1)
                .build();
        cartService.addToCart(cartItemRequest);

        // 2. Remove from Wishlist
        wishlist.removeWishlistItem(item);
        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        return wishlistMapper.toResponse(savedWishlist);
    }

    private Wishlist getOrCreateWishlistForAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return wishlistRepository.findByUser(user)
                .orElseGet(() -> {
                    Wishlist newWishlist = Wishlist.builder()
                            .user(user)
                            .build();
                    return wishlistRepository.save(newWishlist);
                });
    }
}
