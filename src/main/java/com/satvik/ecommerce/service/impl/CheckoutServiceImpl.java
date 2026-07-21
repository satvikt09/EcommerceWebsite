package com.satvik.ecommerce.service.impl;

import com.satvik.ecommerce.dto.CheckoutResponse;
import com.satvik.ecommerce.dto.RealCheckoutRequest;
import com.satvik.ecommerce.entity.*;
import com.satvik.ecommerce.enums.OrderStatus;
import com.satvik.ecommerce.exception.InsufficientStockException;
import com.satvik.ecommerce.exception.ResourceNotFoundException;
import com.satvik.ecommerce.repository.*;
import com.satvik.ecommerce.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class CheckoutServiceImpl implements CheckoutService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Override
    public CheckoutResponse checkout(RealCheckoutRequest request) {
        // 1. Get authenticated user
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // 2. Fetch user's cart
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + email));

        // 3. Validate cart is not empty
        if (cart.getCartItems().isEmpty()) {
            throw new IllegalStateException("Cart is empty. Cannot checkout.");
        }

        // 4. Validate stock levels
        for (CartItem item : cart.getCartItems()) {
            Product product = item.getProduct();
            if (item.getQuantity() > product.getStock()) {
                throw new InsufficientStockException("Insufficient stock for product '" + product.getName() 
                        + "'. Available stock: " + product.getStock());
            }
        }

        // 5. Reduce product stock levels
        for (CartItem item : cart.getCartItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
        }

        // 6. Calculate total amount
        BigDecimal totalAmount = cart.getCartItems().stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 7. Format concatenated address
        String formattedAddress = String.format("%s, %s, %s - %s, %s. Phone: %s. Payment: %s",
                request.getShippingAddress(),
                request.getCity(),
                request.getState(),
                request.getZip(),
                request.getCountry(),
                request.getPhone(),
                request.getPaymentMethod()
        );

        // 8. Create Order
        Order order = Order.builder()
                .user(user)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .orderDate(LocalDateTime.now())
                .shippingAddress(formattedAddress)
                .build();

        // 9. Create OrderItems
        for (CartItem item : cart.getCartItems()) {
            BigDecimal price = item.getProduct().getPrice();
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(item.getProduct())
                    .productName(item.getProduct().getName())
                    .productPrice(price)
                    .quantity(item.getQuantity())
                    .subtotal(subtotal)
                    .build();
            order.addOrderItem(orderItem);
        }

        // 10. Save order
        Order savedOrder = orderRepository.save(order);

        // 11. Clear user's cart
        cart.clearItems();
        cartRepository.save(cart);

        // 12. Return summary response
        return CheckoutResponse.builder()
                .orderId(savedOrder.getId())
                .total(savedOrder.getTotalAmount())
                .orderStatus(savedOrder.getStatus())
                .orderDate(savedOrder.getOrderDate())
                .build();
    }
}
