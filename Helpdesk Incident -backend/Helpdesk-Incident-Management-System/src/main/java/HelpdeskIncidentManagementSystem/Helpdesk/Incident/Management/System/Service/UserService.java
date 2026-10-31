package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Entity.UserEntity;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Role;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Exception.InvalidRequestException;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Exception.ResourceNotFoundException;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Repository.UserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public UserEntity createUser(String name, String email, String rawPassword, Role role) {
        String normalized = email.trim().toLowerCase();

        if (userRepo.existsByEmail(normalized)) {
            throw new InvalidRequestException("Email already registered: " + normalized);
        }

        UserEntity user = new UserEntity();
        user.setName(name.trim());
        user.setEmail(normalized);
        user.setPassword(passwordEncoder.encode(rawPassword));   // hash, never store plain text
        user.setRole(role);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        return userRepo.save(user);
    }

    public UserEntity getByEmail(String email) {
        return userRepo.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + email));
    }

    public List<UserEntity> getAllUsers() {
        return userRepo.findAll();
    }
}
