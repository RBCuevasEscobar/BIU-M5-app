package mx.iqenglish.tutoring.dto;
import java.time.LocalDateTime;
public class AppointmentDTO {
    private Long id; private String appointmentNumber; private Long studentId; private String studentName; private String studentNumber; private GroupSessionDTO session; private String status; private LocalDateTime bookedAt; private LocalDateTime cancelledAt; private String cancellationReason; private Long previousAppointmentId; private String attendanceStatus; private String attendanceNotes;
    public AppointmentDTO() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getAppointmentNumber() { return appointmentNumber; } public void setAppointmentNumber(String s) { this.appointmentNumber = s; }
    public Long getStudentId() { return studentId; } public void setStudentId(Long id) { this.studentId = id; }
    public String getStudentName() { return studentName; } public void setStudentName(String s) { this.studentName = s; }
    public String getStudentNumber() { return studentNumber; } public void setStudentNumber(String s) { this.studentNumber = s; }
    public GroupSessionDTO getSession() { return session; } public void setSession(GroupSessionDTO s) { this.session = s; }
    public String getStatus() { return status; } public void setStatus(String s) { this.status = s; }
    public LocalDateTime getBookedAt() { return bookedAt; } public void setBookedAt(LocalDateTime t) { this.bookedAt = t; }
    public LocalDateTime getCancelledAt() { return cancelledAt; } public void setCancelledAt(LocalDateTime t) { this.cancelledAt = t; }
    public String getCancellationReason() { return cancellationReason; } public void setCancellationReason(String s) { this.cancellationReason = s; }
    public Long getPreviousAppointmentId() { return previousAppointmentId; } public void setPreviousAppointmentId(Long id) { this.previousAppointmentId = id; }
    public String getAttendanceStatus() { return attendanceStatus; } public void setAttendanceStatus(String s) { this.attendanceStatus = s; }
    public String getAttendanceNotes() { return attendanceNotes; } public void setAttendanceNotes(String s) { this.attendanceNotes = s; }
}
