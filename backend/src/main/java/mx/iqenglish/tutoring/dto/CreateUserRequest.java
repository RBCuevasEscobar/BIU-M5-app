package mx.iqenglish.tutoring.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.Set;

public class CreateUserRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Size(max = 150, message = "Email cannot exceed 150 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name cannot exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name cannot exceed 100 characters")
    private String lastName;

    @Size(max = 30, message = "Phone cannot exceed 30 characters")
    private String phone;

    private String role;
    private Set<String> roles;
    private String status;
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

    public CreateUserRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
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