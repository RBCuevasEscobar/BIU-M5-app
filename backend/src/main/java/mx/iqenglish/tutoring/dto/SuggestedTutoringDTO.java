package mx.iqenglish.tutoring.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class SuggestedTutoringDTO {
    private Long moduleId;
    private String moduleCode;
    private String moduleTitle;
    private String bookTitle;
    private Integer bookNumber;
    private Boolean hasGroup;
    private String status;
    private Long groupId;
    private String groupCode;
    private String groupName;
    private Long sessionId;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String teacherName;
    private String campusName;
    private Integer availableSeats;
    private Integer capacity;

    public SuggestedTutoringDTO() {}

    public Long getModuleId() { return moduleId; }
    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }
    public String getModuleCode() { return moduleCode; }
    public void setModuleCode(String moduleCode) { this.moduleCode = moduleCode; }
    public String getModuleTitle() { return moduleTitle; }
    public void setModuleTitle(String moduleTitle) { this.moduleTitle = moduleTitle; }
    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
    public Integer getBookNumber() { return bookNumber; }
    public void setBookNumber(Integer bookNumber) { this.bookNumber = bookNumber; }
    public Boolean getHasGroup() { return hasGroup; }
    public void setHasGroup(Boolean hasGroup) { this.hasGroup = hasGroup; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public String getGroupCode() { return groupCode; }
    public void setGroupCode(String groupCode) { this.groupCode = groupCode; }
    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
    public String getCampusName() { return campusName; }
    public void setCampusName(String campusName) { this.campusName = campusName; }
    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
}