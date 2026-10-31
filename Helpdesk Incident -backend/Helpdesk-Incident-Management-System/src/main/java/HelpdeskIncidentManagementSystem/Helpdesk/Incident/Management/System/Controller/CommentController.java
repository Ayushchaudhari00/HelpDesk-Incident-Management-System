package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Controller;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto.CommentRequestDto;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto.CommentResponseDto;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ticket/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CommentResponseDto> add(@PathVariable String ticketId,
                                                  @Valid @RequestBody CommentRequestDto req) {
        return ResponseEntity.status(201)
                .body(CommentResponseDto.from(commentService.addComment(ticketId, req)));
    }


    @GetMapping("/{commentId}")
    public CommentResponseDto getOne(@PathVariable String ticketId,
                                     @PathVariable String commentId) {
        return CommentResponseDto.from(commentService.getComment(ticketId, commentId));
    }
}
