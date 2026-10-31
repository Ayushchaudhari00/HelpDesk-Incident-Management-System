package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto;

public record LoginResponseDto(
        String token,
        String tokenType,
        long expiresInSeconds,
        UserResponseDto user
) {}