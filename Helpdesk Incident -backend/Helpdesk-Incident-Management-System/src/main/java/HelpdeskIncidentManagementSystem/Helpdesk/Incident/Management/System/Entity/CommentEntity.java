package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "Comments")
public class CommentEntity {
    @Id
    private String id;
    @Indexed
    private String ticketId;
    private String author;
    private String text;
    private boolean internal;
    private LocalDateTime createdAt;
}
