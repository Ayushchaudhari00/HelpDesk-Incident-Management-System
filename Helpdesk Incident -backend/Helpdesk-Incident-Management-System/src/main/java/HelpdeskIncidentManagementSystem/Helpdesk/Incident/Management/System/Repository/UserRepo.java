package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Repository;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.UserEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends MongoRepository<UserEntity, String> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);
}