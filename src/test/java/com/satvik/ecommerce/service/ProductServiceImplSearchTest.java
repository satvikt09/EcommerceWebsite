package com.satvik.ecommerce.service;

import com.satvik.ecommerce.dto.PageResponse;
import com.satvik.ecommerce.dto.ProductResponse;
import com.satvik.ecommerce.entity.Category;
import com.satvik.ecommerce.entity.Product;
import com.satvik.ecommerce.repository.ProductRepository;
import com.satvik.ecommerce.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplSearchTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product product;

    @BeforeEach
    void setUp() {
        Category category = Category.builder()
                .id(1L)
                .name("Electronics")
                .description("Electronic goods")
                .build();

        product = Product.builder()
                .id(1L)
                .name("Smartphone")
                .description("A great phone")
                .price(BigDecimal.valueOf(500))
                .stock(10)
                .category(category)
                .averageRating(4.5)
                .reviewCount(5)
                .build();
    }

    @Test
    void searchProductsAdvanced_ShouldReturnPaginatedProducts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> page = new PageImpl<>(Collections.singletonList(product), pageable, 1);

        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PageResponse<ProductResponse> response = productService.searchProductsAdvanced(
                "phone", 1L, BigDecimal.valueOf(100), BigDecimal.valueOf(1000), 4.0, true, pageable
        );

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("Smartphone", response.getContent().get(0).getName());
        assertEquals(1, response.getTotalElements());
        assertEquals(1, response.getTotalPages());
        assertEquals(0, response.getPageNumber());
        assertEquals(10, response.getPageSize());

        verify(productRepository, times(1)).findAll(any(Specification.class), any(Pageable.class));
    }
}
