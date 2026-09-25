package mx.iqenglish.tutoring.service;

import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.entity.UserStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    List<UserDTO> getAllUsers();
    PageResponse<UserDTO> getUsersPaged(String search, String role, UserStatus status, Pageable pageable);
    UserDTO getUserById(Long id);
    UserDTO getUserByUsername(String username);
    UserDTO createUser(CreateUserRequest request);
    UserDTO updateUser(Long id, UpdateUserRequest request);
    UserDTO updateUserStatus(Long id, UserStatus status);
    UserDTO updateUserRoles(Long id, UserRoleUpdateRequest request);
    void deleteUser(Long id);
    void changeOwnPassword(Long userId, ChangePasswordRequest request);
    void adminResetPassword(Long id, AdminPasswordResetRequest request);
    UserReportDTO getUserReport();
    byte[] exportUsersCsv(String search, String role, UserStatus status);
    List<AuditLogDTO> getUserAuditLogs(Long userId);
}
