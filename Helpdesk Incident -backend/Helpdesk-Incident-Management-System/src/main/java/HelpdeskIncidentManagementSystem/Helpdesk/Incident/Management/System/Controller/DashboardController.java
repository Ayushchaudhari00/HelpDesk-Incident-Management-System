package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Controller;


import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto.DashboardResponseDto;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public DashboardResponseDto stats() {
        return dashboardService.getStats();
    }
}
