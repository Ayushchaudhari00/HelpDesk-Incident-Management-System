package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Priority;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "tickets")
@NoArgsConstructor
@AllArgsConstructor
public class TicketEntity {
    @Id
    private String id;

    private String title;
    private String description;

    private TicketStatus status = TicketStatus.OPEN;
   private Priority priority = Priority.MEDIUM;

    private String category;

    private String createdBy;
    private String assignedTo;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime slaDueAt;     // deadline to resolve the ticket
    private boolean slaBreached;
}
