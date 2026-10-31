package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto;

import java.util.Map;

public record DashboardResponseDto(
        long totalTickets,
        Map<String, Long> byStatus,
        Map<String, Long> byPriority,
        long slaBreached,
        Map<String, Long> ticketsPerAgent
) {}