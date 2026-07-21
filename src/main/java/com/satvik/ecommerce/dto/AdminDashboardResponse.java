package com.satvik.ecommerce.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {
    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long totalCategories;
    private List<ProductResponse> lowStockProducts;
    private List<OrderResponse> recentOrders;
}
