package com.satvik.ecommerce.service;

import com.satvik.ecommerce.dto.AuthResponse;
import com.satvik.ecommerce.dto.LoginRequest;
import com.satvik.ecommerce.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

}