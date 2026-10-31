package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequestDto(

        @NotBlank(message = "name must be filled")
        String name,

        @NotBlank(message = "email must be filled")
        @Email(message = "email is not valid")
        String email,

        @NotBlank(message = "password must be filled")
        @Size(min = 8, message = "password must be at least 8 characters")
        String password
) {}
