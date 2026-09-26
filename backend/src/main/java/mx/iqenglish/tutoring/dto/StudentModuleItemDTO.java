package mx.iqenglish.tutoring.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class StudentModuleItemDTO {
    private Long moduleId;
    private String moduleCode;
    private String moduleTitle;
    private Long bookId;
    private Integer bookNumber;
    private String bookTitle;
    private Integer sequenceOrder;
    private String status;
    private LocalDate completionDate;
    private BigDecimal grade;
    private Integer attendanceCount;
    private Boolean hasAvailableGroups;
    private Long appointmentId;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String teacherName;
    private String campusName;

    public StudentModuleItemDTO() {}

    public Long getModuleId() { return moduleId; }
    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }
    public String getModuleCode() { return moduleCode; }
    public void setModuleCode(String moduleCode) { this.moduleCode = moduleCode; }
    public String getModuleTitle() { return moduleTitle; }
    public void setModuleTitle(String moduleTitle) { this.moduleTitle = moduleTitle; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public Integer getBookNumber() { return bookNumber; }
    public void setBookNumber(Integer bookNumber) { this.bookNumber = bookNumber; }
    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
    public Integer getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDate completionDate) { this.completionDate = completionDate; }
    public BigDecimal getGrade() { return grade; }
    public void setGrade(BigDecimal grade) { this.grade = grade; }
    public Integer getAttendanceCount() { return attendanceCount; }
    public void setAttendanceCount(Integer attendanceCount) { this.attendanceCount = attendanceCount; }
    public Boolean getHasAvailableGroups() { return hasAvailableGroups; }
    public void setHasAvailableGroups(Boolean hasAvailableGroups) { this.hasAvailableGroups = hasAvailableGroups; }
    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }
    public LocalTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalTime appointmentTime) { this.appointmentTime = appointmentTime; }
    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
    public String getCampusName() { return campusName; }
    public void setCampusName(String campusName) { this.campusName = campusName; }
}