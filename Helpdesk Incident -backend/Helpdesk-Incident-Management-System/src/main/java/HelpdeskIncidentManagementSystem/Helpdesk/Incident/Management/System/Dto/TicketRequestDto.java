package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Priority;
import jakarta.validation.constraints.NotBlank;

public record TicketRequestDto(
        @NotBlank(message = "title must be filled") String title,
        String description,
        Priority priority,
        String category
) {}
