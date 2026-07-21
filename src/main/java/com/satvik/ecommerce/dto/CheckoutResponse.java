package com.satvik.ecommerce.dto;

import com.satvik.ecommerce.enums.OrderStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutResponse {
    private Long orderId;
    private BigDecimal total;
    private OrderStatus orderStatus;
    private LocalDateTime orderDate;
}
