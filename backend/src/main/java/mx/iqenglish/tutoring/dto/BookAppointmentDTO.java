package mx.iqenglish.tutoring.dto;
import jakarta.validation.constraints.NotNull;
public class BookAppointmentDTO {
    @NotNull(message = "Session ID is required") private Long sessionId; private Long studentId;
    public BookAppointmentDTO() {}
    public BookAppointmentDTO(Long sessionId) { this.sessionId = sessionId; }
    public Long getSessionId() { return sessionId; } public void setSessionId(Long id) { this.sessionId = id; }
    public Long getStudentId() { return studentId; } public void setStudentId(Long id) { this.studentId = id; }
}
