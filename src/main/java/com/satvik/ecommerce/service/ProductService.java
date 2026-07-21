package com.satvik.ecommerce.service;

import com.satvik.ecommerce.dto.PageResponse;
import com.satvik.ecommerce.dto.ProductRequest;
import com.satvik.ecommerce.dto.ProductResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    List<ProductResponse> getAllProducts();

    ProductResponse getProductById(Long id);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    List<ProductResponse> getProductsByCategory(Long categoryId);

    List<ProductResponse> searchProductsByName(String name);

    int importProducts(int limit);

    PageResponse<ProductResponse> searchProductsAdvanced(
            String keyword,
            Long categoryId,
            java.math.BigDecimal minPrice,
            java.math.BigDecimal maxPrice,
            Double minRating,
            Boolean inStock,
            Pageable pageable
    );

}
