package mx.iqenglish.tutoring.dto;

import jakarta.validation.constraints.NotBlank;

public class UserStatusUpdateRequest {

    @NotBlank(message = "Status is required")
    private String status;

    public UserStatusUpdateRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
