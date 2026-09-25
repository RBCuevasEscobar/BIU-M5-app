package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.service.GroupSessionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tutoring/sessions")
@Tag(name = "Tutoring Sessions & Availability", description = "Session search by module (Method A) or date/availability (Method B)")
public class GroupSessionController {

    private final GroupSessionService sessionService;

    public GroupSessionController(GroupSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping
    @Operation(summary = "Search available tutoring sessions with multi-criteria filters")
    public ResponseEntity<ApiResponse<List<GroupSessionDTO>>> searchSessions(
            @RequestParam(required = false) Long campusId,
            @RequestParam(required = false) Long moduleId,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.searchAvailableSessions(campusId, moduleId, teacherId, bookId, dateFrom, dateTo)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific group session details")
    public ResponseEntity<ApiResponse<GroupSessionDTO>> getSessionById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getSessionById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('GROUP_ASSIGN_SCHEDULE') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Create a new tutoring session for a group")
    public ResponseEntity<ApiResponse<GroupSessionDTO>> createSession(@Valid @RequestBody CreateSessionDTO dto) {
        GroupSessionDTO created = sessionService.createSession(dto);
        return new ResponseEntity<>(ApiResponse.ok("Session created successfully", created), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('SESSION_CANCEL') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Cancel a tutoring session and notify enrolled students")
    public ResponseEntity<ApiResponse<Void>> cancelSession(@PathVariable Long id, @RequestParam(required = false) String reason) {
        sessionService.cancelSession(id, reason);
        return ResponseEntity.ok(ApiResponse.ok("Session cancelled and notifications sent to affected students", null));
    }
}
