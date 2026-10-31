package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.TicketEntity;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Priority;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

public record TicketDetailResponseDto(
        String id,
        String title,
        String description,
        TicketStatus status,
        Priority priority,
        String category,
        String createdBy,
        String assignedTo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<CommentResponseDto> comments
) {
    public static TicketDetailResponseDto from(TicketEntity t, List<CommentResponseDto> comments) {
        return new TicketDetailResponseDto(
                t.getId(), t.getTitle(), t.getDescription(), t.getStatus(),
                t.getPriority(), t.getCategory(), t.getCreatedBy(),
                t.getAssignedTo(), t.getCreatedAt(), t.getUpdatedAt(), comments);
    }
}