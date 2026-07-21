package com.satvik.ecommerce.dto;

import com.satvik.ecommerce.enums.Role;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserResponse {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private Boolean enabled;
    private long orderCount;
    private LocalDateTime registrationDate;
}
