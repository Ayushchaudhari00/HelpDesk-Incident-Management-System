package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.CommentEntity;

import java.time.LocalDateTime;

public record CommentResponseDto(
        String id,
        String ticketId,
        String author,
        String text,
        boolean internal,
        LocalDateTime createdAt)
{
    public static CommentResponseDto from(CommentEntity c){
        return new CommentResponseDto(
                c.getId(), c.getTicketId(), c.getAuthor(),
                c.getText(), c.isInternal(), c.getCreatedAt());
    }
}

