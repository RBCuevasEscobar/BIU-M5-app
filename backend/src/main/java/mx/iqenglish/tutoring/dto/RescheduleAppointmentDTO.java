package mx.iqenglish.tutoring.dto;
import jakarta.validation.constraints.NotNull;
public class RescheduleAppointmentDTO {
    @NotNull(message = "New session ID is required") private Long newSessionId; private String reason;
    public RescheduleAppointmentDTO() {}
    public RescheduleAppointmentDTO(Long newSessionId, String reason) { this.newSessionId = newSessionId; this.reason = reason; }
    public Long getNewSessionId() { return newSessionId; } public void setNewSessionId(Long id) { this.newSessionId = id; }
    public String getReason() { return reason; } public void setReason(String s) { this.reason = s; }
}
