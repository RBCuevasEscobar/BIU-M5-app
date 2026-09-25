const fs = require('fs');
const path = require('path');
const base = path.resolve('backend/src/main/java/mx/iqenglish/tutoring');
function w(p, s) {
  const f = path.join(base, p);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, s.trim() + '\n', 'utf8');
}

w('controller/TutoringGroupController.java', `package mx.iqenglish.tutoring.controller;

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
`);

w('controller/GroupSessionController.java', `package mx.iqenglish.tutoring.controller;

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
`);

w('controller/AppointmentController.java', `package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@Tag(name = "Tutoring Appointments", description = "Demand-side booking, rescheduling and cancellation of academic tutoring appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('TUTORING_READ') or hasRole('STUDENT')")
    @Operation(summary = "Get appointments for current authenticated student")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getMyAppointments() {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getMyAppointments()));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') or hasRole('SUPERVISOR') or hasRole('ADMIN') or hasRole('TEACHER')")
    @Operation(summary = "Get appointment history for a specific student")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getAppointmentsByStudent(studentId)));
    }

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasAuthority('GROUP_READ') or hasRole('TEACHER') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Get all appointments booked in a specific session")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getAppointmentsBySession(sessionId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment details by ID")
    public ResponseEntity<ApiResponse<AppointmentDTO>> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getAppointmentById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('TUTORING_BOOK') or hasRole('STUDENT') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Reserve a tutoring appointment slot with conflict and capacity validation")
    public ResponseEntity<ApiResponse<AppointmentDTO>> bookAppointment(@Valid @RequestBody BookAppointmentDTO dto) {
        AppointmentDTO appt = appointmentService.bookAppointment(dto);
        return new ResponseEntity<>(ApiResponse.ok("Appointment reserved successfully", appt), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('TUTORING_CANCEL') or hasRole('STUDENT') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Cancel an active appointment and restore group capacity")
    public ResponseEntity<ApiResponse<AppointmentDTO>> cancelAppointment(@PathVariable Long id, @Valid @RequestBody CancelAppointmentDTO dto) {
        AppointmentDTO cancelled = appointmentService.cancelAppointment(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Appointment cancelled successfully", cancelled));
    }

    @PostMapping("/{id}/reschedule")
    @PreAuthorize("hasAuthority('TUTORING_RESCHEDULE') or hasRole('STUDENT') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Atomically reschedule appointment to a new slot with rollback on failure")
    public ResponseEntity<ApiResponse<AppointmentDTO>> rescheduleAppointment(@PathVariable Long id, @Valid @RequestBody RescheduleAppointmentDTO dto) {
        AppointmentDTO rescheduled = appointmentService.rescheduleAppointment(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Appointment rescheduled successfully", rescheduled));
    }
}
`);

w('controller/AttendanceController.java', `package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import mx.iqenglish.tutoring.dto.ApiResponse;
import mx.iqenglish.tutoring.dto.AttendanceDTO;
import mx.iqenglish.tutoring.dto.RecordAttendanceDTO;
import mx.iqenglish.tutoring.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@Tag(name = "Attendance Management", description = "Teacher attendance registration and academic progress updates")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ATTENDANCE_CREATE') or hasRole('TEACHER') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Record or update student attendance (PRESENT, ABSENT, EXCUSED)")
    public ResponseEntity<ApiResponse<AttendanceDTO>> recordAttendance(@Valid @RequestBody RecordAttendanceDTO dto) {
        AttendanceDTO saved = attendanceService.recordAttendance(dto);
        return ResponseEntity.ok(ApiResponse.ok("Attendance recorded successfully", saved));
    }

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasAuthority('ATTENDANCE_READ') or hasRole('TEACHER') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Get attendance records for a group session")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getAttendanceBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getAttendanceBySession(sessionId)));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAuthority('ATTENDANCE_READ') or hasRole('STUDENT') or hasRole('TEACHER') or hasRole('SUPERVISOR') or hasRole('ADMIN')")
    @Operation(summary = "Get attendance history for a student")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getAttendanceByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getAttendanceByStudent(studentId)));
    }
}
`);

w('controller/NotificationController.java', `package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import mx.iqenglish.tutoring.dto.ApiResponse;
import mx.iqenglish.tutoring.dto.NotificationDTO;
import mx.iqenglish.tutoring.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "In-app alerts and notifications for booking, rescheduling, cancellations and attendance")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "List current user notifications")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getMyNotifications() {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getMyNotifications()));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", null));
    }
}
`);

w('controller/ReportController.java', `package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import mx.iqenglish.tutoring.dto.ApiResponse;
import mx.iqenglish.tutoring.dto.DashboardSummaryDTO;
import mx.iqenglish.tutoring.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Reports & Analytics", description = "Executive dashboards, campus occupancy metrics and student performance summaries")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get contextual dashboard summary based on authenticated role")
    public ResponseEntity<ApiResponse<DashboardSummaryDTO>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getDashboardSummary()));
    }
}
`);

w('controller/AuditController.java', `package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import mx.iqenglish.tutoring.dto.ApiResponse;
import mx.iqenglish.tutoring.dto.AuditLogDTO;
import mx.iqenglish.tutoring.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "Audit & Compliance", description = "Security audit logs for governance, tracking login, group, and appointment changes")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping("/logs")
    @PreAuthorize("hasAuthority('AUDIT_READ') or hasRole('ADMIN')")
    @Operation(summary = "Get recent audit trail events (Admin only)")
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getRecentLogs()));
    }
}
`);

w('controller/TalkIOController.java', `package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import mx.iqenglish.tutoring.dto.ApiResponse;
import mx.iqenglish.tutoring.dto.TalkIOSessionDTO;
import mx.iqenglish.tutoring.integration.talkio.TalkIOService;
import mx.iqenglish.tutoring.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/talkio")
@Tag(name = "TalkIO AI Oral Practice", description = "Integration with TalkIO AI conversational agent for English pronunciation and fluency practice")
public class TalkIOController {

    private final TalkIOService talkIOService;

    public TalkIOController(TalkIOService talkIOService) {
        this.talkIOService = talkIOService;
    }

    @PostMapping("/practice")
    @Operation(summary = "Execute AI conversational evaluation for an English curriculum topic")
    public ResponseEntity<ApiResponse<TalkIOSessionDTO>> practice(
            @RequestParam String moduleCode,
            @RequestParam String topicTitle,
            @RequestParam String promptText,
            @RequestParam(required = false) String speechText) {
        String username = SecurityUtils.getCurrentUsername().orElse("Student");
        TalkIOSessionDTO session = talkIOService.practiceModuleTopic(username, moduleCode, topicTitle, promptText, speechText);
        return ResponseEntity.ok(ApiResponse.ok("Evaluation completed by TalkIO AI Agent", session));
    }
}
`);

console.log('Part 2 Controllers written successfully');
