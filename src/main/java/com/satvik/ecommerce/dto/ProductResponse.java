package com.satvik.ecommerce.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String brand;
    private String imageUrl;
    private CategoryResponse category;
    private Double averageRating;
    private Integer reviewCount;
    private Boolean enabled;
}
