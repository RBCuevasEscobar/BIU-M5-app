package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import mx.iqenglish.tutoring.dto.ApiResponse;
import mx.iqenglish.tutoring.dto.AppointmentDTO;
import mx.iqenglish.tutoring.dto.CreateTutoringGroupDTO;
import mx.iqenglish.tutoring.dto.DuplicateGroupDTO;
import mx.iqenglish.tutoring.dto.GroupReportDTO;
import mx.iqenglish.tutoring.dto.TutoringGroupDTO;
import mx.iqenglish.tutoring.dto.UpdateTutoringGroupDTO;
import mx.iqenglish.tutoring.entity.GroupStatus;
import mx.iqenglish.tutoring.service.TutoringGroupService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/v1/tutoring/groups")
@Tag(name = "Tutoring Group Management", description = "Supply-side management of tutoring groups, capacities, teachers and schedules")
public class TutoringGroupController {

    private final TutoringGroupService groupService;

    public TutoringGroupController(TutoringGroupService groupService) {
        this.groupService = groupService;
    }

    @GetMapping
    @Operation(summary = "List tutoring groups with optional filters (campus, module, teacher, book, status)")
    public ResponseEntity<ApiResponse<List<TutoringGroupDTO>>> filterGroups(
            @RequestParam(required = false) Long campusId,
            @RequestParam(required = false) Long moduleId,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) GroupStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(groupService.filterGroups(campusId, moduleId, teacherId, bookId, status)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tutoring group details by ID")
    public ResponseEntity<ApiResponse<TutoringGroupDTO>> getGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(groupService.getGroupById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('GROUP_CREATE') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Create and publish a new tutoring group (Supervisor / Admin)")
    public ResponseEntity<ApiResponse<TutoringGroupDTO>> createGroup(@Valid @RequestBody CreateTutoringGroupDTO dto) {
        TutoringGroupDTO created = groupService.createGroup(dto);
        return new ResponseEntity<>(ApiResponse.ok("Group created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GROUP_UPDATE') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Update an existing tutoring group configuration, capacity and teacher (Supervisor / Admin)")
    public ResponseEntity<ApiResponse<TutoringGroupDTO>> updateGroup(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateTutoringGroupDTO dto) {
        TutoringGroupDTO updated = groupService.updateGroup(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Group updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('GROUP_DEACTIVATE') or hasAuthority('GROUP_DELETE') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Delete or cancel a tutoring group (Supervisor / Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(@PathVariable Long id) {
        groupService.deleteGroup(id);
        return ResponseEntity.ok(ApiResponse.ok("Group deleted or cancelled successfully", null));
    }

    @PostMapping("/{id}/duplicate")
    @PreAuthorize("hasAuthority('GROUP_CREATE') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Duplicate group configuration for recurring slots")
    public ResponseEntity<ApiResponse<TutoringGroupDTO>> duplicateGroup(@PathVariable Long id, @RequestBody DuplicateGroupDTO dto) {
        TutoringGroupDTO duplicated = groupService.duplicateGroup(id, dto);
        return new ResponseEntity<>(ApiResponse.ok("Group duplicated successfully", duplicated), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('GROUP_UPDATE') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Update tutoring group status (PUBLISHED, INACTIVE, CANCELLED)")
    public ResponseEntity<ApiResponse<TutoringGroupDTO>> updateStatus(@PathVariable Long id, @RequestParam GroupStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(groupService.updateGroupStatus(id, status)));
    }

    @GetMapping("/report")
    @PreAuthorize("hasAuthority('GROUP_READ') or hasRole('TEACHER') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Generate tutoring groups operational report (Admin/Supervisor: ALL, Teacher: OWN)")
    public ResponseEntity<ApiResponse<GroupReportDTO>> getGroupReport(
            @RequestParam(required = false) Long campusId,
            @RequestParam(required = false) Long moduleId,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) GroupStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(groupService.generateGroupReport(campusId, moduleId, teacherId, bookId, status)));
    }

    @GetMapping("/export/csv")
    @PreAuthorize("hasAuthority('GROUP_READ') or hasRole('TEACHER') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Export tutoring groups operational report to RFC 4180 CSV")
    public ResponseEntity<byte[]> exportGroupReportCsv(
            @RequestParam(required = false) Long campusId,
            @RequestParam(required = false) Long moduleId,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) GroupStatus status) {
        byte[] csvData = groupService.exportGroupReportCsv(campusId, moduleId, teacherId, bookId, status);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tutoring_groups_report.csv")
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .body(csvData);
    }

    @GetMapping("/{id}/students")
    @PreAuthorize("hasAuthority('GROUP_READ') or hasRole('TEACHER') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Get list of enrolled students for a specific group")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getEnrolledStudentsByGroup(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(groupService.getEnrolledStudentsByGroup(id)));
    }

    @GetMapping("/students/export/csv")
    @PreAuthorize("hasAuthority('GROUP_READ') or hasRole('TEACHER') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Export enrolled students roster to CSV")
    public ResponseEntity<byte[]> exportEnrolledStudentsCsv(
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) Long campusId,
            @RequestParam(required = false) Long moduleId,
            @RequestParam(required = false) Long teacherId) {
        byte[] csvData = groupService.exportEnrolledStudentsCsv(groupId, campusId, moduleId, teacherId);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=alumnos_inscritos_reporte.csv")
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .body(csvData);
    }
}
