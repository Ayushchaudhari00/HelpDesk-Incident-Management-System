package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "audit_logs")
public class AuditLogEntity {

    @Id
    private String id;

    @Indexed
    private String ticketId;
    private AuditAction action;
    private String oldValue;
    private String newValue;
    private String performedBy;
    private LocalDateTime timestamp;
}