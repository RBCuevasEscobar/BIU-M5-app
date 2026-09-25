package mx.iqenglish.tutoring.dto;
import java.time.LocalDate;
public class TeacherDTO {
    private Long id; private Long userId; private String employeeNumber; private String fullName; private String email; private String phone; private Long campusId; private String campusName; private String specialty; private LocalDate hireDate; private String status;
    public TeacherDTO() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; } public void setUserId(Long id) { this.userId = id; }
    public String getEmployeeNumber() { return employeeNumber; } public void setEmployeeNumber(String s) { this.employeeNumber = s; }
    public String getFullName() { return fullName; } public void setFullName(String s) { this.fullName = s; }
    public String getEmail() { return email; } public void setEmail(String s) { this.email = s; }
    public String getPhone() { return phone; } public void setPhone(String s) { this.phone = s; }
    public Long getCampusId() { return campusId; } public void setCampusId(Long id) { this.campusId = id; }
    public String getCampusName() { return campusName; } public void setCampusName(String s) { this.campusName = s; }
    public String getSpecialty() { return specialty; } public void setSpecialty(String s) { this.specialty = s; }
    public LocalDate getHireDate() { return hireDate; } public void setHireDate(LocalDate d) { this.hireDate = d; }
    public String getStatus() { return status; } public void setStatus(String s) { this.status = s; }
}
