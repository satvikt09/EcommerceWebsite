package com.satvik.ecommerce.service;

import com.satvik.ecommerce.dto.WishlistItemRequest;
import com.satvik.ecommerce.dto.WishlistResponse;

public interface WishlistService {
    WishlistResponse getWishlist();
    WishlistResponse addToWishlist(WishlistItemRequest request);
    WishlistResponse removeFromWishlist(Long itemId);
    WishlistResponse clearWishlist();
    WishlistResponse moveToCart(Long itemId);
}
