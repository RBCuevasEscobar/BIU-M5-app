package mx.iqenglish.tutoring.controller;

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
