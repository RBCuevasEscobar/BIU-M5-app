package mx.iqenglish.tutoring.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import mx.iqenglish.tutoring.dto.AttendanceDTO;
import mx.iqenglish.tutoring.dto.RecordAttendanceDTO;
import mx.iqenglish.tutoring.entity.Appointment;
import mx.iqenglish.tutoring.entity.AppointmentStatus;
import mx.iqenglish.tutoring.entity.Attendance;
import mx.iqenglish.tutoring.entity.AttendanceStatus;
import mx.iqenglish.tutoring.entity.GroupSession;
import mx.iqenglish.tutoring.entity.GroupStatus;
import mx.iqenglish.tutoring.entity.NotificationType;
import mx.iqenglish.tutoring.entity.SessionStatus;
import mx.iqenglish.tutoring.entity.Teacher;
import mx.iqenglish.tutoring.entity.TutoringGroup;
import mx.iqenglish.tutoring.exception.BusinessException;
import mx.iqenglish.tutoring.exception.ResourceNotFoundException;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.AppointmentRepository;
import mx.iqenglish.tutoring.repository.AttendanceRepository;
import mx.iqenglish.tutoring.repository.GroupSessionRepository;
import mx.iqenglish.tutoring.repository.TeacherRepository;
import mx.iqenglish.tutoring.repository.TutoringGroupRepository;
import mx.iqenglish.tutoring.security.SecurityUtils;
import mx.iqenglish.tutoring.service.AcademicProgressService;
import mx.iqenglish.tutoring.service.AttendanceService;
import mx.iqenglish.tutoring.service.AuditService;
import mx.iqenglish.tutoring.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final AppointmentRepository appointmentRepository;
    private final TeacherRepository teacherRepository;
    private final GroupSessionRepository sessionRepository;
    private final TutoringGroupRepository groupRepository;
    private final AcademicProgressService progressService;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final EntityMapper entityMapper;

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository,
                                 AppointmentRepository appointmentRepository,
                                 TeacherRepository teacherRepository,
                                 GroupSessionRepository sessionRepository,
                                 TutoringGroupRepository groupRepository,
                                 AcademicProgressService progressService,
                                 NotificationService notificationService,
                                 AuditService auditService,
                                 EntityMapper entityMapper) {
        this.attendanceRepository = attendanceRepository;
        this.appointmentRepository = appointmentRepository;
        this.teacherRepository = teacherRepository;
        this.sessionRepository = sessionRepository;
        this.groupRepository = groupRepository;
        this.progressService = progressService;
        this.notificationService = notificationService;
        this.auditService = auditService;
        this.entityMapper = entityMapper;
    }

    @Override
    @Transactional
    public AttendanceDTO recordAttendance(RecordAttendanceDTO dto) {
        Appointment appt = appointmentRepository.findById(dto.getAppointmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", dto.getAppointmentId()));

        Long currentUserId = SecurityUtils.getCurrentUserId()
            .orElseThrow(() -> new BusinessException("UNAUTHENTICATED", "Authentication required", HttpStatus.UNAUTHORIZED));
        Teacher teacher = teacherRepository.findByUserId(currentUserId)
            .orElseGet(() -> appt.getSession().getGroup().getTeacher());

        AttendanceStatus attStatus;
        try {
            attStatus = AttendanceStatus.valueOf(dto.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("INVALID_STATUS", "Invalid attendance status. Allowed: PRESENT, ABSENT, EXCUSED", HttpStatus.BAD_REQUEST);
        }

        Attendance attendance = attendanceRepository.findByAppointmentId(appt.getId())
            .orElse(new Attendance());

        attendance.setAppointment(appt);
        attendance.setSession(appt.getSession());
        attendance.setStudent(appt.getStudent());
        attendance.setStatus(attStatus);
        attendance.setNotes(dto.getNotes());
        attendance.setRecordedBy(teacher);
        attendance.setRecordedAt(LocalDateTime.now());

        if (attStatus == AttendanceStatus.PRESENT) {
            if (dto.getGrade() == null ||
                dto.getGrade().compareTo(new BigDecimal("50.00")) < 0 ||
                dto.getGrade().compareTo(new BigDecimal("100.00")) > 0) {
                throw new BusinessException("INVALID_GRADE", "Para asistencia Presente, la calificacion es obligatoria y debe ser un valor entre 50.00 y 100.00", HttpStatus.BAD_REQUEST);
            }
            BigDecimal validGrade = dto.getGrade().setScale(2, RoundingMode.HALF_UP);
            attendance.setGrade(validGrade);

            appt.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(appt);

            // Update academic progress in database
            if (appt.getSession().getGroup().getModule() != null) {
                progressService.recordModuleAttendance(
                    appt.getStudent().getId(),
                    appt.getSession().getGroup().getModule().getId(),
                    validGrade
                );
            }
        } else {
            if (dto.getGrade() != null) {
                throw new BusinessException("GRADE_NOT_ALLOWED", "No se permite registrar calificacion cuando el estado de asistencia es " + attStatus + ". El campo de calificacion debe permanecer vacio.", HttpStatus.BAD_REQUEST);
            }
            attendance.setGrade(null);
            if (attStatus == AttendanceStatus.ABSENT) {
                appt.setStatus(AppointmentStatus.NO_SHOW);
                appointmentRepository.save(appt);
            } else if (attStatus == AttendanceStatus.EXCUSED) {
                appt.setStatus(AppointmentStatus.CANCELLED);
                appointmentRepository.save(appt);
            }
        }

        Attendance saved = attendanceRepository.save(attendance);

        // Auto-close session and group if all enrolled students have their attendance recorded
        GroupSession session = appt.getSession();
        if (session != null) {
            List<Appointment> sessionAppointments = appointmentRepository.findBySessionId(session.getId());
            long enrolledCount = sessionAppointments.stream()
                .filter(a -> a.getStatus() != AppointmentStatus.RESCHEDULED && a.getStatus() != AppointmentStatus.CANCELLED)
                .count();

            long recordedAttendances = attendanceRepository.findBySessionId(session.getId()).size();

            if (enrolledCount > 0 && recordedAttendances >= enrolledCount) {
                session.setStatus(SessionStatus.COMPLETED);
                sessionRepository.save(session);

                TutoringGroup group = session.getGroup();
                if (group != null) {
                    group.setStatus(GroupStatus.COMPLETED);
                    groupRepository.save(group);
                    auditService.log("GROUP_COMPLETED", "TUTORING_GROUP", String.valueOf(group.getId()),
                        "Group '" + group.getName() + "' marked as COMPLETED/CLOSED as all " + enrolledCount + " enrolled student attendances have been recorded.");
                }
            }
        }

        notificationService.sendNotification(
            appt.getStudent().getUser(),
            "Asistencia Registrada",
            "Tu asistencia a la sesion de " + appt.getSession().getGroup().getName() + " fue registrada como: " + attStatus.name() + (attStatus == AttendanceStatus.PRESENT ? " con calificacion " + saved.getGrade() : ""),
            NotificationType.ATTENDANCE_RECORDED,
            "ATTENDANCE",
            saved.getId()
        );

        auditService.log("ATTENDANCE_RECORDED", "ATTENDANCE", String.valueOf(saved.getId()), "Attendance: " + attStatus + (saved.getGrade() != null ? ", Grade: " + saved.getGrade() : ""));
        return entityMapper.toAttendanceDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceBySession(Long sessionId) {
        return attendanceRepository.findBySessionId(sessionId).stream().map(entityMapper::toAttendanceDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId).stream().map(entityMapper::toAttendanceDTO).collect(Collectors.toList());
    }
}
