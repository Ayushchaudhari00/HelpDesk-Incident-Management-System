package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.AuditLogEntity;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.AuditAction;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Repository.AuditLogRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepo auditLogRepo;

    public AuditService(AuditLogRepo auditLogRepo) {
        this.auditLogRepo = auditLogRepo;
    }

    public void log(String ticketId, AuditAction action,
                    String oldValue, String newValue, String performedBy) {
        AuditLogEntity entry = new AuditLogEntity();
        entry.setTicketId(ticketId);
        entry.setAction(action);
        entry.setOldValue(oldValue);
        entry.setNewValue(newValue);
        entry.setPerformedBy(performedBy);
        entry.setTimestamp(LocalDateTime.now());
        auditLogRepo.save(entry);
    }

    public List<AuditLogEntity> getHistory(String ticketId) {
        return auditLogRepo.findByTicketIdOrderByTimestampAsc(ticketId);
    }
}
