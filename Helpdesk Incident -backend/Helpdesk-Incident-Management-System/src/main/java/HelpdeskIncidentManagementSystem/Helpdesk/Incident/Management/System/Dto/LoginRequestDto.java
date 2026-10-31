package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDto(
        @NotBlank(message = "email must be filled") String email,
        @NotBlank(message = "password must be filled") String password
) {}