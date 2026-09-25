package mx.iqenglish.tutoring.repository;

import mx.iqenglish.tutoring.entity.Campus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampusRepository extends JpaRepository<Campus, Long> {
    Optional<Campus> findByCode(String code);
    List<Campus> findByIsActiveTrue();
}
