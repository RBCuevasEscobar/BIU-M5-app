package mx.iqenglish.tutoring.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class RecordAttendanceDTO {
    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotBlank(message = "Attendance status is required (PRESENT, ABSENT, EXCUSED)")
    private String status;

    @DecimalMin(value = "50.00", message = "La calificacion minima es 50.00")
    @DecimalMax(value = "100.00", message = "La calificacion maxima es 100.00")
    @Digits(integer = 3, fraction = 2, message = "La calificacion debe tener maximo 2 decimales")
    private BigDecimal grade;

    private String notes;

    public RecordAttendanceDTO() {}

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getGrade() { return grade; }
    public void setGrade(BigDecimal grade) { this.grade = grade; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}