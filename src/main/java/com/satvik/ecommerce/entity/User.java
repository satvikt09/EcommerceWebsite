package com.satvik.ecommerce.entity;

import com.satvik.ecommerce.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean enabled = true;

    @Builder.Default
    @Column(nullable = false)
    private java.time.LocalDateTime registrationDate = java.time.LocalDateTime.now();
}