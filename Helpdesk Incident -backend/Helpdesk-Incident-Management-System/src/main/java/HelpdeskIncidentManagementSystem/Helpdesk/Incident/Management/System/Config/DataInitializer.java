package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Config;


import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Role;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Repository.UserRepo;
import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepo userRepo;
    private final UserService userService;
    private final String adminEmail;
    private final String adminPassword;

    public DataInitializer(UserRepo userRepo, UserService userService,
                           @Value("${app.admin.email}") String adminEmail,
                           @Value("${app.admin.password}") String adminPassword) {
        this.userRepo = userRepo;
        this.userService = userService;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (!userRepo.existsByEmail(adminEmail.trim().toLowerCase())) {
            userService.createUser("Admin", adminEmail, adminPassword, Role.ADMIN);
            System.out.println("Created first admin: " + adminEmail);
        }
    }
}
