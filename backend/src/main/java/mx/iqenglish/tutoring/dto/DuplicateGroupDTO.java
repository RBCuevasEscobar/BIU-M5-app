package mx.iqenglish.tutoring.dto;
import java.time.LocalDate;
import java.time.LocalTime;
public class DuplicateGroupDTO {
    private String newCode; private String newName; private Long newTeacherId; private LocalDate newSessionDate; private LocalTime newStartTime; private LocalTime newEndTime;
    public DuplicateGroupDTO() {}
    public String getNewCode() { return newCode; } public void setNewCode(String s) { this.newCode = s; }
    public String getNewName() { return newName; } public void setNewName(String s) { this.newName = s; }
    public Long getNewTeacherId() { return newTeacherId; } public void setNewTeacherId(Long id) { this.newTeacherId = id; }
    public LocalDate getNewSessionDate() { return newSessionDate; } public void setNewSessionDate(LocalDate d) { this.newSessionDate = d; }
    public LocalTime getNewStartTime() { return newStartTime; } public void setNewStartTime(LocalTime t) { this.newStartTime = t; }
    public LocalTime getNewEndTime() { return newEndTime; } public void setNewEndTime(LocalTime t) { this.newEndTime = t; }
}
