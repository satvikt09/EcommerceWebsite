package com.satvik.ecommerce.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;
}
