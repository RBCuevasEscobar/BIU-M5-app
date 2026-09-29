package mx.iqenglish.tutoring.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import mx.iqenglish.tutoring.dto.CreateUserRequest;
import mx.iqenglish.tutoring.dto.PageResponse;
import mx.iqenglish.tutoring.dto.UserDTO;
import mx.iqenglish.tutoring.dto.UserReportDTO;
import mx.iqenglish.tutoring.service.AuthService;
import mx.iqenglish.tutoring.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;



@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("GET /api/v1/users - Admin can retrieve paginated users")
    @WithMockUser(username = "admin.alberto", roles = {"ADMIN"})
    void getUsers_Admin_ReturnsPagedResponse() throws Exception {
        UserDTO dto = new UserDTO();
        dto.setId(1L);
        dto.setUsername("admin.alberto");
        dto.setEmail("admin@iqenglish.mx");
        dto.setFirstName("Alberto");
        dto.setLastName("Castillo");
        dto.setStatus("ACTIVE");
        dto.setRoles(Collections.singleton("ROLE_ADMIN"));

        PageResponse<UserDTO> pageResponse = new PageResponse<>(
            Collections.singletonList(dto), 0, 10, 1L, 1, true
        );

        when(userService.getUsersPaged(any(), any(), any(), any(Pageable.class))).thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/users?page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].username").value("admin.alberto"));
    }

    @Test
    @DisplayName("GET /api/v1/users - Student is Forbidden (403)")
    @WithMockUser(username = "student.carlos", roles = {"STUDENT"})
    void getUsers_Student_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/v1/users - Admin can create new user")
    @WithMockUser(username = "admin.alberto", roles = {"ADMIN"})
    void createUser_Admin_ReturnsCreatedUser() throws Exception {
        CreateUserRequest req = new CreateUserRequest();
        req.setUsername("new.teacher");
        req.setEmail("new.teacher@iqenglish.mx");
        req.setPassword("SecurePassword123!");
        req.setFirstName("Laura");
        req.setLastName("Sanchez");
        req.setRole("ROLE_TEACHER");

        UserDTO dto = new UserDTO();
        dto.setId(10L);
        dto.setUsername("new.teacher");
        dto.setEmail("new.teacher@iqenglish.mx");
        dto.setFirstName("Laura");
        dto.setLastName("Sanchez");
        dto.setStatus("ACTIVE");
        dto.setRoles(Collections.singleton("ROLE_TEACHER"));

        when(userService.createUser(any(CreateUserRequest.class))).thenReturn(dto);

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.username").value("new.teacher"));
    }

    @Test
    @DisplayName("POST /api/v1/users - Student is Forbidden (403)")
    @WithMockUser(username = "student.carlos", roles = {"STUDENT"})
    void createUser_Student_ReturnsForbidden() throws Exception {
        CreateUserRequest req = new CreateUserRequest();
        req.setUsername("forbidden.user");
        req.setEmail("forbidden@iqenglish.mx");
        req.setPassword("Password123!");
        req.setFirstName("Fake");
        req.setLastName("User");

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/users/report - Admin can access user statistics report")
    @WithMockUser(username = "admin.alberto", roles = {"ADMIN"})
    void getUserReport_Admin_ReturnsReport() throws Exception {
        UserReportDTO report = new UserReportDTO();
        report.setTotalUsers(25L);
        report.setActiveUsers(23L);
        report.setInactiveUsers(2L);
        report.setSuspendedUsers(0L);

        when(userService.getUserReport()).thenReturn(report);

        mockMvc.perform(get("/api/v1/users/report"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.totalUsers").value(25));
    }

    @Test
    @DisplayName("GET /api/v1/users/export/csv - Admin can download CSV")
    @WithMockUser(username = "admin.alberto", roles = {"ADMIN"})
    void exportCsv_Admin_ReturnsCsvFile() throws Exception {
        byte[] dummyCsv = "ID,Username\n1,admin.alberto".getBytes();
        when(userService.exportUsersCsv(any(), any(), any())).thenReturn(dummyCsv);

        mockMvc.perform(get("/api/v1/users/export/csv"))
            .andExpect(status().isOk())
            .andExpect(header().string("Content-Disposition", "attachment; filename=\"iq_users_export.csv\""))
            .andExpect(content().contentType("text/csv;charset=UTF-8"));
    }
}
