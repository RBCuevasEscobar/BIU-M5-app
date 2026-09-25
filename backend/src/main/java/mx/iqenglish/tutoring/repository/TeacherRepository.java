package mx.iqenglish.tutoring.repository;

import mx.iqenglish.tutoring.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByUserId(Long userId);
    Optional<Teacher> findByUserUsername(String username);
    Optional<Teacher> findByEmployeeNumber(String employeeNumber);
    List<Teacher> findByCampusId(Long campusId);
}
