package mx.iqenglish.tutoring.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
public class RecordAttendanceDTO {
    @NotNull(message = "Appointment ID is required") private Long appointmentId;
    @NotBlank(message = "Attendance status is required (PRESENT, ABSENT, EXCUSED)") private String status; private String notes;
    public RecordAttendanceDTO() {}
    public Long getAppointmentId() { return appointmentId; } public void setAppointmentId(Long id) { this.appointmentId = id; }
    public String getStatus() { return status; } public void setStatus(String s) { this.status = s; }
    public String getNotes() { return notes; } public void setNotes(String s) { this.notes = s; }
}
