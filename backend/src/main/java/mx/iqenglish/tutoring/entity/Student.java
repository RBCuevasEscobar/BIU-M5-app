package mx.iqenglish.tutoring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "student_number", nullable = false, unique = true, length = 50)
    private String studentNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "campus_id", nullable = false)
    private Campus campus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_level_id", nullable = false)
    private AcademicLevel currentLevel;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_book_id", nullable = false)
    private Book currentBook;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_module_id")
    private Module currentModule;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Student() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }
    public Campus getCampus() { return campus; }
    public void setCampus(Campus campus) { this.campus = campus; }
    public AcademicLevel getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(AcademicLevel currentLevel) { this.currentLevel = currentLevel; }
    public Book getCurrentBook() { return currentBook; }
    public void setCurrentBook(Book currentBook) { this.currentBook = currentBook; }
    public Module getCurrentModule() { return currentModule; }
    public void setCurrentModule(Module currentModule) { this.currentModule = currentModule; }
    public LocalDate getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDate enrollmentDate) { this.enrollmentDate = enrollmentDate; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
