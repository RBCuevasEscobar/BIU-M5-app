package mx.iqenglish.tutoring.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.entity.GroupStatus;
import mx.iqenglish.tutoring.service.TutoringGroupService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TutoringGroupControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private TutoringGroupService groupService;

    @Test
    @WithMockUser(username = "admin.alberto", roles = {"ADMIN"})
    @DisplayName("Admin can update group successfully")
    void testAdminCanUpdateGroup() throws Exception {
        UpdateTutoringGroupDTO dto = new UpdateTutoringGroupDTO();
        dto.setName("Updated Group");
        dto.setCampusId(1L);
        dto.setTeacherId(1L);
        dto.setModuleId(8L);
        dto.setCapacity(15);
        dto.setModality("PRESENTIAL");
        dto.setStatus(GroupStatus.PUBLISHED);

        TutoringGroupDTO responseDto = new TutoringGroupDTO();
        responseDto.setId(10L);
        responseDto.setName("Updated Group");
        responseDto.setCapacity(15);

        when(groupService.updateGroup(eq(10L), any(UpdateTutoringGroupDTO.class))).thenReturn(responseDto);

        mockMvc.perform(put("/api/v1/tutoring/groups/10")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Group"));
    }

    @Test
    @WithMockUser(username = "teacher.ana", roles = {"TEACHER"})
    @DisplayName("Teacher cannot update group (403 Forbidden)")
    void testTeacherCannotUpdateGroup() throws Exception {
        UpdateTutoringGroupDTO dto = new UpdateTutoringGroupDTO();
        dto.setName("Unauthorized Update");
        dto.setCampusId(1L);
        dto.setTeacherId(1L);
        dto.setModuleId(8L);
        dto.setCapacity(15);

        mockMvc.perform(put("/api/v1/tutoring/groups/10")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin.alberto", roles = {"ADMIN"})
    @DisplayName("Admin can delete group")
    void testAdminCanDeleteGroup() throws Exception {
        doNothing().when(groupService).deleteGroup(10L);

        mockMvc.perform(delete("/api/v1/tutoring/groups/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "teacher.ana", roles = {"TEACHER"})
    @DisplayName("Teacher cannot delete group (403 Forbidden)")
    void testTeacherCannotDeleteGroup() throws Exception {
        mockMvc.perform(delete("/api/v1/tutoring/groups/10"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "teacher.ana", roles = {"TEACHER"})
    @DisplayName("Teacher can access group report")
    void testTeacherCanAccessGroupReport() throws Exception {
        GroupReportDTO report = new GroupReportDTO();
        report.setScope("MY_GROUPS");
        report.setTotalGroups(2);

        when(groupService.generateGroupReport(any(), any(), any(), any(), any())).thenReturn(report);

        mockMvc.perform(get("/api/v1/tutoring/groups/report"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.scope").value("MY_GROUPS"));
    }

    @Test
    @WithMockUser(username = "student.carlos", roles = {"STUDENT"})
    @DisplayName("Student cannot access group report (403 Forbidden)")
    void testStudentCannotAccessGroupReport() throws Exception {
        mockMvc.perform(get("/api/v1/tutoring/groups/report"))
                .andExpect(status().isForbidden());
    }
}
