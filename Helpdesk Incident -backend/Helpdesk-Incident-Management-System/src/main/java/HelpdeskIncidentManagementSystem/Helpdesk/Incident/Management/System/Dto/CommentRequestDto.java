package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto;

import jakarta.validation.constraints.NotBlank;

public record CommentRequestDto(
        @NotBlank(message = "text must be filled") String text,
        boolean internal
) {}
