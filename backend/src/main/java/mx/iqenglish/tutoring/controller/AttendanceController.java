package mx.iqenglish.tutoring.controller;

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
