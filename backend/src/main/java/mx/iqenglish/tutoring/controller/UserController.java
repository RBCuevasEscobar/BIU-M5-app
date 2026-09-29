package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import mx.iqenglish.tutoring.dto.AdminPasswordResetRequest;
import mx.iqenglish.tutoring.dto.ApiResponse;
import mx.iqenglish.tutoring.dto.AuditLogDTO;
import mx.iqenglish.tutoring.dto.ChangePasswordRequest;
import mx.iqenglish.tutoring.dto.CreateUserRequest;
import mx.iqenglish.tutoring.dto.PageResponse;
import mx.iqenglish.tutoring.dto.UpdateUserRequest;
import mx.iqenglish.tutoring.dto.UserDTO;
import mx.iqenglish.tutoring.dto.UserReportDTO;
import mx.iqenglish.tutoring.dto.UserRoleUpdateRequest;
import mx.iqenglish.tutoring.dto.UserStatusUpdateRequest;
import mx.iqenglish.tutoring.entity.UserStatus;
import mx.iqenglish.tutoring.security.SecurityUtils;
import mx.iqenglish.tutoring.service.AuthService;
import mx.iqenglish.tutoring.service.UserService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "User administration, lifecycle management, RBAC, password management, and reporting")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserDTO>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.ok(authService.getCurrentUser()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ') or hasRole('ADMIN') or hasRole('SUPERVISOR')")
    @Operation(summary = "List registered users with pagination, search, and filtering")
    public ResponseEntity<ApiResponse<PageResponse<UserDTO>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,asc") String sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) UserStatus status) {

        String[] sortParts = sort.split(",");
        String sortProperty = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && "desc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProperty));
        PageResponse<UserDTO> response = userService.getUsersPaged(search, role, status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('USER_READ') or hasRole('ADMIN') or hasRole('SUPERVISOR')")
    @Operation(summary = "List all registered users without pagination")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_READ') or hasRole('ADMIN') or hasRole('SUPERVISOR')")
    @Operation(summary = "Get user details by ID")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE') or hasRole('ADMIN')")
    @Operation(summary = "Create a new user account with role assignment")
    public ResponseEntity<ApiResponse<UserDTO>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDTO created = userService.createUser(request);
        return ResponseEntity.ok(ApiResponse.ok("User created successfully.", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE') or hasRole('ADMIN')")
    @Operation(summary = "Update an existing user's profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        UserDTO updated = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.ok("User updated successfully.", updated));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('USER_UPDATE') or hasRole('ADMIN')")
    @Operation(summary = "Update user status (ACTIVE, INACTIVE, SUSPENDED)")
    public ResponseEntity<ApiResponse<UserDTO>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        UserStatus status = UserStatus.valueOf(request.getStatus().toUpperCase());
        UserDTO updated = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("User status updated successfully.", updated));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasAuthority('ROLE_MANAGE') or hasRole('ADMIN')")
    @Operation(summary = "Update roles assigned to a user")
    public ResponseEntity<ApiResponse<UserDTO>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UserRoleUpdateRequest request) {
        UserDTO updated = userService.updateUserRoles(id, request);
        return ResponseEntity.ok(ApiResponse.ok("User roles updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_DISABLE') or hasRole('ADMIN')")
    @Operation(summary = "Deactivate/Soft-delete a user account")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User account deactivated successfully.", null));
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Change own password for authenticated user")
    public ResponseEntity<ApiResponse<Void>> changeOwnPassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("Current user context not found"));
        userService.changeOwnPassword(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully.", null));
    }

    @PostMapping("/{id}/password-reset")
    @PreAuthorize("hasAuthority('USER_UPDATE') or hasRole('ADMIN')")
    @Operation(summary = "Administrator reset of user password")
    public ResponseEntity<ApiResponse<Void>> adminResetPassword(
            @PathVariable Long id,
            @Valid @RequestBody AdminPasswordResetRequest request) {
        userService.adminResetPassword(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Password has been reset successfully by administrator.", null));
    }

    @GetMapping("/report")
    @PreAuthorize("hasAuthority('USER_READ') or hasRole('ADMIN') or hasRole('SUPERVISOR')")
    @Operation(summary = "Get statistical overview of system users")
    public ResponseEntity<ApiResponse<UserReportDTO>> getUserReport() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserReport()));
    }

    @GetMapping("/export/csv")
    @PreAuthorize("hasAuthority('USER_READ') or hasRole('ADMIN') or hasRole('SUPERVISOR')")
    @Operation(summary = "Export users list to CSV format")
    public ResponseEntity<byte[]> exportUsersCsv(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) UserStatus status) {
        byte[] csvData = userService.exportUsersCsv(search, role, status);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"iq_users_export.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }

    @GetMapping("/{id}/audit")
    @PreAuthorize("hasAuthority('AUDIT_READ') or hasRole('ADMIN')")
    @Operation(summary = "Get audit activity logs for a specific user")
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getUserAuditLogs(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserAuditLogs(id)));
    }
}
