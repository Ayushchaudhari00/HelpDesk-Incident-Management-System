package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Controller;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto.*;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.TicketEntity;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Priority;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.TicketStatus;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service.CommentService;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service.TicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/ticket")
public class TicketController {

    private final TicketService ticketService;
    private final CommentService commentService;

    public TicketController(TicketService ticketService, CommentService commentService) {
        this.ticketService = ticketService;
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<TicketResponseDto> add(@Valid @RequestBody TicketRequestDto req) {
        return ResponseEntity.status(201)
                .body(TicketResponseDto.from(ticketService.addTicket(req)));
    }



    @GetMapping
    public PageResponseDto<TicketResponseDto> search(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<TicketEntity> result = ticketService.search(status, priority, keyword, page, size);

        return new PageResponseDto<>(
                result.getContent().stream().map(TicketResponseDto::from).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages());
    }

    @GetMapping("/{id}")
    public TicketDetailResponseDto getById(@PathVariable String id) {
        TicketEntity ticket = ticketService.getVisibleTicket(id);

        List<CommentResponseDto> comments = commentService.getComments(id).stream()
                .map(CommentResponseDto::from)
                .toList();

        return TicketDetailResponseDto.from(ticket, comments);
    }

    @PutMapping("/{id}")
    public TicketResponseDto update(@PathVariable String id,
                                    @RequestBody TicketRequestDto req) {
        return TicketResponseDto.from(ticketService.updateTicket(id, req));
    }

    @PutMapping("/{id}/assign")
    public TicketResponseDto assign(@PathVariable String id,
                                    @RequestParam(required = false) String agentId) {
        return TicketResponseDto.from(ticketService.assignTicket(id, agentId));
    }

    @PutMapping("/{id}/status")
    public TicketResponseDto changeStatus(@PathVariable String id,
                                          @RequestParam TicketStatus status) {
        return TicketResponseDto.from(ticketService.changeStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        ticketService.deleteTicketById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reopen")
    public TicketResponseDto reopen(@PathVariable String id) {
        return TicketResponseDto.from(ticketService.reopenTicket(id));
    }
}