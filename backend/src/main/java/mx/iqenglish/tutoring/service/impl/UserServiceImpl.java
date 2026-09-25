package mx.iqenglish.tutoring.service.impl;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.entity.*;
import mx.iqenglish.tutoring.exception.BusinessException;
import mx.iqenglish.tutoring.exception.ResourceNotFoundException;
import mx.iqenglish.tutoring.exception.UnauthorizedActionException;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.*;
import mx.iqenglish.tutoring.security.SecurityUtils;
import mx.iqenglish.tutoring.service.AuditService;
import mx.iqenglish.tutoring.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CampusRepository campusRepository;
    private final AcademicLevelRepository academicLevelRepository;
    private final BookRepository bookRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AuditLogRepository auditLogRepository;
    private final EntityMapper entityMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           CampusRepository campusRepository,
                           AcademicLevelRepository academicLevelRepository,
                           BookRepository bookRepository,
                           StudentRepository studentRepository,
                           TeacherRepository teacherRepository,
                           AuditLogRepository auditLogRepository,
                           EntityMapper entityMapper,
                           PasswordEncoder passwordEncoder,
                           AuditService auditService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.campusRepository = campusRepository;
        this.academicLevelRepository = academicLevelRepository;
        this.bookRepository = bookRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.auditLogRepository = auditLogRepository;
        this.entityMapper = entityMapper;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(entityMapper::toUserDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserDTO> getUsersPaged(String search, String role, UserStatus status, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchPred = cb.or(
                    cb.like(cb.lower(root.get("username")), pattern),
                    cb.like(cb.lower(root.get("firstName")), pattern),
                    cb.like(cb.lower(root.get("lastName")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(root.get("phone")), pattern)
                );
                predicates.add(searchPred);
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (role != null && !role.trim().isEmpty()) {
                String normalizedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase();
                Join<User, Role> roleJoin = root.join("roles");
                predicates.add(cb.equal(roleJoin.get("name"), normalizedRole));
            }
            if (query != null) {
                query.distinct(true);
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> page = userRepository.findAll(spec, pageable);
        List<UserDTO> dtoList = page.getContent().stream()
            .map(entityMapper::toUserDTO)
            .collect(Collectors.toList());

        return new PageResponse<>(
            dtoList,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return entityMapper.toUserDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", username));
        return entityMapper.toUserDTO(user);
    }

    @Override
    @Transactional
    public UserDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("USERNAME_ALREADY_EXISTS", "Username '" + request.getUsername() + "' is already registered.", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("EMAIL_ALREADY_EXISTS", "Email address '" + request.getEmail() + "' is already in use.", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone());
        
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            try {
                user.setStatus(UserStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setStatus(UserStatus.ACTIVE);
            }
        } else {
            user.setStatus(UserStatus.ACTIVE);
        }
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Resolve Roles
        Set<Role> roles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String rName : request.getRoles()) {
                String normalized = rName.startsWith("ROLE_") ? rName : "ROLE_" + rName.toUpperCase();
                roleRepository.findByName(normalized).ifPresent(roles::add);
            }
        } else if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            String normalized = request.getRole().startsWith("ROLE_") ? request.getRole() : "ROLE_" + request.getRole().toUpperCase();
            roleRepository.findByName(normalized).ifPresent(roles::add);
        }

        if (roles.isEmpty()) {
            roleRepository.findByName("ROLE_STUDENT").ifPresent(roles::add);
        }
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        // Optional auxiliary entity creation
        boolean isStudent = roles.stream().anyMatch(r -> "ROLE_STUDENT".equals(r.getName()));
        boolean isTeacher = roles.stream().anyMatch(r -> "ROLE_TEACHER".equals(r.getName()));

        Campus defaultCampus = null;
        if (request.getCampusId() != null) {
            defaultCampus = campusRepository.findById(request.getCampusId()).orElse(null);
        }
        if (defaultCampus == null) {
            defaultCampus = campusRepository.findAll().stream().findFirst().orElse(null);
        }

        if (isStudent && defaultCampus != null) {
            Student student = new Student();
            student.setUser(savedUser);
            student.setCampus(defaultCampus);
            String sNum = request.getStudentNumber() != null && !request.getStudentNumber().trim().isEmpty()
                ? request.getStudentNumber()
                : "STU-" + String.format("%05d", savedUser.getId());
            student.setStudentNumber(sNum);
            student.setEnrollmentDate(LocalDate.now());
            student.setStatus(savedUser.getStatus());

            AcademicLevel level = academicLevelRepository.findAll().stream().findFirst().orElse(null);
            student.setCurrentLevel(level);

            Book book = bookRepository.findByBookNumber(1).orElseGet(() -> bookRepository.findAll().stream().findFirst().orElse(null));
            student.setCurrentBook(book);

            studentRepository.save(student);
        } else if (isTeacher && defaultCampus != null) {
            Teacher teacher = new Teacher();
            teacher.setUser(savedUser);
            teacher.setCampus(defaultCampus);
            String eNum = request.getEmployeeNumber() != null && !request.getEmployeeNumber().trim().isEmpty()
                ? request.getEmployeeNumber()
                : "TCH-" + String.format("%05d", savedUser.getId());
            teacher.setEmployeeNumber(eNum);
            teacher.setSpecialty(request.getSpecialty() != null ? request.getSpecialty() : "General English");
            teacher.setHireDate(LocalDate.now());
            teacher.setStatus(savedUser.getStatus());
            teacherRepository.save(teacher);
        }

        String roleSummary = roles.stream().map(Role::getName).collect(Collectors.joining(", "));
        auditService.log("USER_CREATED", "User", savedUser.getId().toString(), "Created user '" + savedUser.getUsername() + "' with roles: " + roleSummary);

        return entityMapper.toUserDTO(savedUser);
    }

    @Override
    @Transactional
    public UserDTO updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));

        if (userRepository.existsByEmailAndIdNot(request.getEmail().trim().toLowerCase(), id)) {
            throw new BusinessException("EMAIL_ALREADY_EXISTS", "Email address '" + request.getEmail() + "' is already in use by another user.", HttpStatus.CONFLICT);
        }

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            try {
                UserStatus newStatus = UserStatus.valueOf(request.getStatus().toUpperCase());
                if (newStatus != UserStatus.ACTIVE && user.getStatus() == UserStatus.ACTIVE) {
                    boolean isAdmin = user.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
                    if (isAdmin) {
                        long activeAdmins = userRepository.countByRoleNameAndStatus("ROLE_ADMIN", UserStatus.ACTIVE);
                        if (activeAdmins <= 1) {
                            throw new BusinessException("CANNOT_DISABLE_LAST_ADMIN", "Cannot deactivate or suspend the only active administrator in the system.", HttpStatus.BAD_REQUEST);
                        }
                    }
                }
                user.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                // Ignore invalid status format
            }
        }

        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        auditService.log("USER_UPDATED", "User", savedUser.getId().toString(), "Updated profile attributes for user '" + savedUser.getUsername() + "'");

        return entityMapper.toUserDTO(savedUser);
    }

    @Override
    @Transactional
    public UserDTO updateUserStatus(Long id, UserStatus status) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));

        if ((status == UserStatus.INACTIVE || status == UserStatus.SUSPENDED) && user.getStatus() == UserStatus.ACTIVE) {
            boolean isAdmin = user.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
            if (isAdmin) {
                long activeAdmins = userRepository.countByRoleNameAndStatus("ROLE_ADMIN", UserStatus.ACTIVE);
                if (activeAdmins <= 1) {
                    throw new BusinessException("CANNOT_DISABLE_LAST_ADMIN", "Cannot deactivate or suspend the only active administrator in the system.", HttpStatus.BAD_REQUEST);
                }
            }
        }

        user.setStatus(status);
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        String action = status == UserStatus.ACTIVE ? "USER_ACTIVATED" : "USER_DEACTIVATED";
        auditService.log(action, "User", savedUser.getId().toString(), "User status set to " + status.name() + " for '" + savedUser.getUsername() + "'");

        return entityMapper.toUserDTO(savedUser);
    }

    @Override
    @Transactional
    public UserDTO updateUserRoles(Long id, UserRoleUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));

        Set<Role> resolvedRoles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String rName : request.getRoles()) {
                String normalized = rName.startsWith("ROLE_") ? rName : "ROLE_" + rName.toUpperCase();
                roleRepository.findByName(normalized).ifPresent(resolvedRoles::add);
            }
        } else if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            String normalized = request.getRole().startsWith("ROLE_") ? request.getRole() : "ROLE_" + request.getRole().toUpperCase();
            roleRepository.findByName(normalized).ifPresent(resolvedRoles::add);
        }

        if (resolvedRoles.isEmpty()) {
            throw new BusinessException("INVALID_ROLE", "At least one valid role must be assigned to the user.", HttpStatus.BAD_REQUEST);
        }

        boolean currentlyAdmin = user.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
        boolean willBeAdmin = resolvedRoles.stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));

        if (currentlyAdmin && !willBeAdmin && user.getStatus() == UserStatus.ACTIVE) {
            long activeAdmins = userRepository.countByRoleNameAndStatus("ROLE_ADMIN", UserStatus.ACTIVE);
            if (activeAdmins <= 1) {
                throw new BusinessException("CANNOT_REMOVE_LAST_ADMIN_ROLE", "Cannot remove administrator role from the only active system administrator.", HttpStatus.BAD_REQUEST);
            }
        }

        user.setRoles(resolvedRoles);
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        String roleSummary = resolvedRoles.stream().map(Role::getName).collect(Collectors.joining(", "));
        auditService.log("USER_ROLE_CHANGED", "User", savedUser.getId().toString(), "Updated roles for '" + savedUser.getUsername() + "' to: " + roleSummary);

        return entityMapper.toUserDTO(savedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));

        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        if (id.equals(currentUserId)) {
            throw new BusinessException("CANNOT_DELETE_SELF", "You cannot delete or deactivate your own active session account.", HttpStatus.BAD_REQUEST);
        }

        boolean isAdmin = user.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
        if (isAdmin && user.getStatus() == UserStatus.ACTIVE) {
            long activeAdmins = userRepository.countByRoleNameAndStatus("ROLE_ADMIN", UserStatus.ACTIVE);
            if (activeAdmins <= 1) {
                throw new BusinessException("CANNOT_DELETE_LAST_ADMIN", "Cannot delete the only active administrator in the system.", HttpStatus.BAD_REQUEST);
            }
        }

        user.setStatus(UserStatus.INACTIVE);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        auditService.log("USER_DELETED", "User", id.toString(), "Soft-deleted user account '" + user.getUsername() + "' by setting status to INACTIVE");
    }

    @Override
    @Transactional
    public void changeOwnPassword(Long userId, ChangePasswordRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
            .orElseThrow(() -> new BusinessException("UNAUTHENTICATED", "Authentication required to change password.", HttpStatus.UNAUTHORIZED));

        if (!userId.equals(currentUserId)) {
            throw new UnauthorizedActionException("You can only change your own password.");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException("INVALID_CURRENT_PASSWORD", "The current password entered does not match our records.", HttpStatus.BAD_REQUEST);
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("PASSWORDS_DO_NOT_MATCH", "New password and password confirmation do not match.", HttpStatus.BAD_REQUEST);
        }

        if (request.getNewPassword().length() < 6) {
            throw new BusinessException("PASSWORD_TOO_SHORT", "New password must be at least 6 characters long.", HttpStatus.BAD_REQUEST);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        auditService.log("USER_PASSWORD_CHANGED", "User", userId.toString(), "User '" + user.getUsername() + "' updated their personal password");
    }

    @Override
    @Transactional
    public void adminResetPassword(Long id, AdminPasswordResetRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new BusinessException("PASSWORD_TOO_SHORT", "New password must be at least 6 characters long.", HttpStatus.BAD_REQUEST);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        auditService.log("USER_PASSWORD_RESET", "User", id.toString(), "Administrator reset password for user '" + user.getUsername() + "'");
    }

    @Override
    @Transactional(readOnly = true)
    public UserReportDTO getUserReport() {
        UserReportDTO report = new UserReportDTO();
        report.setTotalUsers(userRepository.count());
        report.setActiveUsers(userRepository.countByStatus(UserStatus.ACTIVE));
        report.setInactiveUsers(userRepository.countByStatus(UserStatus.INACTIVE));
        report.setSuspendedUsers(userRepository.countByStatus(UserStatus.SUSPENDED));

        Map<String, Long> roleMap = new LinkedHashMap<>();
        roleMap.put("ADMIN", userRepository.countByRoleName("ROLE_ADMIN"));
        roleMap.put("SUPERVISOR", userRepository.countByRoleName("ROLE_SUPERVISOR"));
        roleMap.put("TEACHER", userRepository.countByRoleName("ROLE_TEACHER"));
        roleMap.put("STUDENT", userRepository.countByRoleName("ROLE_STUDENT"));
        report.setRoleDistribution(roleMap);

        Map<String, Long> statusMap = new LinkedHashMap<>();
        statusMap.put("ACTIVE", report.getActiveUsers());
        statusMap.put("INACTIVE", report.getInactiveUsers());
        statusMap.put("SUSPENDED", report.getSuspendedUsers());
        report.setStatusDistribution(statusMap);

        report.setRecentRegistrations30Days(userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(30)));

        auditService.log("USER_REPORT_GENERATED", "Report", "N/A", "Generated user management metric report");

        return report;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportUsersCsv(String search, String role, UserStatus status) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("username")), pattern),
                    cb.like(cb.lower(root.get("firstName")), pattern),
                    cb.like(cb.lower(root.get("lastName")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(root.get("phone")), pattern)
                ));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (role != null && !role.trim().isEmpty()) {
                String normalizedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase();
                Join<User, Role> roleJoin = root.join("roles");
                predicates.add(cb.equal(roleJoin.get("name"), normalizedRole));
            }
            if (query != null) {
                query.distinct(true);
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<User> users = userRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "id"));
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Username,First Name,Last Name,Email,Phone,Roles,Status,Created At\n");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (User u : users) {
            String rolesStr = u.getRoles() != null
                ? u.getRoles().stream().map(r -> r.getName().replace("ROLE_", "")).collect(Collectors.joining(";"))
                : "";
            String createdStr = u.getCreatedAt() != null ? u.getCreatedAt().format(dtf) : "";

            sb.append(u.getId()).append(",")
              .append(escapeCsv(u.getUsername())).append(",")
              .append(escapeCsv(u.getFirstName())).append(",")
              .append(escapeCsv(u.getLastName())).append(",")
              .append(escapeCsv(u.getEmail())).append(",")
              .append(escapeCsv(u.getPhone() != null ? u.getPhone() : "")).append(",")
              .append(escapeCsv(rolesStr)).append(",")
              .append(u.getStatus() != null ? u.getStatus().name() : "").append(",")
              .append(escapeCsv(createdStr)).append("\n");
        }

        auditService.log("USER_EXPORT_CSV", "Export", "N/A", "Exported CSV containing " + users.size() + " user records");

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDTO> getUserAuditLogs(Long userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(entityMapper::toAuditLogDTO)
            .collect(Collectors.toList());
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
