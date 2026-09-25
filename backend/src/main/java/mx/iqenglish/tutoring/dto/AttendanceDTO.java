package mx.iqenglish.tutoring.dto;
import java.time.LocalDateTime;
public class AttendanceDTO {
    private Long id; private Long appointmentId; private Long sessionId; private Long studentId; private String studentName; private String studentNumber; private String status; private String notes; private Long recordedByTeacherId; private String teacherName; private LocalDateTime recordedAt;
    public AttendanceDTO() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getAppointmentId() { return appointmentId; } public void setAppointmentId(Long id) { this.appointmentId = id; }
    public Long getSessionId() { return sessionId; } public void setSessionId(Long id) { this.sessionId = id; }
    public Long getStudentId() { return studentId; } public void setStudentId(Long id) { this.studentId = id; }
    public String getStudentName() { return studentName; } public void setStudentName(String s) { this.studentName = s; }
    public String getStudentNumber() { return studentNumber; } public void setStudentNumber(String s) { this.studentNumber = s; }
    public String getStatus() { return status; } public void setStatus(String s) { this.status = s; }
    public String getNotes() { return notes; } public void setNotes(String s) { this.notes = s; }
    public Long getRecordedByTeacherId() { return recordedByTeacherId; } public void setRecordedByTeacherId(Long id) { this.recordedByTeacherId = id; }
    public String getTeacherName() { return teacherName; } public void setTeacherName(String s) { this.teacherName = s; }
    public LocalDateTime getRecordedAt() { return recordedAt; } public void setRecordedAt(LocalDateTime t) { this.recordedAt = t; }
}
