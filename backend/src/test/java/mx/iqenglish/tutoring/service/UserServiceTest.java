package mx.iqenglish.tutoring.service;

import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.entity.*;
import mx.iqenglish.tutoring.exception.BusinessException;
import mx.iqenglish.tutoring.exception.ResourceNotFoundException;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.*;
import mx.iqenglish.tutoring.security.UserPrincipal;
import mx.iqenglish.tutoring.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private CampusRepository campusRepository;
    @Mock private AcademicLevelRepository academicLevelRepository;
    @Mock private BookRepository bookRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private TeacherRepository teacherRepository;
    @Mock private AuditLogRepository auditLogRepository;
    @Mock private EntityMapper entityMapper;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuditService auditService;

    @InjectMocks
    private UserServiceImpl userService;

    private User adminUser;
    private User studentUser;
    private Role adminRole;
    private Role studentRole;

    @BeforeEach
    void setUp() {
        adminRole = new Role("ROLE_ADMIN", "Administrator");
        studentRole = new Role("ROLE_STUDENT", "Student");

        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin.alberto");
        adminUser.setEmail("admin@iqenglish.mx");
        adminUser.setPasswordHash("$2a$10$hashedAdminPassword");
        adminUser.setFirstName("Alberto");
        adminUser.setLastName("Castillo");
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser.setRoles(new HashSet<>(Collections.singletonList(adminRole)));

        studentUser = new User();
        studentUser.setId(2L);
        studentUser.setUsername("student.carlos");
        studentUser.setEmail("student@iqenglish.mx");
        studentUser.setPasswordHash("$2a$10$hashedStudentPassword");
        studentUser.setFirstName("Carlos");
        studentUser.setLastName("Hernandez");
        studentUser.setStatus(UserStatus.ACTIVE);
        studentUser.setRoles(new HashSet<>(Collections.singletonList(studentRole)));
    }

    @Test
    @DisplayName("Create User - Success")
    void createUser_Success() {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("teacher.new");
        request.setEmail("teacher.new@iqenglish.mx");
        request.setPassword("Password123!");
        request.setFirstName("Ana");
        request.setLastName("Gomez");
        request.setRole("ROLE_TEACHER");

        when(userRepository.existsByUsername(request.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPass");

        Role teacherRole = new Role("ROLE_TEACHER", "Teacher");
        when(roleRepository.findByName("ROLE_TEACHER")).thenReturn(Optional.of(teacherRole));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(3L);
            return u;
        });

        UserDTO mockDto = new UserDTO();
        mockDto.setId(3L);
        mockDto.setUsername("teacher.new");
        when(entityMapper.toUserDTO(any(User.class))).thenReturn(mockDto);

        UserDTO result = userService.createUser(request);

        assertNotNull(result);
        assertEquals(3L, result.getId());
        assertEquals("teacher.new", result.getUsername());
        verify(auditService, times(1)).log(eq("USER_CREATED"), eq("User"), eq("3"), anyString());
    }

    @Test
    @DisplayName("Create User - Duplicate Username Throws Conflict")
    void createUser_DuplicateUsername_ThrowsConflict() {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("admin.alberto");
        request.setEmail("unique@iqenglish.mx");
        request.setPassword("Password123!");
        request.setFirstName("Alberto");
        request.setLastName("Castillo");

        when(userRepository.existsByUsername("admin.alberto")).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () -> userService.createUser(request));
        assertEquals("USERNAME_ALREADY_EXISTS", ex.getCode());
    }

    @Test
    @DisplayName("Update User Status - Deactivate Last Admin Throws BusinessException")
    void updateUserStatus_DeactivateLastAdmin_ThrowsBusinessException() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userRepository.countByRoleNameAndStatus("ROLE_ADMIN", UserStatus.ACTIVE)).thenReturn(1L);

        BusinessException ex = assertThrows(BusinessException.class, () -> userService.updateUserStatus(1L, UserStatus.INACTIVE));
        assertEquals("CANNOT_DISABLE_LAST_ADMIN", ex.getCode());
    }

    @Test
    @DisplayName("Update User Roles - Remove Last Admin Role Throws BusinessException")
    void updateUserRoles_RemoveLastAdminRole_ThrowsBusinessException() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(roleRepository.findByName("ROLE_TEACHER")).thenReturn(Optional.of(new Role("ROLE_TEACHER", "Teacher")));
        when(userRepository.countByRoleNameAndStatus("ROLE_ADMIN", UserStatus.ACTIVE)).thenReturn(1L);

        UserRoleUpdateRequest request = new UserRoleUpdateRequest();
        request.setRole("ROLE_TEACHER");

        BusinessException ex = assertThrows(BusinessException.class, () -> userService.updateUserRoles(1L, request));
        assertEquals("CANNOT_REMOVE_LAST_ADMIN_ROLE", ex.getCode());
    }

    @Test
    @DisplayName("Delete User - Soft Deletes User Account")
    void deleteUser_Success_SetsStatusInactive() {
        // Mock current authenticated user as admin (ID 1) deleting student (ID 2)
        UserPrincipal principal = UserPrincipal.create(adminUser);
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenReturn(studentUser);

        userService.deleteUser(2L);

        assertEquals(UserStatus.INACTIVE, studentUser.getStatus());
        verify(userRepository).save(studentUser);
        verify(auditService).log(eq("USER_DELETED"), eq("User"), eq("2"), anyString());
    }

    @Test
    @DisplayName("Delete User - Cannot Delete Own Account")
    void deleteUser_SelfDelete_ThrowsBusinessException() {
        UserPrincipal principal = UserPrincipal.create(adminUser);
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        BusinessException ex = assertThrows(BusinessException.class, () -> userService.deleteUser(1L));
        assertEquals("CANNOT_DELETE_SELF", ex.getCode());
    }

    @Test
    @DisplayName("Change Own Password - Success")
    void changeOwnPassword_Success() {
        UserPrincipal principal = UserPrincipal.create(studentUser);
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));
        when(passwordEncoder.matches("OldPassword123!", studentUser.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.encode("NewPassword456!")).thenReturn("newEncodedHash");
        when(userRepository.save(any(User.class))).thenReturn(studentUser);

        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("OldPassword123!");
        req.setNewPassword("NewPassword456!");
        req.setConfirmPassword("NewPassword456!");

        userService.changeOwnPassword(2L, req);

        assertEquals("newEncodedHash", studentUser.getPasswordHash());
        verify(userRepository).save(studentUser);
        verify(auditService).log(eq("USER_PASSWORD_CHANGED"), eq("User"), eq("2"), anyString());
    }

    @Test
    @DisplayName("Change Own Password - Mismatched Confirmation Throws BusinessException")
    void changeOwnPassword_MismatchedConfirm_ThrowsBusinessException() {
        UserPrincipal principal = UserPrincipal.create(studentUser);
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));
        when(passwordEncoder.matches("OldPassword123!", studentUser.getPasswordHash())).thenReturn(true);

        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("OldPassword123!");
        req.setNewPassword("NewPassword456!");
        req.setConfirmPassword("DifferentPassword789!");

        BusinessException ex = assertThrows(BusinessException.class, () -> userService.changeOwnPassword(2L, req));
        assertEquals("PASSWORDS_DO_NOT_MATCH", ex.getCode());
    }

    @Test
    @DisplayName("Get User Report - Returns Metric Overview")
    void getUserReport_CalculatesMetrics() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByStatus(UserStatus.ACTIVE)).thenReturn(8L);
        when(userRepository.countByStatus(UserStatus.INACTIVE)).thenReturn(1L);
        when(userRepository.countByStatus(UserStatus.SUSPENDED)).thenReturn(1L);
        when(userRepository.countByRoleName("ROLE_ADMIN")).thenReturn(2L);
        when(userRepository.countByRoleName("ROLE_SUPERVISOR")).thenReturn(2L);
        when(userRepository.countByRoleName("ROLE_TEACHER")).thenReturn(3L);
        when(userRepository.countByRoleName("ROLE_STUDENT")).thenReturn(3L);
        when(userRepository.countByCreatedAtAfter(any(LocalDateTime.class))).thenReturn(4L);

        UserReportDTO report = userService.getUserReport();

        assertNotNull(report);
        assertEquals(10L, report.getTotalUsers());
        assertEquals(8L, report.getActiveUsers());
        assertEquals(1L, report.getInactiveUsers());
        assertEquals(1L, report.getSuspendedUsers());
        assertEquals(2L, report.getRoleDistribution().get("ADMIN"));
        assertEquals(4L, report.getRecentRegistrations30Days());
        verify(auditService).log(eq("USER_REPORT_GENERATED"), eq("Report"), anyString(), anyString());
    }

    @Test
    @DisplayName("Export Users CSV - Returns UTF-8 Encoded CSV Bytes")
    void exportUsersCsv_GeneratesValidCsv() {
        when(userRepository.findAll(any(Specification.class), any(Sort.class))).thenReturn(Arrays.asList(adminUser, studentUser));

        byte[] csv = userService.exportUsersCsv(null, null, null);

        assertNotNull(csv);
        String csvText = new String(csv, java.nio.charset.StandardCharsets.UTF_8);
        assertTrue(csvText.contains("ID,Username,First Name,Last Name,Email,Phone,Roles,Status,Created At"));
        assertTrue(csvText.contains("admin.alberto"));
        assertTrue(csvText.contains("student.carlos"));
        verify(auditService).log(eq("USER_EXPORT_CSV"), eq("Export"), anyString(), anyString());
    }
}
