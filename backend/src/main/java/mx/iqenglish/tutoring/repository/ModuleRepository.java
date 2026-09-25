package mx.iqenglish.tutoring.repository;

import mx.iqenglish.tutoring.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByBookIdOrderBySequenceOrderAsc(Long bookId);
    Optional<Module> findByModuleCode(String moduleCode);
}
