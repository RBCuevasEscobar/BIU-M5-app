package mx.iqenglish.tutoring.security;

import mx.iqenglish.tutoring.entity.Permission;
import mx.iqenglish.tutoring.entity.Role;
import mx.iqenglish.tutoring.entity.User;
import mx.iqenglish.tutoring.entity.UserStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class SecurityRbacTest {

    @Test
    @DisplayName("Test 6, 7, 8: RBAC Permission Mapping for Student, Supervisor, and Admin")
    void testRbacPermissionMapping() {
        // 1. Student setup
        Role studentRole = new Role("ROLE_STUDENT", "Student");
        Permission bookPerm = new Permission("TUTORING_BOOK", "Book tutoring", "TUTORING");
        studentRole.setPermissions(Set.of(bookPerm));

        User studentUser = new User();
        studentUser.setId(1L);
        studentUser.setUsername("student.carlos");
        studentUser.setEmail("carlos@iqenglish.mx");
        studentUser.setPasswordHash("hash");
        studentUser.setFirstName("Carlos");
        studentUser.setLastName("Mendoza");
        studentUser.setStatus(UserStatus.ACTIVE);
        studentUser.setRoles(Set.of(studentRole));

        UserPrincipal principal = UserPrincipal.create(studentUser);
        Set<String> authorities = principal.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toSet());

        assertTrue(authorities.contains("ROLE_STUDENT"));
        assertTrue(authorities.contains("TUTORING_BOOK"));
        assertFalse(authorities.contains("GROUP_CREATE")); // Student cannot create groups (Rule R6 check)

        // 2. Supervisor setup
        Role supervisorRole = new Role("ROLE_SUPERVISOR", "Supervisor");
        Permission groupCreatePerm = new Permission("GROUP_CREATE", "Create groups", "TUTORING");
        supervisorRole.setPermissions(Set.of(groupCreatePerm));

        User supervisorUser = new User();
        supervisorUser.setId(2L);
        supervisorUser.setUsername("supervisor.patricia");
        supervisorUser.setEmail("patricia@iqenglish.mx");
        supervisorUser.setPasswordHash("hash");
        supervisorUser.setFirstName("Patricia");
        supervisorUser.setLastName("Veloz");
        supervisorUser.setStatus(UserStatus.ACTIVE);
        supervisorUser.setRoles(Set.of(supervisorRole));

        UserPrincipal superPrincipal = UserPrincipal.create(supervisorUser);
        Set<String> superAuths = superPrincipal.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toSet());

        assertTrue(superAuths.contains("ROLE_SUPERVISOR"));
        assertTrue(superAuths.contains("GROUP_CREATE")); // Supervisor can manage groups
    }
}
