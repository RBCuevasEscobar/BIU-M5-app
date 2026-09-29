package mx.iqenglish.tutoring.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import mx.iqenglish.tutoring.entity.GroupSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupSessionRepository extends JpaRepository<GroupSession, Long> {
    List<GroupSession> findByGroupId(Long groupId);
    List<GroupSession> findBySessionDate(LocalDate sessionDate);
    List<GroupSession> findBySessionDateGreaterThanEqual(LocalDate date);

    @Query("SELECT s FROM GroupSession s WHERE s.group.teacher.id = :teacherId " +
           "AND s.status != 'CANCELLED' " +
           "ORDER BY s.sessionDate ASC, s.startTime ASC")
    List<GroupSession> findActiveSessionsByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT s FROM GroupSession s WHERE s.group.module.id = :moduleId " +
           "AND s.status = 'SCHEDULED' AND s.group.status = 'PUBLISHED' " +
           "ORDER BY s.sessionDate ASC, s.startTime ASC")
    List<GroupSession> findAvailableSessionsByModuleId(@Param("moduleId") Long moduleId);

    @Query("SELECT s FROM GroupSession s WHERE s.group.teacher.id = :teacherId " +
           "AND s.sessionDate = :date " +
           "AND s.status != 'CANCELLED' " +
           "AND ((s.startTime < :endTime AND s.endTime > :startTime)) " +
           "AND (:excludeSessionId IS NULL OR s.id != :excludeSessionId)")
    List<GroupSession> findTeacherOverlappingSessions(@Param("teacherId") Long teacherId,
                                                     @Param("date") LocalDate date,
                                                     @Param("startTime") LocalTime startTime,
                                                     @Param("endTime") LocalTime endTime,
                                                     @Param("excludeSessionId") Long excludeSessionId);

    @Query("SELECT s FROM GroupSession s JOIN s.group g WHERE " +
           "(:campusId IS NULL OR g.campus.id = :campusId) AND " +
           "(:moduleId IS NULL OR g.module.id = :moduleId) AND " +
           "(:teacherId IS NULL OR g.teacher.id = :teacherId) AND " +
           "(:bookId IS NULL OR g.module.book.id = :bookId) AND " +
           "(:dateFrom IS NULL OR s.sessionDate >= :dateFrom) AND " +
           "(:dateTo IS NULL OR s.sessionDate <= :dateTo) AND " +
           "s.status = 'SCHEDULED' AND g.status = 'PUBLISHED'")
    List<GroupSession> searchAvailableSessions(@Param("campusId") Long campusId,
                                              @Param("moduleId") Long moduleId,
                                              @Param("teacherId") Long teacherId,
                                              @Param("bookId") Long bookId,
                                              @Param("dateFrom") LocalDate dateFrom,
                                              @Param("dateTo") LocalDate dateTo);
}
