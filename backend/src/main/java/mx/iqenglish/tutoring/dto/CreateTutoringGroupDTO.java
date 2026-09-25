package mx.iqenglish.tutoring.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
public class CreateTutoringGroupDTO {
    private String code;
    @NotBlank(message = "Group name is required") private String name;
    @NotNull(message = "Campus ID is required") private Long campusId;
    @NotNull(message = "Teacher ID is required") private Long teacherId;
    @NotNull(message = "Module ID is required") private Long moduleId;
    private Long topicId; private Integer capacity = 12; private String modality = "PRESENTIAL";
    private LocalDate initialSessionDate; private LocalTime initialStartTime; private LocalTime initialEndTime; private Integer durationMinutes = 60; private String roomOrLink;
    public CreateTutoringGroupDTO() {}
    public String getCode() { return code; } public void setCode(String s) { this.code = s; }
    public String getName() { return name; } public void setName(String s) { this.name = s; }
    public Long getCampusId() { return campusId; } public void setCampusId(Long id) { this.campusId = id; }
    public Long getTeacherId() { return teacherId; } public void setTeacherId(Long id) { this.teacherId = id; }
    public Long getModuleId() { return moduleId; } public void setModuleId(Long id) { this.moduleId = id; }
    public Long getTopicId() { return topicId; } public void setTopicId(Long id) { this.topicId = id; }
    public Integer getCapacity() { return capacity; } public void setCapacity(Integer n) { this.capacity = n; }
    public String getModality() { return modality; } public void setModality(String s) { this.modality = s; }
    public LocalDate getInitialSessionDate() { return initialSessionDate; } public void setInitialSessionDate(LocalDate d) { this.initialSessionDate = d; }
    public LocalTime getInitialStartTime() { return initialStartTime; } public void setInitialStartTime(LocalTime t) { this.initialStartTime = t; }
    public LocalTime getInitialEndTime() { return initialEndTime; } public void setInitialEndTime(LocalTime t) { this.initialEndTime = t; }
    public Integer getDurationMinutes() { return durationMinutes; } public void setDurationMinutes(Integer n) { this.durationMinutes = n; }
    public String getRoomOrLink() { return roomOrLink; } public void setRoomOrLink(String s) { this.roomOrLink = s; }
}
