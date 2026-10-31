package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Repository;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.AuditLogEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepo extends MongoRepository<AuditLogEntity, String> {

    List<AuditLogEntity> findByTicketIdOrderByTimestampAsc(String ticketId);
}
