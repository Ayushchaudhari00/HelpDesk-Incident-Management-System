package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateUserRequestDto(

        @NotBlank(message = "name must be filled")
        String name,

        @NotBlank(message = "email must be filled")
        @Email(message = "email is not valid")
        String email,

        @NotBlank(message = "password must be filled")
        @Size(min = 8, message = "password must be at least 8 characters")
        String password,

        @NotNull(message = "role must be given")
        Role role
) {}