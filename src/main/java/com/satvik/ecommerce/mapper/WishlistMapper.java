package com.satvik.ecommerce.mapper;

import com.satvik.ecommerce.dto.WishlistItemResponse;
import com.satvik.ecommerce.dto.WishlistResponse;
import com.satvik.ecommerce.entity.Wishlist;
import com.satvik.ecommerce.entity.WishlistItem;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class WishlistMapper {

    public WishlistResponse toResponse(Wishlist wishlist) {
        if (wishlist == null) {
            return null;
        }

        List<WishlistItemResponse> itemResponses = new ArrayList<>();
        if (wishlist.getWishlistItems() != null) {
            itemResponses = wishlist.getWishlistItems().stream()
                    .map(this::toItemResponse)
                    .collect(Collectors.toList());
        }

        return WishlistResponse.builder()
                .id(wishlist.getId())
                .userId(wishlist.getUser().getId())
                .items(itemResponses)
                .build();
    }

    public WishlistItemResponse toItemResponse(WishlistItem item) {
        if (item == null) {
            return null;
        }

        return WishlistItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productPrice(item.getProduct().getPrice())
                .imageUrl(item.getProduct().getImageUrl())
                .build();
    }
}
