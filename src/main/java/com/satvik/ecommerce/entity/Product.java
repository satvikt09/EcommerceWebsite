package com.satvik.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stock;

    @Column
    private String brand;

    @Column
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, columnDefinition = "double precision default 0.0")
    @Builder.Default
    private Double averageRating = 0.0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(nullable = false, columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean enabled = true;
}
