package mx.iqenglish.tutoring.service.impl;

import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.entity.*;
import mx.iqenglish.tutoring.exception.*;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.*;
import mx.iqenglish.tutoring.security.SecurityUtils;
import mx.iqenglish.tutoring.service.AppointmentService;
import mx.iqenglish.tutoring.service.AuditService;
import mx.iqenglish.tutoring.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentServiceImpl.class);

    private final AppointmentRepository appointmentRepository;
    private final GroupSessionRepository sessionRepository;
    private final TutoringGroupRepository groupRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final EntityMapper entityMapper;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
                                  GroupSessionRepository sessionRepository,
                                  TutoringGroupRepository groupRepository,
                                  StudentRepository studentRepository,
                                  AttendanceRepository attendanceRepository,
                                  NotificationService notificationService,
                                  AuditService auditService,
                                  EntityMapper entityMapper) {
        this.appointmentRepository = appointmentRepository;
        this.sessionRepository = sessionRepository;
        this.groupRepository = groupRepository;
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
        this.entityMapper = entityMapper;
    }

    private Student resolveStudent(Long requestedStudentId) {
        if (requestedStudentId != null) {
            return studentRepository.findById(requestedStudentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", requestedStudentId));
        }
        Long currentUserId = SecurityUtils.getCurrentUserId()
            .orElseThrow(() -> new BusinessException("UNAUTHENTICATED", "Authentication required", HttpStatus.UNAUTHORIZED));
        return studentRepository.findByUserId(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for authenticated user"));
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public synchronized AppointmentDTO bookAppointment(BookAppointmentDTO dto) {
        Student student = resolveStudent(dto.getStudentId());
        GroupSession session = sessionRepository.findById(dto.getSessionId())
            .orElseThrow(() -> new ResourceNotFoundException("GroupSession", dto.getSessionId()));

        TutoringGroup group = session.getGroup();

        // R14: Not allow booking inactive groups
        if (group.getStatus() != GroupStatus.PUBLISHED) {
            throw new BusinessException("GROUP_INACTIVE", "Cannot book session for inactive tutoring group.", HttpStatus.BAD_REQUEST);
        }

        // R15: Not allow booking cancelled sessions
        if (session.getStatus() == SessionStatus.CANCELLED) {
            throw new BusinessException("SESSION_CANCELLED", "Cannot book a cancelled session.", HttpStatus.BAD_REQUEST);
        }

        // R13: Not allow booking past sessions
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        if (session.getSessionDate().isBefore(today) || (session.getSessionDate().isEqual(today) && session.getStartTime().isBefore(now))) {
            throw new BusinessException("PAST_SESSION", "Cannot book a session in the past.", HttpStatus.BAD_REQUEST);
        }

        // R12: Double booking check in same session
        if (appointmentRepository.findActiveByStudentAndSession(student.getId(), session.getId()).isPresent()) {
            throw new DoubleBookingException("Student is already registered for this tutoring session.");
        }

        // R1: Student overlapping appointment check
        List<Appointment> overlaps = appointmentRepository.findStudentOverlappingAppointments(
            student.getId(), session.getSessionDate(), session.getStartTime(), session.getEndTime(), null
        );
        if (!overlaps.isEmpty()) {
            throw new ScheduleConflictException("Student already has another tutoring appointment at this time: " +
                overlaps.get(0).getSession().getGroup().getName());
        }

        // R4 & R16: Academic compatibility check
        if (group.getModule() != null && group.getModule().getBook() != null && student.getCurrentBook() != null) {
            int studentBookNum = student.getCurrentBook().getBookNumber();
            int groupBookNum = group.getModule().getBook().getBookNumber();
            if (studentBookNum < groupBookNum) {
                throw new AcademicLevelMismatchException("Student academic level (" + student.getCurrentBook().getTitle() +
                    ") is not eligible for advanced module in " + group.getModule().getBook().getTitle() + " without supervisor approval.");
            }
        }

        // R3 & R17: Concurrency & Capacity check
        long currentCount = appointmentRepository.countConfirmedBySessionId(session.getId());
        if (currentCount >= group.getCapacity()) {
            group.setCurrentEnrollment(group.getCapacity());
            groupRepository.save(group);
            throw new CapacityExceededException("Esta tutoría acaba de llenarse. No hay cupos disponibles.");
        }

        // Reserve slot: increment group enrollment
        group.setCurrentEnrollment((int) currentCount + 1);
        groupRepository.save(group);

        String apptNumber = "APT-" + session.getSessionDate().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Appointment appt = new Appointment();
        appt.setAppointmentNumber(apptNumber);
        appt.setStudent(student);
        appt.setSession(session);
        appt.setStatus(AppointmentStatus.CONFIRMED);
        appt.setBookedAt(LocalDateTime.now());

        Appointment saved = appointmentRepository.save(appt);

        // Send notifications
        notificationService.sendNotification(
            student.getUser(),
            "Tutoría Confirmada",
            "Tu tutoría para " + group.getModule().getTitle() + " con " + group.getTeacher().getUser().getFullName() + " está confirmada para el " + session.getSessionDate() + " a las " + session.getStartTime() + " hrs.",
            NotificationType.APPOINTMENT_CONFIRMED,
            "APPOINTMENT",
            saved.getId()
        );

        auditService.log("APPOINTMENT_CREATED", "APPOINTMENT", String.valueOf(saved.getId()), "Booked appointment " + apptNumber);
        return entityMapper.toAppointmentDTO(saved);
    }

    @Override
    @Transactional
    public AppointmentDTO cancelAppointment(Long appointmentId, CancelAppointmentDTO dto) {
        Appointment appt = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));

        if (appt.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BusinessException("APPOINTMENT_NOT_ACTIVE", "Appointment cannot be cancelled as it is already " + appt.getStatus(), HttpStatus.BAD_REQUEST);
        }

        // R8: Release capacity
        GroupSession session = appt.getSession();
        TutoringGroup group = session.getGroup();
        group.setCurrentEnrollment(Math.max(0, group.getCurrentEnrollment() - 1));
        groupRepository.save(group);

        appt.setStatus(AppointmentStatus.CANCELLED);
        appt.setCancelledAt(LocalDateTime.now());
        appt.setCancellationReason(dto.getReason() != null ? dto.getReason() : "Cancelado por el estudiante");

        Appointment saved = appointmentRepository.save(appt);

        notificationService.sendNotification(
            appt.getStudent().getUser(),
            "Tutoría Cancelada",
            "Tu tutoría programada para el " + session.getSessionDate() + " ha sido cancelada exitosamente.",
            NotificationType.APPOINTMENT_CANCELLED,
            "APPOINTMENT",
            saved.getId()
        );

        auditService.log("APPOINTMENT_CANCELLED", "APPOINTMENT", String.valueOf(saved.getId()), "Cancelled appointment: " + dto.getReason());
        return entityMapper.toAppointmentDTO(saved);
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class)
    public synchronized AppointmentDTO rescheduleAppointment(Long appointmentId, RescheduleAppointmentDTO dto) {
        Appointment oldAppt = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));

        if (oldAppt.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BusinessException("APPOINTMENT_NOT_RESCHEDULABLE", "Only confirmed appointments can be rescheduled.", HttpStatus.BAD_REQUEST);
        }

        Student student = oldAppt.getStudent();
        GroupSession newSession = sessionRepository.findById(dto.getNewSessionId())
            .orElseThrow(() -> new ResourceNotFoundException("GroupSession", dto.getNewSessionId()));

        TutoringGroup newGroup = newSession.getGroup();

        // 1. Validate new session status and date (R13, R14, R15)
        if (newGroup.getStatus() != GroupStatus.PUBLISHED) {
            throw new BusinessException("GROUP_INACTIVE", "Cannot reschedule to an inactive group.", HttpStatus.BAD_REQUEST);
        }
        if (newSession.getStatus() == SessionStatus.CANCELLED) {
            throw new BusinessException("SESSION_CANCELLED", "Cannot reschedule to a cancelled session.", HttpStatus.BAD_REQUEST);
        }
        if (newSession.getSessionDate().isBefore(LocalDate.now())) {
            throw new BusinessException("PAST_SESSION", "Cannot reschedule to a past session.", HttpStatus.BAD_REQUEST);
        }

        // 2. Validate double booking in new session
        if (appointmentRepository.findActiveByStudentAndSession(student.getId(), newSession.getId()).isPresent()) {
            throw new DoubleBookingException("Student is already registered for the target session.");
        }

        // 3. Validate student schedule conflict excluding current appointment
        List<Appointment> overlaps = appointmentRepository.findStudentOverlappingAppointments(
            student.getId(), newSession.getSessionDate(), newSession.getStartTime(), newSession.getEndTime(), oldAppt.getId()
        );
        if (!overlaps.isEmpty()) {
            throw new ScheduleConflictException("Student already has another tutoring appointment at the new selected time.");
        }

        // 4. Validate academic level compatibility
        if (newGroup.getModule() != null && newGroup.getModule().getBook() != null && student.getCurrentBook() != null) {
            int studentBookNum = student.getCurrentBook().getBookNumber();
            int groupBookNum = newGroup.getModule().getBook().getBookNumber();
            if (studentBookNum < groupBookNum) {
                throw new AcademicLevelMismatchException("Academic level mismatch for the target module.");
            }
        }

        // 5. Check capacity in new group
        long newSessionCount = appointmentRepository.countConfirmedBySessionId(newSession.getId());
        if (newSessionCount >= newGroup.getCapacity()) {
            throw new CapacityExceededException("El nuevo horario seleccionado acaba de llenarse. Tu tutoría original sigue reservada.");
        }

        // 6. Reserve new slot: Increment new group enrollment
        newGroup.setCurrentEnrollment((int) newSessionCount + 1);
        groupRepository.save(newGroup);

        // 7. Release capacity in old group
        TutoringGroup oldGroup = oldAppt.getSession().getGroup();
        oldGroup.setCurrentEnrollment(Math.max(0, oldGroup.getCurrentEnrollment() - 1));
        groupRepository.save(oldGroup);

        // 8. Mark old appointment as RESCHEDULED
        oldAppt.setStatus(AppointmentStatus.RESCHEDULED);
        oldAppt.setCancellationReason("Reprogramado a sesión ID: " + newSession.getId());
        oldAppt.setCancelledAt(LocalDateTime.now());
        appointmentRepository.save(oldAppt);

        // 9. Create new Appointment referencing previous
        String newApptNumber = "APT-" + newSession.getSessionDate().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Appointment newAppt = new Appointment();
        newAppt.setAppointmentNumber(newApptNumber);
        newAppt.setStudent(student);
        newAppt.setSession(newSession);
        newAppt.setStatus(AppointmentStatus.CONFIRMED);
        newAppt.setBookedAt(LocalDateTime.now());
        newAppt.setPreviousAppointment(oldAppt);

        Appointment savedNewAppt = appointmentRepository.save(newAppt);

        notificationService.sendNotification(
            student.getUser(),
            "Tutoría Reprogramada Exitosamente",
            "Tu tutoría ha sido reprogramada para el " + newSession.getSessionDate() + " a las " + newSession.getStartTime() + " hrs con " + newGroup.getTeacher().getUser().getFullName() + ".",
            NotificationType.APPOINTMENT_RESCHEDULED,
            "APPOINTMENT",
            savedNewAppt.getId()
        );

        auditService.log("APPOINTMENT_RESCHEDULED", "APPOINTMENT", String.valueOf(savedNewAppt.getId()), "Rescheduled from appt " + oldAppt.getAppointmentNumber());
        return entityMapper.toAppointmentDTO(savedNewAppt);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getMyAppointments() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
            .orElseThrow(() -> new BusinessException("UNAUTHENTICATED", "Authentication required", HttpStatus.UNAUTHORIZED));
        Student student = studentRepository.findByUserId(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for authenticated user"));
        return getAppointmentsByStudent(student.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByStudent(Long studentId) {
        return appointmentRepository.findByStudentId(studentId).stream()
            .map(appt -> {
                AppointmentDTO dto = entityMapper.toAppointmentDTO(appt);
                attendanceRepository.findByAppointmentId(appt.getId()).ifPresent(att -> {
                    dto.setAttendanceStatus(att.getStatus().name());
                    dto.setAttendanceNotes(att.getNotes());
                });
                return dto;
            }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsBySession(Long sessionId) {
        return appointmentRepository.findBySessionId(sessionId).stream()
            .map(entityMapper::toAppointmentDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentDTO getAppointmentById(Long id) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        AppointmentDTO dto = entityMapper.toAppointmentDTO(appt);
        attendanceRepository.findByAppointmentId(appt.getId()).ifPresent(att -> {
            dto.setAttendanceStatus(att.getStatus().name());
            dto.setAttendanceNotes(att.getNotes());
        });
        return dto;
    }
}
