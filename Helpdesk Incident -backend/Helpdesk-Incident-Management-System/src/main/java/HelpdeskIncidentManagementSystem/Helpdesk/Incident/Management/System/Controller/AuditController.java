package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Controller;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service.AuditService;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service.TicketService;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto.AuditLogResponseDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/ticket/{ticketId}/history")
public class AuditController {

    private final AuditService auditService;
    private final TicketService ticketService;

    public AuditController(AuditService auditService, TicketService ticketService) {
        this.auditService = auditService;
        this.ticketService = ticketService;
    }

    @GetMapping
    public List<AuditLogResponseDto> history(@PathVariable String ticketId) {
        ticketService.getVisibleTicket(ticketId);   
        return auditService.getHistory(ticketId).stream()
                .map(AuditLogResponseDto::from)
                .toList();
    }
}