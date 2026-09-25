package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.entity.GroupStatus;
import mx.iqenglish.tutoring.service.TutoringGroupService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
