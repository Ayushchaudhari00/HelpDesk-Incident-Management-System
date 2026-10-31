package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class UserEntity {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)          // one account per email
    private String email;

    @ToString.Exclude                // keep the hash out of logs
    private String password;         // always the BCrypt hash, never plain text

    private Role role;

    private boolean active = true;

    private LocalDateTime createdAt;
}
