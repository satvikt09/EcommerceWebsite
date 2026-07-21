package com.satvik.ecommerce.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private Long productId;
    private String productName;
    private Integer rating;
    private String reviewText;
    private LocalDateTime createdDate;
}
