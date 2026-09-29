package mx.iqenglish.tutoring.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class UpdateUserRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name cannot exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name cannot exceed 100 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Size(max = 150, message = "Email cannot exceed 150 characters")
    private String email;

    @Size(max = 30, message = "Phone cannot exceed 30 characters")
    private String phone;

    private String status;
    private String avatarUrl;
    private Long campusId;

    // Student fields
    @Size(max = 50, message = "Student number cannot exceed 50 characters")
    private String studentNumber;

    private Long currentLevelId;
    private Long currentBookId;
    private Long currentModuleId;

    // Teacher fields
    @Size(max = 50, message = "Employee number cannot exceed 50 characters")
    private String employeeNumber;

    @Size(max = 150, message = "Specialty cannot exceed 150 characters")
    private String specialty;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate hireDate;

    public UpdateUserRequest() {}

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public Long getCampusId() { return campusId; }
    public void setCampusId(Long campusId) { this.campusId = campusId; }
    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }
    public Long getCurrentLevelId() { return currentLevelId; }
    public void setCurrentLevelId(Long currentLevelId) { this.currentLevelId = currentLevelId; }
    public Long getLevelId() { return currentLevelId; }
    public void setLevelId(Long levelId) { this.currentLevelId = levelId; }
    public Long getCurrentBookId() { return currentBookId; }
    public void setCurrentBookId(Long currentBookId) { this.currentBookId = currentBookId; }
    public Long getBookId() { return currentBookId; }
    public void setBookId(Long bookId) { this.currentBookId = bookId; }
    public Long getCurrentModuleId() { return currentModuleId; }
    public void setCurrentModuleId(Long currentModuleId) { this.currentModuleId = currentModuleId; }
    public Long getModuleId() { return currentModuleId; }
    public void setModuleId(Long moduleId) { this.currentModuleId = moduleId; }
    public String getEmployeeNumber() { return employeeNumber; }
    public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }
}