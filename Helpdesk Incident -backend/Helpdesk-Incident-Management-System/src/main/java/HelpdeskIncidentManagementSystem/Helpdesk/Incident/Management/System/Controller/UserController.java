package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Controller;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto.CreateUserRequestDto;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto.UserResponseDto;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponseDto> create(@Valid @RequestBody CreateUserRequestDto req) {
        var user = userService.createUser(req.name(), req.email(), req.password(), req.role());
        return ResponseEntity.status(201).body(UserResponseDto.from(user));
    }

    @GetMapping
    public List<UserResponseDto> list() {
        return userService.getAllUsers().stream().map(UserResponseDto::from).toList();
    }
}
