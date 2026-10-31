package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Repository;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.TicketEntity;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Priority;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepo extends MongoRepository<TicketEntity,String> {
    List<TicketEntity> findByTitleContainingIgnoreCase(String title);

    // optional, useful later for filters
    List<TicketEntity> findByStatus(TicketStatus status);
    List<TicketEntity> findByPriority(Priority priority);
    void deleteById(String id);
    long countByStatus(TicketStatus status);
    long countByPriority(Priority priority);
    long countBySlaBreachedTrue();

}
