package mx.iqenglish.tutoring.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import mx.iqenglish.tutoring.dto.CreateSessionDTO;
import mx.iqenglish.tutoring.dto.GroupSessionDTO;
import mx.iqenglish.tutoring.entity.Appointment;
import mx.iqenglish.tutoring.entity.AppointmentStatus;
import mx.iqenglish.tutoring.entity.GroupSession;
import mx.iqenglish.tutoring.entity.NotificationType;
import mx.iqenglish.tutoring.entity.SessionStatus;
import mx.iqenglish.tutoring.entity.Teacher;
import mx.iqenglish.tutoring.entity.TutoringGroup;
import mx.iqenglish.tutoring.exception.BusinessException;
import mx.iqenglish.tutoring.exception.ResourceNotFoundException;
import mx.iqenglish.tutoring.exception.ScheduleConflictException;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.AppointmentRepository;
import mx.iqenglish.tutoring.repository.GroupSessionRepository;
import mx.iqenglish.tutoring.repository.TutoringGroupRepository;
import mx.iqenglish.tutoring.service.AuditService;
import mx.iqenglish.tutoring.service.GroupSessionService;
import mx.iqenglish.tutoring.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GroupSessionServiceImpl implements GroupSessionService {

    private final GroupSessionRepository sessionRepository;
    private final TutoringGroupRepository groupRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final EntityMapper entityMapper;

    public GroupSessionServiceImpl(GroupSessionRepository sessionRepository,
                                  TutoringGroupRepository groupRepository,
                                  AppointmentRepository appointmentRepository,
                                  NotificationService notificationService,
                                  AuditService auditService,
                                  EntityMapper entityMapper) {
        this.sessionRepository = sessionRepository;
        this.groupRepository = groupRepository;
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
        this.entityMapper = entityMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupSessionDTO> searchAvailableSessions(Long campusId, Long moduleId, Long teacherId, Long bookId, LocalDate dateFrom, LocalDate dateTo) {
        return sessionRepository.searchAvailableSessions(campusId, moduleId, teacherId, bookId, dateFrom, dateTo)
            .stream().map(entityMapper::toGroupSessionDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GroupSessionDTO getSessionById(Long id) {
        GroupSession session = sessionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("GroupSession", id));
        return entityMapper.toGroupSessionDTO(session);
    }

    @Override
    @Transactional
    public GroupSessionDTO createSession(CreateSessionDTO dto) {
        TutoringGroup group = groupRepository.findById(dto.getGroupId())
            .orElseThrow(() -> new ResourceNotFoundException("TutoringGroup", dto.getGroupId()));

        if (dto.getSessionDate().isBefore(LocalDate.now())) {
            throw new BusinessException("PAST_DATE_NOT_ALLOWED", "Cannot schedule session in the past", HttpStatus.BAD_REQUEST);
        }

        // Validate teacher schedule conflict (R2)
        List<GroupSession> overlaps = sessionRepository.findTeacherOverlappingSessions(
            group.getTeacher().getId(), dto.getSessionDate(), dto.getStartTime(), dto.getEndTime(), null
        );
        if (!overlaps.isEmpty()) {
            throw new ScheduleConflictException("Teacher " + group.getTeacher().getUser().getFullName() + " already has a session at this date and time.");
        }

        GroupSession session = new GroupSession();
        session.setGroup(group);
        session.setSessionDate(dto.getSessionDate());
        session.setStartTime(dto.getStartTime());
        session.setEndTime(dto.getEndTime());
        session.setDurationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 60);
        session.setRoomOrLink(dto.getRoomOrLink() != null ? dto.getRoomOrLink() : "Aula Asignada");
        session.setStatus(SessionStatus.SCHEDULED);

        GroupSession saved = sessionRepository.save(session);
        auditService.log("SESSION_CREATED", "GROUP_SESSION", String.valueOf(saved.getId()), "Created session for group " + group.getCode());
        return entityMapper.toGroupSessionDTO(saved);
    }

    @Override
    @Transactional
    public void cancelSession(Long sessionId, String reason) {
        GroupSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("GroupSession", sessionId));

        session.setStatus(SessionStatus.CANCELLED);
        sessionRepository.save(session);

        // Find all confirmed appointments and notify enrolled students (R9)
        List<Appointment> appts = appointmentRepository.findBySessionIdAndStatus(sessionId, AppointmentStatus.CONFIRMED);
        for (Appointment appt : appts) {
            appt.setStatus(AppointmentStatus.CANCELLED);
            appt.setCancellationReason("Sesión cancelada por la institución: " + (reason != null ? reason : "Reajuste operativo"));
            appt.setCancelledAt(java.time.LocalDateTime.now());
            appointmentRepository.save(appt);

            notificationService.sendNotification(
                appt.getStudent().getUser(),
                "Tutoría Cancelada por la Institución",
                "Tu sesión del " + session.getSessionDate() + " (" + session.getGroup().getName() + ") ha sido cancelada. Motivo: " + (reason != null ? reason : "Ajuste de horario") + ". Por favor selecciona un nuevo horario.",
                NotificationType.SESSION_CANCELLED,
                "GROUP_SESSION",
                sessionId
            );
        }

        // Reset enrollment capacity
        TutoringGroup group = session.getGroup();
        group.setCurrentEnrollment(Math.max(0, group.getCurrentEnrollment() - appts.size()));
        groupRepository.save(group);

        auditService.log("SESSION_CANCELLED", "GROUP_SESSION", String.valueOf(sessionId), "Session cancelled: " + reason);
    }
}
