package mx.iqenglish.tutoring.dto;
import java.time.LocalDate;
import java.time.LocalTime;
public class GroupSessionDTO {
    private Long id; private Long groupId; private String groupCode; private String groupName; private Long campusId; private String campusName; private Long teacherId; private String teacherName; private Long bookId; private Integer bookNumber; private String bookTitle; private Long moduleId; private String moduleCode; private String moduleTitle; private Long topicId; private String topicTitle; private String grammarFocus; private String vocabularyFocus; private String speakingFocus; private LocalDate sessionDate; private LocalTime startTime; private LocalTime endTime; private Integer durationMinutes; private String roomOrLink; private Integer capacity; private Integer currentEnrollment; private Integer availableSeats; private boolean isFull; private String modality; private String status;
    public GroupSessionDTO() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getGroupId() { return groupId; } public void setGroupId(Long id) { this.groupId = id; }
    public String getGroupCode() { return groupCode; } public void setGroupCode(String s) { this.groupCode = s; }
    public String getGroupName() { return groupName; } public void setGroupName(String s) { this.groupName = s; }
    public Long getCampusId() { return campusId; } public void setCampusId(Long id) { this.campusId = id; }
    public String getCampusName() { return campusName; } public void setCampusName(String s) { this.campusName = s; }
    public Long getTeacherId() { return teacherId; } public void setTeacherId(Long id) { this.teacherId = id; }
    public String getTeacherName() { return teacherName; } public void setTeacherName(String s) { this.teacherName = s; }
    public Long getBookId() { return bookId; } public void setBookId(Long id) { this.bookId = id; }
    public Integer getBookNumber() { return bookNumber; } public void setBookNumber(Integer n) { this.bookNumber = n; }
    public String getBookTitle() { return bookTitle; } public void setBookTitle(String s) { this.bookTitle = s; }
    public Long getModuleId() { return moduleId; } public void setModuleId(Long id) { this.moduleId = id; }
    public String getModuleCode() { return moduleCode; } public void setModuleCode(String s) { this.moduleCode = s; }
    public String getModuleTitle() { return moduleTitle; } public void setModuleTitle(String s) { this.moduleTitle = s; }
    public Long getTopicId() { return topicId; } public void setTopicId(Long id) { this.topicId = id; }
    public String getTopicTitle() { return topicTitle; } public void setTopicTitle(String s) { this.topicTitle = s; }
    public String getGrammarFocus() { return grammarFocus; } public void setGrammarFocus(String s) { this.grammarFocus = s; }
    public String getVocabularyFocus() { return vocabularyFocus; } public void setVocabularyFocus(String s) { this.vocabularyFocus = s; }
    public String getSpeakingFocus() { return speakingFocus; } public void setSpeakingFocus(String s) { this.speakingFocus = s; }
    public LocalDate getSessionDate() { return sessionDate; } public void setSessionDate(LocalDate d) { this.sessionDate = d; }
    public LocalTime getStartTime() { return startTime; } public void setStartTime(LocalTime t) { this.startTime = t; }
    public LocalTime getEndTime() { return endTime; } public void setEndTime(LocalTime t) { this.endTime = t; }
    public Integer getDurationMinutes() { return durationMinutes; } public void setDurationMinutes(Integer n) { this.durationMinutes = n; }
    public String getRoomOrLink() { return roomOrLink; } public void setRoomOrLink(String s) { this.roomOrLink = s; }
    public Integer getCapacity() { return capacity; } public void setCapacity(Integer n) { this.capacity = n; }
    public Integer getCurrentEnrollment() { return currentEnrollment; } public void setCurrentEnrollment(Integer n) { this.currentEnrollment = n; }
    public Integer getAvailableSeats() { return availableSeats; } public void setAvailableSeats(Integer n) { this.availableSeats = n; }
    public boolean isFull() { return isFull; } public void setFull(boolean b) { this.isFull = b; }
    public String getModality() { return modality; } public void setModality(String s) { this.modality = s; }
    public String getStatus() { return status; } public void setStatus(String s) { this.status = s; }
}
