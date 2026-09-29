package mx.iqenglish.tutoring.repository;

import mx.iqenglish.tutoring.entity.Appointment;
import mx.iqenglish.tutoring.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("SELECT a FROM Appointment a WHERE a.session.group.id = :groupId AND (a.status = 'CONFIRMED' OR a.status = 'COMPLETED') ORDER BY a.student.user.lastName ASC, a.student.user.firstName ASC")
    List<Appointment> findEnrolledByGroupId(@Param("groupId") Long groupId);

    @Query("SELECT a FROM Appointment a WHERE a.session.group.teacher.id = :teacherId AND (a.status = 'CONFIRMED' OR a.status = 'COMPLETED') ORDER BY a.session.group.code ASC, a.student.user.lastName ASC, a.student.user.firstName ASC")
    List<Appointment> findEnrolledByTeacherId(@Param("teacherId") Long teacherId);

    Optional<Appointment> findByAppointmentNumber(String appointmentNumber);
    List<Appointment> findByStudentId(Long studentId);
    List<Appointment> findByStudentIdAndStatus(Long studentId, AppointmentStatus status);
    List<Appointment> findBySessionId(Long sessionId);
    List<Appointment> findBySessionIdAndStatus(Long sessionId, AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.session.id = :sessionId AND a.status = 'CONFIRMED'")
    long countConfirmedBySessionId(@Param("sessionId") Long sessionId);

    @Query("SELECT a FROM Appointment a WHERE a.student.id = :studentId " +
           "AND a.session.sessionDate = :date " +
           "AND a.status = 'CONFIRMED' " +
           "AND ((a.session.startTime < :endTime AND a.session.endTime > :startTime)) " +
           "AND (:excludeAppointmentId IS NULL OR a.id != :excludeAppointmentId)")
    List<Appointment> findStudentOverlappingAppointments(@Param("studentId") Long studentId,
                                                         @Param("date") LocalDate date,
                                                         @Param("startTime") LocalTime startTime,
                                                         @Param("endTime") LocalTime endTime,
                                                         @Param("excludeAppointmentId") Long excludeAppointmentId);

    @Query("SELECT a FROM Appointment a WHERE a.student.id = :studentId " +
           "AND a.session.id = :sessionId AND a.status = 'CONFIRMED'")
    Optional<Appointment> findActiveByStudentAndSession(@Param("studentId") Long studentId,
                                                       @Param("sessionId") Long sessionId);
}
