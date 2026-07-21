package com.satvik.ecommerce.dto;

import com.satvik.ecommerce.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRoleRequest {

    @NotNull(message = "Role is required")
    private Role role;
}
