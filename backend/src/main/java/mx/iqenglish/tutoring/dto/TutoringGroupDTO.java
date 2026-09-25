package mx.iqenglish.tutoring.dto;
import java.time.LocalDateTime;
import java.util.List;
public class TutoringGroupDTO {
    private Long id; private String code; private String name; private Long campusId; private String campusName; private Long teacherId; private String teacherName; private Long bookId; private Integer bookNumber; private String bookTitle; private Long moduleId; private String moduleCode; private String moduleTitle; private Long topicId; private String topicTitle; private Integer capacity; private Integer currentEnrollment; private Integer availableSeats; private boolean isFull; private String status; private String modality; private List<GroupSessionDTO> sessions; private LocalDateTime createdAt;
    public TutoringGroupDTO() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getCode() { return code; } public void setCode(String s) { this.code = s; }
    public String getName() { return name; } public void setName(String s) { this.name = s; }
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
    public Integer getCapacity() { return capacity; } public void setCapacity(Integer n) { this.capacity = n; }
    public Integer getCurrentEnrollment() { return currentEnrollment; } public void setCurrentEnrollment(Integer n) { this.currentEnrollment = n; }
    public Integer getAvailableSeats() { return availableSeats; } public void setAvailableSeats(Integer n) { this.availableSeats = n; }
    public boolean isFull() { return isFull; } public void setFull(boolean b) { this.isFull = b; }
    public String getStatus() { return status; } public void setStatus(String s) { this.status = s; }
    public String getModality() { return modality; } public void setModality(String s) { this.modality = s; }
    public List<GroupSessionDTO> getSessions() { return sessions; } public void setSessions(List<GroupSessionDTO> l) { this.sessions = l; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
