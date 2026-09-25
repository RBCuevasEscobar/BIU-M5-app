package mx.iqenglish.tutoring.dto;
import jakarta.validation.constraints.NotBlank;
public class CancelAppointmentDTO {
    @NotBlank(message = "Cancellation reason is required") private String reason;
    public CancelAppointmentDTO() {}
    public CancelAppointmentDTO(String reason) { this.reason = reason; }
    public String getReason() { return reason; } public void setReason(String s) { this.reason = s; }
}
