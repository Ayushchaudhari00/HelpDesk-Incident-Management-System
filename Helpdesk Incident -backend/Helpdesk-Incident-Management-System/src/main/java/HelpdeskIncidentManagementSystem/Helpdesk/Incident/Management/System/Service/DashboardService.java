package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto.DashboardResponseDto;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.TicketEntity;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Priority;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.TicketStatus;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Repository.TicketRepo;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final TicketRepo ticketRepo;
    private final MongoTemplate mongoTemplate;

    public DashboardService(TicketRepo ticketRepo, MongoTemplate mongoTemplate) {
        this.ticketRepo = ticketRepo;
        this.mongoTemplate = mongoTemplate;
    }

    public DashboardResponseDto getStats() {
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (TicketStatus s : TicketStatus.values()) {
            byStatus.put(s.name(), ticketRepo.countByStatus(s));
        }

        Map<String, Long> byPriority = new LinkedHashMap<>();
        for (Priority p : Priority.values()) {
            byPriority.put(p.name(), ticketRepo.countByPriority(p));
        }

        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("assignedTo").ne(null)),
                Aggregation.group("assignedTo").count().as("count"));

        Map<String, Long> perAgent = new LinkedHashMap<>();
        for (Document d : mongoTemplate.aggregate(agg, TicketEntity.class, Document.class)
                .getMappedResults()) {
            perAgent.put(d.getString("_id"), d.get("count", Number.class).longValue());
        }

        return new DashboardResponseDto(
                ticketRepo.count(), byStatus, byPriority,
                ticketRepo.countBySlaBreachedTrue(), perAgent);
    }
}
