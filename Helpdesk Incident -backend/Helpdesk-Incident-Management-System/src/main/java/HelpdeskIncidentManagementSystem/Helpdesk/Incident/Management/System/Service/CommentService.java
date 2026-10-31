package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto.CommentRequestDto;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.CommentEntity;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Role;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Exception.ResourceNotFoundException;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Repository.CommentRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepo commentRepo;
    private final TicketService ticketService;
    private final CurrentUser currentUser;

    public CommentService(CommentRepo commentRepo, TicketService ticketService, CurrentUser currentUser) {
        this.commentRepo = commentRepo;
        this.ticketService = ticketService;
        this.currentUser = currentUser;
    }

    public CommentEntity addComment(String ticketId, CommentRequestDto req) {
        ticketService.getVisibleTicket(ticketId);               // 404 if missing or not yours

        CommentEntity comment = new CommentEntity();
        comment.setTicketId(ticketId);
        comment.setAuthor(currentUser.email());                 // from the login
        comment.setText(req.text());
        // only tech support and admin may write internal notes
        comment.setInternal(req.internal() && currentUser.role() != Role.EMPLOYEE);
        comment.setCreatedAt(LocalDateTime.now());
        return commentRepo.save(comment);
    }

    public List<CommentEntity> getComments(String ticketId) {
        ticketService.getVisibleTicket(ticketId);
        List<CommentEntity> all = commentRepo.findByTicketIdOrderByCreatedAtAsc(ticketId);

        if (currentUser.role() == Role.EMPLOYEE) {              // employees never see internal notes
            return all.stream().filter(c -> !c.isInternal()).toList();
        }
        return all;
    }

    public CommentEntity getComment(String ticketId, String commentId) {
        ticketService.getVisibleTicket(ticketId);

        CommentEntity comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("No comment found with ID: " + commentId));

        if (!comment.getTicketId().equals(ticketId)
                || (currentUser.role() == Role.EMPLOYEE && comment.isInternal())) {
            throw new ResourceNotFoundException("No comment found with ID: " + commentId + " for this ticket");
        }
        return comment;
    }
}