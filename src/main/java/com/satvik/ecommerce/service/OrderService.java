package com.satvik.ecommerce.service;

import com.satvik.ecommerce.dto.CheckoutRequest;
import com.satvik.ecommerce.dto.OrderResponse;
import java.util.List;

public interface OrderService {
    OrderResponse checkout(CheckoutRequest request);
    List<OrderResponse> getOrderHistory();
    OrderResponse getOrderById(Long orderId);
    OrderResponse cancelOrder(Long orderId);
}
