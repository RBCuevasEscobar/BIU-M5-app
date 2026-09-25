package mx.iqenglish.tutoring.repository;

import mx.iqenglish.tutoring.entity.AcademicProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AcademicProgramRepository extends JpaRepository<AcademicProgram, Long> {
    Optional<AcademicProgram> findByCode(String code);
}
