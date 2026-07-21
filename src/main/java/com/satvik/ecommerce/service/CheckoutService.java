package com.satvik.ecommerce.service;

import com.satvik.ecommerce.dto.CheckoutResponse;
import com.satvik.ecommerce.dto.RealCheckoutRequest;

public interface CheckoutService {
    CheckoutResponse checkout(RealCheckoutRequest request);
}
