package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto.TicketRequestDto;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.TicketEntity;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.UserEntity;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.AuditAction;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Priority;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Role;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.TicketStatus;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Exception.InvalidRequestException;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Exception.ResourceNotFoundException;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Repository.CommentRepo;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Repository.TicketRepo;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Repository.UserRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class TicketService {

    private final TicketRepo ticketRepo;
    private final MongoTemplate mongoTemplate;
    private final CommentRepo commentRepo;
    private final AuditService auditService;
    private final UserRepo userRepo;
    private final CurrentUser currentUser;

    public TicketService(TicketRepo ticketRepo, MongoTemplate mongoTemplate,
                         CommentRepo commentRepo, AuditService auditService,
                         UserRepo userRepo, CurrentUser currentUser) {
        this.ticketRepo = ticketRepo;
        this.mongoTemplate = mongoTemplate;
        this.commentRepo = commentRepo;
        this.auditService = auditService;
        this.userRepo = userRepo;
        this.currentUser = currentUser;
    }

    private long slaHours(Priority p) {
        if (p == null) return 24;
        return switch (p) {
            case CRITICAL -> 4;
            case HIGH     -> 8;
            case MEDIUM   -> 24;
            case LOW      -> 72;
        };
    }

    // ---------- who may see a ticket ----------
    // ADMIN: all. EMPLOYEE: own tickets. TECH_SUPPORT: unassigned or assigned to them.
    private boolean canView(TicketEntity t) {
        String me = currentUser.email();
        return switch (currentUser.role()) {
            case ADMIN        -> true;
            case EMPLOYEE     -> me.equalsIgnoreCase(t.getCreatedBy());
            case TECH_SUPPORT -> t.getAssignedTo() == null || me.equalsIgnoreCase(t.getAssignedTo());
        };
    }

    // Raw lookup, no permission check (internal use)
    public TicketEntity getById(String id) {
        return ticketRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No ticket found with ID: " + id));
    }

    // Lookup with a permission check. A hidden ticket returns 404, so its existence is not revealed.
    public TicketEntity getVisibleTicket(String id) {
        TicketEntity t = getById(id);
        if (!canView(t)) {
            throw new ResourceNotFoundException("No ticket found with ID: " + id);
        }
        return t;
    }

    // ---------- CREATE ----------
    public TicketEntity addTicket(TicketRequestDto req) {
        String me = currentUser.email();

        TicketEntity ticket = new TicketEntity();
        ticket.setTitle(req.title());
        ticket.setDescription(req.description());
        ticket.setCategory(req.category());
        ticket.setCreatedBy(me);                                   // from the login, not the body
        ticket.setPriority(req.priority() != null ? req.priority() : Priority.MEDIUM);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setAssignedTo(null);

        LocalDateTime now = LocalDateTime.now();
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        ticket.setSlaDueAt(now.plusHours(slaHours(ticket.getPriority())));
        ticket.setSlaBreached(false);

        TicketEntity saved = ticketRepo.save(ticket);
        auditService.log(saved.getId(), AuditAction.CREATED, null, "OPEN", me);
        return saved;
    }

    // ---------- SEARCH + PAGINATION (limited to what the caller may see) ----------
    public Page<TicketEntity> search(TicketStatus status, Priority priority,
                                     String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 50),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Query query = new Query();

        String me = currentUser.email();
        switch (currentUser.role()) {
            case EMPLOYEE -> query.addCriteria(Criteria.where("createdBy").is(me));
            case TECH_SUPPORT -> query.addCriteria(new Criteria().orOperator(
                    Criteria.where("assignedTo").is(me),
                    Criteria.where("assignedTo").is(null)));
            case ADMIN -> { }
        }

        if (status != null)   query.addCriteria(Criteria.where("status").is(status));
        if (priority != null) query.addCriteria(Criteria.where("priority").is(priority));
        if (keyword != null && !keyword.isBlank()) {
            query.addCriteria(Criteria.where("title").regex(Pattern.quote(keyword), "i"));
        }

        long total = mongoTemplate.count(query, TicketEntity.class);
        List<TicketEntity> list = mongoTemplate.find(query.with(pageable), TicketEntity.class);
        return new PageImpl<>(list, pageable, total);
    }

    // ---------- UPDATE (partial) ----------
    public TicketEntity updateTicket(String id, TicketRequestDto req) {
        TicketEntity existing = getVisibleTicket(id);
        List<String> changed = new ArrayList<>();

        if (req.title() != null)       { existing.setTitle(req.title());             changed.add("title"); }
        if (req.description() != null) { existing.setDescription(req.description()); changed.add("description"); }
        if (req.category() != null)    { existing.setCategory(req.category());       changed.add("category"); }
        if (req.priority() != null && req.priority() != existing.getPriority()) {
            existing.setPriority(req.priority());
            if (existing.getCreatedAt() != null) {
                existing.setSlaDueAt(existing.getCreatedAt().plusHours(slaHours(req.priority())));
            }
            changed.add("priority");
        }

        existing.setUpdatedAt(LocalDateTime.now());
        TicketEntity saved = ticketRepo.save(existing);

        if (!changed.isEmpty()) {
            auditService.log(id, AuditAction.UPDATED, null,
                    "changed: " + String.join(", ", changed), currentUser.email());
        }
        return saved;
    }

    // ---------- ASSIGN ----------
    // TECH_SUPPORT: always assigns to themselves. ADMIN: assigns to any active TECH_SUPPORT user.
    public TicketEntity assignTicket(String id, String agentId) {
        TicketEntity ticket = getVisibleTicket(id);

        if (ticket.getStatus() != TicketStatus.OPEN
                && ticket.getStatus() != TicketStatus.REOPENED) {
            throw new InvalidRequestException(
                    "Only OPEN or REOPENED tickets can be assigned. Current status: " + ticket.getStatus());
        }

        String me = currentUser.email();
        String assignee;

        if (currentUser.role() == Role.TECH_SUPPORT) {
            if (agentId != null && !agentId.isBlank() && !agentId.trim().equalsIgnoreCase(me)) {
                throw new AccessDeniedException("Tech support can only assign tickets to themselves");
            }
            assignee = me;
        } else {
            if (agentId == null || agentId.isBlank()) {
                throw new InvalidRequestException("agentId is required");
            }
            assignee = agentId.trim().toLowerCase();
            UserEntity agent = userRepo.findByEmail(assignee)
                    .orElseThrow(() -> new InvalidRequestException("No user found with email: " + agentId));
            if (agent.getRole() != Role.TECH_SUPPORT || !agent.isActive()) {
                throw new InvalidRequestException("Agent must be an active TECH_SUPPORT user");
            }
        }

        String previous = ticket.getAssignedTo();
        ticket.setAssignedTo(assignee);
        ticket.setStatus(TicketStatus.ASSIGNED);
        ticket.setUpdatedAt(LocalDateTime.now());
        TicketEntity saved = ticketRepo.save(ticket);

        auditService.log(id, AuditAction.ASSIGNED, previous, assignee, me);
        return saved;
    }

    // ---------- CHANGE STATUS ----------
    public TicketEntity changeStatus(String id, TicketStatus newStatus) {
        TicketEntity ticket = getVisibleTicket(id);

        // tech support may only work on their own assigned tickets; admins on any
        if (currentUser.role() == Role.TECH_SUPPORT
                && !currentUser.email().equalsIgnoreCase(ticket.getAssignedTo())) {
            throw new AccessDeniedException("Only the assigned tech support user or an admin can change this status");
        }

        TicketStatus current = ticket.getStatus();
        if (current == null) {
            throw new InvalidRequestException("Ticket has no current status");
        }

        boolean allowed = switch (current) {
            case OPEN        -> false;
            case ASSIGNED    -> newStatus == TicketStatus.IN_PROGRESS;
            case IN_PROGRESS -> newStatus == TicketStatus.RESOLVED;
            case RESOLVED    -> newStatus == TicketStatus.CLOSED
                    || newStatus == TicketStatus.REOPENED;
            case CLOSED      -> newStatus == TicketStatus.REOPENED;
            case REOPENED    -> newStatus == TicketStatus.IN_PROGRESS;
        };

        if (!allowed) {
            throw new InvalidRequestException(
                    "Invalid status change: " + current + " -> " + newStatus
                            + (current == TicketStatus.OPEN
                            ? " (use /assign to assign an OPEN ticket)" : ""));
        }

        LocalDateTime now = LocalDateTime.now();
        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(now);
        if (newStatus == TicketStatus.REOPENED) {
            ticket.setSlaDueAt(now.plusHours(slaHours(ticket.getPriority())));
            ticket.setSlaBreached(false);
        }
        TicketEntity saved = ticketRepo.save(ticket);

        AuditAction action = (newStatus == TicketStatus.RESOLVED)
                ? AuditAction.RESOLVED : AuditAction.STATUS_CHANGED;
        auditService.log(id, action, current.name(), newStatus.name(), currentUser.email());
        return saved;
    }

    // ---------- REOPEN (the owner of a RESOLVED or CLOSED ticket) ----------
    public TicketEntity reopenTicket(String id) {
        TicketEntity ticket = getVisibleTicket(id);
        TicketStatus current = ticket.getStatus();

        if (current != TicketStatus.RESOLVED && current != TicketStatus.CLOSED) {
            throw new InvalidRequestException(
                    "Only RESOLVED or CLOSED tickets can be reopened. Current status: " + current);
        }

        LocalDateTime now = LocalDateTime.now();
        ticket.setStatus(TicketStatus.REOPENED);
        ticket.setUpdatedAt(now);
        ticket.setSlaDueAt(now.plusHours(slaHours(ticket.getPriority())));
        ticket.setSlaBreached(false);
        TicketEntity saved = ticketRepo.save(ticket);

        auditService.log(id, AuditAction.STATUS_CHANGED, current.name(), "REOPENED", currentUser.email());
        return saved;
    }

    // ---------- DELETE (admin only, enforced in SecurityConfig) ----------
    public void deleteTicketById(String id) {
        if (!ticketRepo.existsById(id)) {
            throw new ResourceNotFoundException("No ticket found with ID: " + id);
        }
        commentRepo.deleteByTicketId(id);
        ticketRepo.deleteById(id);
        auditService.log(id, AuditAction.DELETED, null, null, currentUser.email());
    }
}