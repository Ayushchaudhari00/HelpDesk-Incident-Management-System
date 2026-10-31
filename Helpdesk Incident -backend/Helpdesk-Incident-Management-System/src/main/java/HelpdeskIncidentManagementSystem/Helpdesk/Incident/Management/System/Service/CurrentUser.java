package HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Service;

import HelpdeskIncidentManagementSystem.Helpdesk.Incident.Management.System.Enums.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

    public String email() {
        return authentication().getName();
    }

    public Role role() {
        for (GrantedAuthority ga : authentication().getAuthorities()) {
            String name = ga.getAuthority();
            if (name.startsWith("ROLE_")) {
                return Role.valueOf(name.substring(5));
            }
        }
        throw new IllegalStateException("Logged-in user has no role");
    }

    private Authentication authentication() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null || !a.isAuthenticated()) {
            throw new IllegalStateException("No logged-in user");
        }
        return a;
    }
}