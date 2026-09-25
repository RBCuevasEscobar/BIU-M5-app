package mx.iqenglish.tutoring.repository;

import mx.iqenglish.tutoring.entity.GroupStatus;
import mx.iqenglish.tutoring.entity.TutoringGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TutoringGroupRepository extends JpaRepository<TutoringGroup, Long> {
    Optional<TutoringGroup> findByCode(String code);
    List<TutoringGroup> findByStatus(GroupStatus status);
    List<TutoringGroup> findByCampusId(Long campusId);
    List<TutoringGroup> findByTeacherId(Long teacherId);
    List<TutoringGroup> findByModuleId(Long moduleId);

    @Query("SELECT g FROM TutoringGroup g WHERE " +
           "(:campusId IS NULL OR g.campus.id = :campusId) AND " +
           "(:moduleId IS NULL OR g.module.id = :moduleId) AND " +
           "(:teacherId IS NULL OR g.teacher.id = :teacherId) AND " +
           "(:bookId IS NULL OR g.module.book.id = :bookId) AND " +
           "(:status IS NULL OR g.status = :status)")
    List<TutoringGroup> filterGroups(@Param("campusId") Long campusId,
                                     @Param("moduleId") Long moduleId,
                                     @Param("teacherId") Long teacherId,
                                     @Param("bookId") Long bookId,
                                     @Param("status") GroupStatus status);
}
