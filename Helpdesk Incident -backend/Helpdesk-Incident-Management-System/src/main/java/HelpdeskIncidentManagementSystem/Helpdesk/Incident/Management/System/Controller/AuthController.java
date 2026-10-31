package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Controller;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto.LoginRequestDto;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto.LoginResponseDto;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Dto.UserResponseDto;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.UserEntity;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service.JwtService;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtService jwtService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }


    @PostMapping("/login")
    public LoginResponseDto login(@Valid @RequestBody LoginRequestDto req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.email().trim().toLowerCase(), req.password()));

        UserEntity user = userService.getByEmail(auth.getName());
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return new LoginResponseDto(token, "Bearer",
                jwtService.getExpirationSeconds(), UserResponseDto.from(user));
    }

    // Who am I?
    @GetMapping("/me")
    public UserResponseDto me(Authentication authentication) {
        return UserResponseDto.from(userService.getByEmail(authentication.getName()));
    }
}