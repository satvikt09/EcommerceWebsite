package com.satvik.ecommerce.service;

import com.satvik.ecommerce.dto.*;

import java.util.List;

public interface AdminService {
    AdminDashboardResponse getDashboardStats();
    ProductResponse updateProductStock(Long productId, UpdateStockRequest request);
    ProductResponse toggleProductStatus(Long productId, ProductStatusRequest request);
    List<OrderResponse> getAllOrders();
    OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request);
    List<AdminUserResponse> getAllUsers();
    AdminUserResponse updateUserRole(Long userId, UserRoleRequest request);
    AdminUserResponse updateUserStatus(Long userId, UserStatusRequest request);
}
