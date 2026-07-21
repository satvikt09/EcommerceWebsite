package com.satvik.ecommerce.controller;

import com.satvik.ecommerce.dto.WishlistItemRequest;
import com.satvik.ecommerce.dto.WishlistResponse;
import com.satvik.ecommerce.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<WishlistResponse> getWishlist() {
        return ResponseEntity.ok(wishlistService.getWishlist());
    }

    @PostMapping({"/items", "/add"})
    public ResponseEntity<WishlistResponse> addToWishlist(@Valid @RequestBody WishlistItemRequest request) {
        return ResponseEntity.ok(wishlistService.addToWishlist(request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<WishlistResponse> removeFromWishlist(@PathVariable Long itemId) {
        return ResponseEntity.ok(wishlistService.removeFromWishlist(itemId));
    }

    @DeleteMapping
    public ResponseEntity<WishlistResponse> clearWishlist() {
        return ResponseEntity.ok(wishlistService.clearWishlist());
    }

    @PostMapping("/items/{itemId}/move-to-cart")
    public ResponseEntity<WishlistResponse> moveToCart(@PathVariable Long itemId) {
        return ResponseEntity.ok(wishlistService.moveToCart(itemId));
    }
}
