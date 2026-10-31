package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Repository;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.CommentEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepo extends MongoRepository<CommentEntity,String> {
    List<CommentEntity> findByTicketIdOrderByCreatedAtAsc(String ticketId);

    void deleteByTicketId(String ticketId);
}
