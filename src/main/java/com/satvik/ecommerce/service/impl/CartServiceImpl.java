package com.satvik.ecommerce.service.impl;

import com.satvik.ecommerce.dto.CartItemRequest;
import com.satvik.ecommerce.dto.CartResponse;
import com.satvik.ecommerce.dto.UpdateCartItemRequest;
import com.satvik.ecommerce.entity.Cart;
import com.satvik.ecommerce.entity.CartItem;
import com.satvik.ecommerce.entity.Product;
import com.satvik.ecommerce.entity.User;
import com.satvik.ecommerce.exception.InsufficientStockException;
import com.satvik.ecommerce.exception.ResourceNotFoundException;
import com.satvik.ecommerce.mapper.CartMapper;
import com.satvik.ecommerce.repository.CartRepository;
import com.satvik.ecommerce.repository.ProductRepository;
import com.satvik.ecommerce.repository.UserRepository;
import com.satvik.ecommerce.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartMapper cartMapper;

    @Override
    public CartResponse getCart() {
        Cart cart = getOrCreateCartForAuthenticatedUser();
        return cartMapper.toResponse(cart);
    }

    @Override
    public CartResponse addToCart(CartItemRequest request) {
        Cart cart = getOrCreateCartForAuthenticatedUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (request.getQuantity() > product.getStock()) {
            throw new InsufficientStockException("Insufficient stock for product '" + product.getName() 
                    + "'. Available stock: " + product.getStock());
        }

        CartItem existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getId().equals(request.getProductId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (newQuantity > product.getStock()) {
                throw new InsufficientStockException("Insufficient stock for product '" + product.getName() 
                        + "'. Total quantity in cart would exceed available stock (" + product.getStock() + ").");
            }
            existingItem.setQuantity(newQuantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cart.addCartItem(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return cartMapper.toResponse(savedCart);
    }

    @Override
    public CartResponse updateItemQuantity(Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCartForAuthenticatedUser();

        CartItem cartItem = cart.getCartItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        Product product = cartItem.getProduct();
        if (request.getQuantity() > product.getStock()) {
            throw new InsufficientStockException("Insufficient stock for product '" + product.getName() 
                    + "'. Available stock: " + product.getStock());
        }

        cartItem.setQuantity(request.getQuantity());
        Cart savedCart = cartRepository.save(cart);
        return cartMapper.toResponse(savedCart);
    }

    @Override
    public CartResponse removeItem(Long itemId) {
        Cart cart = getOrCreateCartForAuthenticatedUser();

        CartItem cartItem = cart.getCartItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        cart.removeCartItem(cartItem);
        Cart savedCart = cartRepository.save(cart);
        return cartMapper.toResponse(savedCart);
    }

    @Override
    public CartResponse clearCart() {
        Cart cart = getOrCreateCartForAuthenticatedUser();
        cart.clearItems();
        Cart savedCart = cartRepository.save(cart);
        return cartMapper.toResponse(savedCart);
    }

    private Cart getOrCreateCartForAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(newCart);
                });
    }
}
