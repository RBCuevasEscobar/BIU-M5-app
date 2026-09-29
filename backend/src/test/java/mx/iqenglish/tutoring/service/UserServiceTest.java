package mx.iqenglish.tutoring.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import mx.iqenglish.tutoring.dto.ChangePasswordRequest;
import mx.iqenglish.tutoring.dto.CreateUserRequest;
import mx.iqenglish.tutoring.dto.UserDTO;
import mx.iqenglish.tutoring.dto.UserReportDTO;
import mx.iqenglish.tutoring.dto.UserRoleUpdateRequest;
import mx.iqenglish.tutoring.entity.Role;
import mx.iqenglish.tutoring.entity.Student;
import mx.iqenglish.tutoring.entity.Teacher;
import mx.iqenglish.tutoring.entity.User;
import mx.iqenglish.tutoring.entity.UserStatus;
import mx.iqenglish.tutoring.exception.BusinessException;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.AcademicLevelRepository;
import mx.iqenglish.tutoring.repository.AuditLogRepository;
import mx.iqenglish.tutoring.repository.BookRepository;
import mx.iqenglish.tutoring.repository.CampusRepository;
import mx.iqenglish.tutoring.repository.ModuleRepository;
import mx.iqenglish.tutoring.repository.RoleRepository;
import mx.iqenglish.tutoring.repository.StudentRepository;
import mx.iqenglish.tutoring.repository.TeacherRepository;
import mx.iqenglish.tutoring.repository.UserRepository;
import mx.iqenglish.tutoring.security.UserPrincipal;
import mx.iqenglish.tutoring.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;



@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private CampusRepository campusRepository;
    @Mock private AcademicLevelRepository academicLevelRepository;
    @Mock private BookRepository bookRepository;
    @Mock private ModuleRepository moduleRepository;
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
        adminUser.setFirstName("Alberto");
        adminUser.setLastName("Rodriguez");
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
        adminUser.setPasswordHash("$2a$10$hashedAdminPassword");
        adminUser.setCreatedAt(LocalDateTime.now().minusDays(10));

        studentUser = new User();
        studentUser.setId(2L);
        studentUser.setUsername("student.carlos");
        studentUser.setEmail("carlos@iqenglish.mx");
        studentUser.setFirstName("Carlos");
        studentUser.setLastName("Mendoza");
        studentUser.setStatus(UserStatus.ACTIVE);
        studentUser.setRoles(new HashSet<>(Collections.singletonList(studentRole)));
        studentUser.setPasswordHash("$2a$10$hashedStudentPassword");
        studentUser.setCreatedAt(LocalDateTime.now().minusDays(5));
    }

    @Test
    @DisplayName("Create User - Success with Role Teacher and Encoded Password")
    void createUser_Success() {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("teacher.new");
        request.setEmail("newteacher@iqenglish.mx");
        request.setPassword("Password123!");
        request.setFirstName("Laura");
        request.setLastName("Morales");
        request.setRole("ROLE_TEACHER");

        Role teacherRole = new Role("ROLE_TEACHER", "Teacher");

        when(userRepository.existsByUsername("teacher.new")).thenReturn(false);
        when(userRepository.existsByEmail("newteacher@iqenglish.mx")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("$2a$10$encodedPassword");
        when(roleRepository.findByName("ROLE_TEACHER")).thenReturn(Optional.of(teacherRole));

        User savedUser = new User();
        savedUser.setId(3L);
        savedUser.setUsername("teacher.new");
        savedUser.setEmail("newteacher@iqenglish.mx");
        savedUser.setFirstName("Laura");
        savedUser.setLastName("Morales");
        savedUser.setRoles(Collections.singleton(teacherRole));
        savedUser.setStatus(UserStatus.ACTIVE);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserDTO userDTO = new UserDTO();
        userDTO.setId(3L);
        userDTO.setUsername("teacher.new");
        when(entityMapper.toUserDTO(savedUser)).thenReturn(userDTO);

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
        assertEquals(2L, report.getRoleDistribution().get("ROLE_ADMIN"));
        assertEquals(2L, report.getRoleDistribution().get("ROLE_SUPERVISOR"));
        assertEquals(3L, report.getRoleDistribution().get("ROLE_TEACHER"));
        assertEquals(3L, report.getRoleDistribution().get("ROLE_STUDENT"));
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
