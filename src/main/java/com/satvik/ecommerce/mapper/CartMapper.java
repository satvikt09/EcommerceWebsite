package com.satvik.ecommerce.mapper;

import com.satvik.ecommerce.dto.CartItemResponse;
import com.satvik.ecommerce.dto.CartResponse;
import com.satvik.ecommerce.entity.Cart;
import com.satvik.ecommerce.entity.CartItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CartMapper {

    public CartResponse toResponse(Cart cart) {
        if (cart == null) {
            return null;
        }

        List<CartItemResponse> itemResponses = new ArrayList<>();
        if (cart.getCartItems() != null) {
            itemResponses = cart.getCartItems().stream()
                    .map(this::toItemResponse)
                    .collect(Collectors.toList());
        }

        BigDecimal totalPrice = itemResponses.stream()
                .map(CartItemResponse::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemResponses)
                .totalPrice(totalPrice)
                .build();
    }

    public CartItemResponse toItemResponse(CartItem item) {
        if (item == null) {
            return null;
        }

        BigDecimal price = item.getProduct().getPrice();
        BigDecimal subTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productPrice(price)
                .imageUrl(item.getProduct().getImageUrl())
                .quantity(item.getQuantity())
                .subTotal(subTotal)
                .build();
    }
}
