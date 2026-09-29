package mx.iqenglish.tutoring.service.impl;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import mx.iqenglish.tutoring.dto.AppointmentDTO;
import mx.iqenglish.tutoring.dto.CreateTutoringGroupDTO;
import mx.iqenglish.tutoring.dto.DuplicateGroupDTO;
import mx.iqenglish.tutoring.dto.GroupReportDTO;
import mx.iqenglish.tutoring.dto.GroupReportItemDTO;
import mx.iqenglish.tutoring.dto.TutoringGroupDTO;
import mx.iqenglish.tutoring.dto.UpdateTutoringGroupDTO;
import mx.iqenglish.tutoring.entity.Appointment;
import mx.iqenglish.tutoring.entity.Attendance;
import mx.iqenglish.tutoring.entity.Campus;
import mx.iqenglish.tutoring.entity.GroupSession;
import mx.iqenglish.tutoring.entity.GroupStatus;
import mx.iqenglish.tutoring.entity.Modality;
import mx.iqenglish.tutoring.entity.Module;
import mx.iqenglish.tutoring.entity.SessionStatus;
import mx.iqenglish.tutoring.entity.Teacher;
import mx.iqenglish.tutoring.entity.Topic;
import mx.iqenglish.tutoring.entity.TutoringGroup;
import mx.iqenglish.tutoring.entity.User;
import mx.iqenglish.tutoring.exception.BusinessException;
import mx.iqenglish.tutoring.exception.ResourceNotFoundException;
import mx.iqenglish.tutoring.exception.ScheduleConflictException;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.AppointmentRepository;
import mx.iqenglish.tutoring.repository.AttendanceRepository;
import mx.iqenglish.tutoring.repository.CampusRepository;
import mx.iqenglish.tutoring.repository.GroupSessionRepository;
import mx.iqenglish.tutoring.repository.ModuleRepository;
import mx.iqenglish.tutoring.repository.TeacherRepository;
import mx.iqenglish.tutoring.repository.TopicRepository;
import mx.iqenglish.tutoring.repository.TutoringGroupRepository;
import mx.iqenglish.tutoring.repository.UserRepository;
import mx.iqenglish.tutoring.security.SecurityUtils;
import mx.iqenglish.tutoring.security.UserPrincipal;
import mx.iqenglish.tutoring.service.AuditService;
import mx.iqenglish.tutoring.service.TutoringGroupService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TutoringGroupServiceImpl implements TutoringGroupService {

    private final TutoringGroupRepository groupRepository;
    private final GroupSessionRepository sessionRepository;
    private final CampusRepository campusRepository;
    private final TeacherRepository teacherRepository;
    private final ModuleRepository moduleRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;
    private final AuditService auditService;
    private final AppointmentRepository appointmentRepository;
    private final AttendanceRepository attendanceRepository;

    public TutoringGroupServiceImpl(TutoringGroupRepository groupRepository,
                                   GroupSessionRepository sessionRepository,
                                   CampusRepository campusRepository,
                                   TeacherRepository teacherRepository,
                                   ModuleRepository moduleRepository,
                                   TopicRepository topicRepository,
                                   UserRepository userRepository,
                                   EntityMapper entityMapper,
                                   AuditService auditService,
                                   AppointmentRepository appointmentRepository,
                                   AttendanceRepository attendanceRepository) {
        this.groupRepository = groupRepository;
        this.sessionRepository = sessionRepository;
        this.campusRepository = campusRepository;
        this.teacherRepository = teacherRepository;
        this.moduleRepository = moduleRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
        this.entityMapper = entityMapper;
        this.auditService = auditService;
        this.appointmentRepository = appointmentRepository;
        this.attendanceRepository = attendanceRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TutoringGroupDTO> getAllGroups() {
        return groupRepository.findAll().stream()
            .map(entityMapper::toTutoringGroupDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TutoringGroupDTO getGroupById(Long id) {
        TutoringGroup group = groupRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("TutoringGroup", id));
        return entityMapper.toTutoringGroupDTO(group);
    }

    @Override
    @Transactional
    public TutoringGroupDTO createGroup(CreateTutoringGroupDTO dto) {
        Campus campus = campusRepository.findById(dto.getCampusId())
            .orElseThrow(() -> new ResourceNotFoundException("Campus", dto.getCampusId()));
        Teacher teacher = teacherRepository.findById(dto.getTeacherId())
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", dto.getTeacherId()));
        Module module = moduleRepository.findById(dto.getModuleId())
            .orElseThrow(() -> new ResourceNotFoundException("Module", dto.getModuleId()));

        Topic topic = null;
        if (dto.getTopicId() != null) {
            topic = topicRepository.findById(dto.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic", dto.getTopicId()));
        }

        LocalDate sessionDate = dto.getInitialSessionDate() != null ? dto.getInitialSessionDate() : LocalDate.now().plusDays(1);
        LocalTime startTime = dto.getInitialStartTime() != null ? dto.getInitialStartTime() : LocalTime.of(10, 0);
        int duration = dto.getDurationMinutes() != null && dto.getDurationMinutes() > 0 ? dto.getDurationMinutes() : 60;
        LocalTime endTime = startTime.plusMinutes(duration);

        List<GroupSession> conflicts = sessionRepository.findTeacherOverlappingSessions(
            teacher.getId(), sessionDate, startTime, endTime, null);
        if (!conflicts.isEmpty()) {
            throw new ScheduleConflictException("El docente " + teacher.getUser().getFullName() + 
                " ya tiene una sesion asignada en el horario de " + startTime + " a " + endTime + " el dia " + sessionDate);
        }

        String groupCode = "TUT-" + (module.getBook() != null ? "B" + module.getBook().getBookNumber() : "GEN") + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        TutoringGroup group = new TutoringGroup();
        group.setCode(groupCode);
        group.setName(dto.getName());
        group.setCampus(campus);
        group.setTeacher(teacher);
        group.setModule(module);
        group.setTopic(topic);
        group.setCapacity(dto.getCapacity() != null ? dto.getCapacity() : 12);
        group.setCurrentEnrollment(0);
        group.setStatus(GroupStatus.PUBLISHED);
        group.setModality(dto.getModality() != null ? Modality.valueOf(dto.getModality().toUpperCase()) : Modality.PRESENTIAL);
        group.setCreatedAt(LocalDateTime.now());
        group.setUpdatedAt(LocalDateTime.now());

        TutoringGroup savedGroup = groupRepository.save(group);

        GroupSession session = new GroupSession();
        session.setGroup(savedGroup);
        session.setSessionDate(sessionDate);
        session.setStartTime(startTime);
        session.setEndTime(endTime);
        session.setDurationMinutes(duration);
        session.setRoomOrLink(dto.getRoomOrLink() != null ? dto.getRoomOrLink() : (group.getModality() == Modality.ONLINE ? "https://meet.google.com/iq-tutoring" : "Aula 101"));
        session.setStatus(SessionStatus.SCHEDULED);
        sessionRepository.save(session);

        auditService.log("GROUP_CREATED", "TUTORING_GROUP", String.valueOf(savedGroup.getId()), "Created group " + savedGroup.getCode());
        return entityMapper.toTutoringGroupDTO(savedGroup);
    }

    @Override
    @Transactional
    public TutoringGroupDTO updateGroup(Long id, UpdateTutoringGroupDTO dto) {
        TutoringGroup group = groupRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("TutoringGroup", id));

        if (dto.getCapacity() != null && dto.getCapacity() < group.getCurrentEnrollment()) {
            throw new BusinessException("CAPACITY_BELOW_ENROLLMENT", 
                "No es posible reducir la capacidad a " + dto.getCapacity() + " porque actualmente hay " + group.getCurrentEnrollment() + " alumnos inscritos.",
                HttpStatus.CONFLICT);
        }

        Campus campus = campusRepository.findById(dto.getCampusId())
            .orElseThrow(() -> new ResourceNotFoundException("Campus", dto.getCampusId()));
        Teacher teacher = teacherRepository.findById(dto.getTeacherId())
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", dto.getTeacherId()));
        Module module = moduleRepository.findById(dto.getModuleId())
            .orElseThrow(() -> new ResourceNotFoundException("Module", dto.getModuleId()));

        Topic topic = null;
        if (dto.getTopicId() != null) {
            topic = topicRepository.findById(dto.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic", dto.getTopicId()));
        }

        group.setName(dto.getName());
        group.setCampus(campus);
        group.setTeacher(teacher);
        group.setModule(module);
        group.setTopic(topic);
        if (dto.getCapacity() != null) group.setCapacity(dto.getCapacity());
        if (dto.getModality() != null) group.setModality(Modality.valueOf(dto.getModality().toUpperCase()));
        if (dto.getStatus() != null) group.setStatus(dto.getStatus());
        group.setUpdatedAt(LocalDateTime.now());

        TutoringGroup updated = groupRepository.save(group);
        auditService.log("GROUP_UPDATED", "TUTORING_GROUP", String.valueOf(id), "Updated group configuration for " + group.getCode());
        return entityMapper.toTutoringGroupDTO(updated);
    }

    @Override
    @Transactional
    public void deleteGroup(Long id) {
        TutoringGroup group = groupRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("TutoringGroup", id));

        if (group.getCurrentEnrollment() > 0) {
            group.setStatus(GroupStatus.CANCELLED);
            group.setUpdatedAt(LocalDateTime.now());
            if (group.getSessions() != null) {
                for (GroupSession session : group.getSessions()) {
                    session.setStatus(SessionStatus.CANCELLED);
                    sessionRepository.save(session);
                }
            }
            groupRepository.save(group);
            auditService.log("GROUP_DELETED", "TUTORING_GROUP", String.valueOf(id), "Logically deleted (CANCELLED) group " + group.getCode() + " with active enrollments");
        } else {
            if (group.getSessions() != null && !group.getSessions().isEmpty()) {
                sessionRepository.deleteAll(group.getSessions());
            }
            groupRepository.delete(group);
            auditService.log("GROUP_DELETED", "TUTORING_GROUP", String.valueOf(id), "Physically deleted empty group " + group.getCode());
        }
    }

    @Override
    @Transactional
    public TutoringGroupDTO duplicateGroup(Long groupId, DuplicateGroupDTO dto) {
        TutoringGroup original = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("TutoringGroup", groupId));

        Teacher targetTeacher = original.getTeacher();
        if (dto.getNewTeacherId() != null) {
            targetTeacher = teacherRepository.findById(dto.getNewTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", dto.getNewTeacherId()));
        }

        String newCode = dto.getNewCode() != null && !dto.getNewCode().isBlank() ? dto.getNewCode() :
            "TUT-" + (original.getModule().getBook() != null ? "B" + original.getModule().getBook().getBookNumber() : "GEN") + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        String newName = dto.getNewName() != null && !dto.getNewName().isBlank() ? dto.getNewName() : original.getName() + " (Copia)";

        TutoringGroup duplicate = new TutoringGroup();
        duplicate.setCode(newCode);
        duplicate.setName(newName);
        duplicate.setCampus(original.getCampus());
        duplicate.setTeacher(targetTeacher);
        duplicate.setModule(original.getModule());
        duplicate.setTopic(original.getTopic());
        duplicate.setCapacity(original.getCapacity());
        duplicate.setCurrentEnrollment(0);
        duplicate.setStatus(GroupStatus.PUBLISHED);
        duplicate.setModality(original.getModality());
        duplicate.setCreatedAt(LocalDateTime.now());
        duplicate.setUpdatedAt(LocalDateTime.now());

        TutoringGroup savedDuplicate = groupRepository.save(duplicate);

        if (original.getSessions() != null && !original.getSessions().isEmpty()) {
            GroupSession origSession = original.getSessions().get(0);
            LocalDate sessionDate = dto.getNewSessionDate() != null ? dto.getNewSessionDate() : origSession.getSessionDate().plusDays(7);
            LocalTime start = dto.getNewStartTime() != null ? dto.getNewStartTime() : origSession.getStartTime();
            LocalTime end = dto.getNewEndTime() != null ? dto.getNewEndTime() : origSession.getEndTime();

            List<GroupSession> conflicts = sessionRepository.findTeacherOverlappingSessions(
                targetTeacher.getId(), sessionDate, start, end, null);
            if (!conflicts.isEmpty()) {
                throw new ScheduleConflictException("El docente seleccionado ya tiene una sesion programada en el horario de duplicacion: " + sessionDate + " de " + start + " a " + end);
            }

            GroupSession session = new GroupSession();
            session.setGroup(savedDuplicate);
            session.setSessionDate(sessionDate);
            session.setStartTime(start);
            session.setEndTime(end);
            session.setDurationMinutes(origSession.getDurationMinutes());
            session.setRoomOrLink(origSession.getRoomOrLink());
            session.setStatus(SessionStatus.SCHEDULED);
            sessionRepository.save(session);
        } else {
            LocalDate sessionDate = dto.getNewSessionDate() != null ? dto.getNewSessionDate() : LocalDate.now().plusDays(7);
            LocalTime start = dto.getNewStartTime() != null ? dto.getNewStartTime() : LocalTime.of(10, 0);
            LocalTime end = dto.getNewEndTime() != null ? dto.getNewEndTime() : start.plusMinutes(60);

            GroupSession session = new GroupSession();
            session.setGroup(savedDuplicate);
            session.setSessionDate(sessionDate);
            session.setStartTime(start);
            session.setEndTime(end);
            session.setDurationMinutes(60);
            session.setRoomOrLink("Aula Duplicada");
            session.setStatus(SessionStatus.SCHEDULED);
            sessionRepository.save(session);
        }

        auditService.log("GROUP_DUPLICATED", "TUTORING_GROUP", String.valueOf(savedDuplicate.getId()), "Duplicated from group " + original.getCode());
        return entityMapper.toTutoringGroupDTO(savedDuplicate);
    }

    @Override
    @Transactional
    public TutoringGroupDTO updateGroupStatus(Long id, GroupStatus status) {
        TutoringGroup group = groupRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("TutoringGroup", id));
        group.setStatus(status);
        group.setUpdatedAt(LocalDateTime.now());
        TutoringGroup updated = groupRepository.save(group);
        auditService.log("GROUP_STATUS_UPDATED", "TUTORING_GROUP", String.valueOf(id), "Updated status to " + status);
        return entityMapper.toTutoringGroupDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TutoringGroupDTO> filterGroups(Long campusId, Long moduleId, Long teacherId, Long bookId, GroupStatus status) {
        return groupRepository.filterGroups(campusId, moduleId, teacherId, bookId, status)
            .stream().map(entityMapper::toTutoringGroupDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GroupReportDTO generateGroupReport(Long campusId, Long moduleId, Long teacherId, Long bookId, GroupStatus status) {
        Long effectiveTeacherId = teacherId;
        String scope = "ALL_GROUPS";

        UserPrincipal currentUser = SecurityUtils.getCurrentUserPrincipal().orElse(null);
        if (currentUser != null) {
            boolean isTeacherOnly = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER")) &&
                currentUser.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPERVISOR"));

            if (isTeacherOnly) {
                Teacher teacher = teacherRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new BusinessException("TEACHER_NOT_FOUND", "No teacher record associated with current user", HttpStatus.FORBIDDEN));
                effectiveTeacherId = teacher.getId();
                scope = "MY_GROUPS";
            }
        }

        List<TutoringGroup> groups = groupRepository.filterGroups(campusId, moduleId, effectiveTeacherId, bookId, status);
        GroupReportDTO report = new GroupReportDTO();
        report.setGeneratedAt(LocalDateTime.now());
        report.setGeneratedBy(currentUser != null ? currentUser.getUsername() : "SYSTEM");
        report.setScope(scope);
        report.setTotalGroups(groups.size());

        int totalCap = 0;
        int totalEnr = 0;
        int published = 0;
        int inactive = 0;
        int cancelled = 0;
        List<GroupReportItemDTO> items = new ArrayList<>();

        for (TutoringGroup g : groups) {
            GroupReportItemDTO item = new GroupReportItemDTO();
            item.setGroupId(g.getId());
            item.setCode(g.getCode());
            item.setName(g.getName());
            item.setCampusName(g.getCampus() != null ? g.getCampus().getName() : "N/A");
            item.setTeacherName(g.getTeacher() != null && g.getTeacher().getUser() != null ? g.getTeacher().getUser().getFullName() : "N/A");
            item.setTeacherEmail(g.getTeacher() != null && g.getTeacher().getUser() != null ? g.getTeacher().getUser().getEmail() : "N/A");
            item.setBookTitle(g.getModule() != null && g.getModule().getBook() != null ? g.getModule().getBook().getTitle() : "N/A");
            item.setBookNumber(g.getModule() != null && g.getModule().getBook() != null ? g.getModule().getBook().getBookNumber() : null);
            item.setModuleCode(g.getModule() != null ? g.getModule().getModuleCode() : "N/A");
            item.setModuleTitle(g.getModule() != null ? g.getModule().getTitle() : "N/A");
            item.setTopicTitle(g.getTopic() != null ? g.getTopic().getTitle() : "N/A");
            
            int cap = g.getCapacity() != null ? g.getCapacity() : 0;
            int enr = g.getCurrentEnrollment() != null ? g.getCurrentEnrollment() : 0;
            item.setCapacity(cap);
            item.setCurrentEnrollment(enr);
            item.setAvailableSeats(Math.max(0, cap - enr));
            item.setOccupancyPercentage(cap > 0 ? Math.round(((double) enr / cap) * 10000.0) / 100.0 : 0.0);
            item.setStatus(g.getStatus() != null ? g.getStatus().name() : "N/A");
            item.setModality(g.getModality() != null ? g.getModality().name() : "N/A");
            item.setSessionsCount(g.getSessions() != null ? g.getSessions().size() : 0);
            item.setCreatedAt(g.getCreatedAt());

            items.add(item);

            totalCap += cap;
            totalEnr += enr;
            if (g.getStatus() == GroupStatus.PUBLISHED) published++;
            else if (g.getStatus() == GroupStatus.INACTIVE) inactive++;
            else if (g.getStatus() == GroupStatus.CANCELLED) cancelled++;
        }

        report.setTotalCapacity(totalCap);
        report.setTotalEnrolled(totalEnr);
        report.setTotalAvailableSeats(Math.max(0, totalCap - totalEnr));
        report.setAverageOccupancyPercentage(totalCap > 0 ? Math.round(((double) totalEnr / totalCap) * 10000.0) / 100.0 : 0.0);
        report.setPublishedCount(published);
        report.setInactiveCount(inactive);
        report.setCancelledCount(cancelled);
        report.setItems(items);

        auditService.log("GROUP_REPORT_GENERATED", "TUTORING_GROUP", "REPORT", "Generated report scope " + scope + ", records: " + items.size());
        return report;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportGroupReportCsv(Long campusId, Long moduleId, Long teacherId, Long bookId, GroupStatus status) {
        GroupReportDTO report = generateGroupReport(campusId, moduleId, teacherId, bookId, status);
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Codigo,Nombre,Plantel,Docente,Email Docente,Libro,Modulo,Tema,Capacidad,Inscritos,Cupos Disponibles,Ocupacion (%),Estado,Modalidad,Sesiones,Fecha Creacion\n");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (GroupReportItemDTO item : report.getItems()) {
            sb.append(item.getGroupId()).append(",")
              .append(escapeCsv(item.getCode())).append(",")
              .append(escapeCsv(item.getName())).append(",")
              .append(escapeCsv(item.getCampusName())).append(",")
              .append(escapeCsv(item.getTeacherName())).append(",")
              .append(escapeCsv(item.getTeacherEmail())).append(",")
              .append(escapeCsv(item.getBookTitle())).append(",")
              .append(escapeCsv(item.getModuleCode() + " - " + item.getModuleTitle())).append(",")
              .append(escapeCsv(item.getTopicTitle())).append(",")
              .append(item.getCapacity()).append(",")
              .append(item.getCurrentEnrollment()).append(",")
              .append(item.getAvailableSeats()).append(",")
              .append(item.getOccupancyPercentage()).append(",")
              .append(item.getStatus()).append(",")
              .append(item.getModality()).append(",")
              .append(item.getSessionsCount()).append(",")
              .append(item.getCreatedAt() != null ? item.getCreatedAt().format(dtf) : "").append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getEnrolledStudentsByGroup(Long groupId) {
        TutoringGroup group = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("TutoringGroup", groupId));

        UserPrincipal currentUser = SecurityUtils.getCurrentUserPrincipal().orElse(null);
        if (currentUser != null) {
            boolean isTeacherOnly = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER")) &&
                currentUser.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPERVISOR"));
            if (isTeacherOnly && (group.getTeacher() == null || group.getTeacher().getUser() == null || !group.getTeacher().getUser().getId().equals(currentUser.getId()))) {
                throw new BusinessException("FORBIDDEN", "No tienes permisos para ver los alumnos de un grupo asignado a otro docente", HttpStatus.FORBIDDEN);
            }
        }

        List<Appointment> appts = appointmentRepository.findEnrolledByGroupId(groupId);
        return appts.stream().map(appt -> {
            AppointmentDTO dto = entityMapper.toAppointmentDTO(appt);
            attendanceRepository.findByAppointmentId(appt.getId()).ifPresent(att -> {
                dto.setAttendanceStatus(att.getStatus() != null ? att.getStatus().name() : null);
                dto.setGrade(att.getGrade());
                dto.setAttendanceNotes(att.getNotes());
            });
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportEnrolledStudentsCsv(Long groupId, Long campusId, Long moduleId, Long teacherId) {
        Long effectiveTeacherId = teacherId;
        UserPrincipal currentUser = SecurityUtils.getCurrentUserPrincipal().orElse(null);
        if (currentUser != null) {
            boolean isTeacherOnly = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER")) &&
                currentUser.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPERVISOR"));
            if (isTeacherOnly) {
                Teacher teacher = teacherRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new BusinessException("TEACHER_NOT_FOUND", "No teacher record associated with current user", HttpStatus.FORBIDDEN));
                effectiveTeacherId = teacher.getId();
            }
        }

        List<Appointment> appts;
        if (groupId != null) {
            TutoringGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("TutoringGroup", groupId));
            if (effectiveTeacherId != null && (group.getTeacher() == null || !group.getTeacher().getId().equals(effectiveTeacherId))) {
                throw new BusinessException("FORBIDDEN", "No tienes permisos para exportar este grupo", HttpStatus.FORBIDDEN);
            }
            appts = appointmentRepository.findEnrolledByGroupId(groupId);
        } else if (effectiveTeacherId != null) {
            appts = appointmentRepository.findEnrolledByTeacherId(effectiveTeacherId);
        } else {
            List<TutoringGroup> groups = groupRepository.filterGroups(campusId, moduleId, null, null, null);
            appts = new ArrayList<>();
            for (TutoringGroup g : groups) {
                appts.addAll(appointmentRepository.findEnrolledByGroupId(g.getId()));
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Codigo Grupo,Nombre Grupo,Plantel,Modulo,Docente,Matricula Alumno,Nombre Alumno,Correo Alumno,Telefono Alumno,Folio Cita,Fecha Sesion,Hora Sesion,Estado Cita,Asistencia,Nota\n");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter tf = DateTimeFormatter.ofPattern("HH:mm");
        for (Appointment a : appts) {
            TutoringGroup g = a.getSession() != null ? a.getSession().getGroup() : null;
            Optional<Attendance> attOpt = attendanceRepository.findByAppointmentId(a.getId());
            String attStatus = attOpt.map(at -> at.getStatus() != null ? at.getStatus().name() : "PENDIENTE").orElse("PENDIENTE");
            String attGrade = attOpt.map(at -> at.getGrade() != null ? at.getGrade().toString() : "").orElse("");

            sb.append(g != null ? escapeCsv(g.getCode()) : "").append(",")
              .append(g != null ? escapeCsv(g.getName()) : "").append(",")
              .append(g != null && g.getCampus() != null ? escapeCsv(g.getCampus().getName()) : "").append(",")
              .append(g != null && g.getModule() != null ? escapeCsv(g.getModule().getModuleCode() + " - " + g.getModule().getTitle()) : "").append(",")
              .append(g != null && g.getTeacher() != null && g.getTeacher().getUser() != null ? escapeCsv(g.getTeacher().getUser().getFullName()) : "").append(",")
              .append(a.getStudent() != null ? escapeCsv(a.getStudent().getStudentNumber()) : "").append(",")
              .append(a.getStudent() != null && a.getStudent().getUser() != null ? escapeCsv(a.getStudent().getUser().getFullName()) : "").append(",")
              .append(a.getStudent() != null && a.getStudent().getUser() != null ? escapeCsv(a.getStudent().getUser().getEmail()) : "").append(",")
              .append(a.getStudent() != null && a.getStudent().getUser() != null ? escapeCsv(a.getStudent().getUser().getPhone()) : "").append(",")
              .append(escapeCsv(a.getAppointmentNumber())).append(",")
              .append(a.getSession() != null && a.getSession().getSessionDate() != null ? a.getSession().getSessionDate().format(dtf) : "").append(",")
              .append(a.getSession() != null && a.getSession().getStartTime() != null ? a.getSession().getStartTime().format(tf) : "").append(",")
              .append(a.getStatus() != null ? a.getStatus().name() : "").append(",")
              .append(attStatus).append(",")
              .append(attGrade).append("\n");
        }

        auditService.log("ENROLLED_STUDENTS_EXPORTED", "TUTORING_GROUP", groupId != null ? String.valueOf(groupId) : "ALL", "Exported enrolled students report, total rows: " + appts.size());
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
