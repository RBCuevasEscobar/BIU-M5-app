package mx.iqenglish.tutoring.dto;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
public class CreateSessionDTO {
    @NotNull(message = "Group ID is required") private Long groupId;
    @NotNull(message = "Session date is required") private LocalDate sessionDate;
    @NotNull(message = "Start time is required") private LocalTime startTime;
    @NotNull(message = "End time is required") private LocalTime endTime;
    private Integer durationMinutes = 60; private String roomOrLink;
    public CreateSessionDTO() {}
    public Long getGroupId() { return groupId; } public void setGroupId(Long id) { this.groupId = id; }
    public LocalDate getSessionDate() { return sessionDate; } public void setSessionDate(LocalDate d) { this.sessionDate = d; }
    public LocalTime getStartTime() { return startTime; } public void setStartTime(LocalTime t) { this.startTime = t; }
    public LocalTime getEndTime() { return endTime; } public void setEndTime(LocalTime t) { this.endTime = t; }
    public Integer getDurationMinutes() { return durationMinutes; } public void setDurationMinutes(Integer n) { this.durationMinutes = n; }
    public String getRoomOrLink() { return roomOrLink; } public void setRoomOrLink(String s) { this.roomOrLink = s; }
}
