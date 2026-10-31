package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.UserEntity;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Role;

import java.time.LocalDateTime;

public record UserResponseDto(
        String id,
        String name,
        String email,
        Role role,
        boolean active,
        LocalDateTime createdAt
) {
    public static UserResponseDto from(UserEntity u) {
        return new UserResponseDto(u.getId(), u.getName(), u.getEmail(),
                u.getRole(), u.isActive(), u.getCreatedAt());
    }
}