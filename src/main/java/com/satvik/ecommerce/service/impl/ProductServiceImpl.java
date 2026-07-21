package com.satvik.ecommerce.service.impl;

import com.satvik.ecommerce.dto.CategoryResponse;
import com.satvik.ecommerce.dto.PageResponse;
import com.satvik.ecommerce.dto.ProductRequest;
import com.satvik.ecommerce.dto.ProductResponse;
import com.satvik.ecommerce.entity.Category;
import com.satvik.ecommerce.entity.Product;
import com.satvik.ecommerce.exception.ResourceNotFoundException;
import com.satvik.ecommerce.repository.CategoryRepository;
import com.satvik.ecommerce.repository.ProductRepository;
import com.satvik.ecommerce.repository.specification.ProductSpecification;
import com.satvik.ecommerce.service.ProductService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .brand(request.getBrand())
                .imageUrl(request.getImageUrl())
                .category(category)
                .build();

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setBrand(request.getBrand());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        Product updatedProduct = productRepository.save(product);
        return mapToResponse(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    @Override
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }
        return productRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> searchProductsByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public int importProducts(int limit) {
        RestClient restClient = RestClient.create();
        DummyJsonResponse response = restClient.get()
                .uri("https://dummyjson.com/products?limit=" + limit)
                .retrieve()
                .body(DummyJsonResponse.class);

        int importedCount = 0;
        if (response != null && response.getProducts() != null) {
            for (DummyProduct dummyProduct : response.getProducts()) {
                if (productRepository.existsByName(dummyProduct.getTitle())) {
                    continue;
                }

                Category category = categoryRepository.findByName(dummyProduct.getCategory())
                        .orElseGet(() -> {
                            Category newCategory = Category.builder()
                                    .name(dummyProduct.getCategory())
                                    .description(dummyProduct.getCategory() + " Category")
                                    .build();
                            return categoryRepository.save(newCategory);
                        });

                Product product = Product.builder()
                        .name(dummyProduct.getTitle())
                        .description(dummyProduct.getDescription())
                        .price(dummyProduct.getPrice())
                        .stock(dummyProduct.getStock())
                        .brand(dummyProduct.getBrand())
                        .imageUrl(dummyProduct.getThumbnail())
                        .category(category)
                        .build();

                productRepository.save(product);
                importedCount++;
            }
        }
        return importedCount;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchProductsAdvanced(
            String keyword,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Double minRating,
            Boolean inStock,
            Pageable pageable
    ) {
        Specification<Product> spec = ProductSpecification.filterProducts(
                keyword, categoryId, minPrice, maxPrice, minRating, inStock, true
        );

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        List<ProductResponse> content = productPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<ProductResponse>builder()
                .content(content)
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .build();
    }

    private ProductResponse mapToResponse(Product product) {
        CategoryResponse categoryResponse = CategoryResponse.builder()
                .id(product.getCategory().getId())
                .name(product.getCategory().getName())
                .description(product.getCategory().getDescription())
                .build();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .brand(product.getBrand())
                .imageUrl(product.getImageUrl())
                .category(categoryResponse)
                .averageRating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .enabled(product.getEnabled())
                .build();
    }

    @Getter
    @Setter
    private static class DummyProduct {
        private String title;
        private String description;
        private BigDecimal price;
        private Integer stock;
        private String brand;
        private String thumbnail;
        private String category;
    }

    @Getter
    @Setter
    private static class DummyJsonResponse {
        private List<DummyProduct> products;
    }
}
