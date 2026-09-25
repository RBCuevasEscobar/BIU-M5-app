package mx.iqenglish.tutoring.repository;

import mx.iqenglish.tutoring.entity.AcademicProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicProgressRepository extends JpaRepository<AcademicProgress, Long> {
    List<AcademicProgress> findByStudentId(Long studentId);
    Optional<AcademicProgress> findByStudentIdAndModuleId(Long studentId, Long moduleId);
}
