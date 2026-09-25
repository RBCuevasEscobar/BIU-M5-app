package mx.iqenglish.tutoring.repository;

import mx.iqenglish.tutoring.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByUserUsername(String username);
    Optional<Student> findByStudentNumber(String studentNumber);
    List<Student> findByCampusId(Long campusId);
}
