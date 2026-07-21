package com.satvik.ecommerce.service;

import com.satvik.ecommerce.dto.CartItemRequest;
import com.satvik.ecommerce.dto.CartResponse;
import com.satvik.ecommerce.dto.UpdateCartItemRequest;

public interface CartService {
    CartResponse getCart();
    CartResponse addToCart(CartItemRequest request);
    CartResponse updateItemQuantity(Long itemId, UpdateCartItemRequest request);
    CartResponse removeItem(Long itemId);
    CartResponse clearCart();
}
