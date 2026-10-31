package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.AuditLogEntity;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.AuditAction;

import java.time.LocalDateTime;

public record AuditLogResponseDto(
        String id,
        String ticketId,
        AuditAction action,
        String oldValue,
        String newValue,
        String performedBy,
        LocalDateTime timestamp
) {
    public static AuditLogResponseDto from(AuditLogEntity a) {
        return new AuditLogResponseDto(
                a.getId(), a.getTicketId(), a.getAction(),
                a.getOldValue(), a.getNewValue(),
                a.getPerformedBy(), a.getTimestamp());
    }
}