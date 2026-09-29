package mx.iqenglish.tutoring.service;

import java.util.List;
import mx.iqenglish.tutoring.dto.AdminPasswordResetRequest;
import mx.iqenglish.tutoring.dto.AuditLogDTO;
import mx.iqenglish.tutoring.dto.ChangePasswordRequest;
import mx.iqenglish.tutoring.dto.CreateUserRequest;
import mx.iqenglish.tutoring.dto.PageResponse;
import mx.iqenglish.tutoring.dto.UpdateUserRequest;
import mx.iqenglish.tutoring.dto.UserDTO;
import mx.iqenglish.tutoring.dto.UserReportDTO;
import mx.iqenglish.tutoring.dto.UserRoleUpdateRequest;
import mx.iqenglish.tutoring.entity.UserStatus;
import org.springframework.data.domain.Pageable;

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
