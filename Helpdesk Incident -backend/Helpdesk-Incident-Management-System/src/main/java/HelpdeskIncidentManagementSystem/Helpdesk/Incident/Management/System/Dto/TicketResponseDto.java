package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.TicketEntity;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Priority;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.TicketStatus;

import java.time.LocalDateTime;

public record TicketResponseDto(
        String id,
        String title,
        String description,
        TicketStatus status,
        Priority priority,
        String category,
        String createdBy,
        String assignedTo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TicketResponseDto from(TicketEntity t) {
        return new TicketResponseDto(
                t.getId(), t.getTitle(), t.getDescription(), t.getStatus(),
                t.getPriority(), t.getCategory(), t.getCreatedBy(),
                t.getAssignedTo(), t.getCreatedAt(), t.getUpdatedAt());
    }
}