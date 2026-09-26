package mx.iqenglish.tutoring.service.impl;

import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.entity.*;
import mx.iqenglish.tutoring.entity.Module;
import mx.iqenglish.tutoring.exception.BusinessException;
import mx.iqenglish.tutoring.exception.ResourceNotFoundException;
import mx.iqenglish.tutoring.exception.ScheduleConflictException;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.*;
import mx.iqenglish.tutoring.security.SecurityUtils;
import mx.iqenglish.tutoring.security.UserPrincipal;
import mx.iqenglish.tutoring.service.AuditService;
import mx.iqenglish.tutoring.service.TutoringGroupService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    public TutoringGroupServiceImpl(TutoringGroupRepository groupRepository,
                                   GroupSessionRepository sessionRepository,
                                   CampusRepository campusRepository,
                                   TeacherRepository teacherRepository,
                                   ModuleRepository moduleRepository,
                                   TopicRepository topicRepository,
                                   UserRepository userRepository,
                                   EntityMapper entityMapper,
                                   AuditService auditService) {
        this.groupRepository = groupRepository;
        this.sessionRepository = sessionRepository;
        this.campusRepository = campusRepository;
        this.teacherRepository = teacherRepository;
        this.moduleRepository = moduleRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
        this.entityMapper = entityMapper;
        this.auditService = auditService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TutoringGroupDTO> getAllGroups() {
        return groupRepository.findAll().stream().map(entityMapper::toTutoringGroupDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TutoringGroupDTO getGroupById(Long id) {
        TutoringGroup group = groupRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("TutoringGroup", id));
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

        if (dto.getCapacity() == null || dto.getCapacity() <= 0) {
            throw new BusinessException("INVALID_CAPACITY", "La capacidad del grupo debe ser mayor a cero", HttpStatus.BAD_REQUEST);
        }

        if (dto.getInitialSessionDate() != null && dto.getInitialStartTime() != null && dto.getInitialEndTime() != null) {
            List<GroupSession> conflicts = sessionRepository.findTeacherOverlappingSessions(
                teacher.getId(), dto.getInitialSessionDate(), dto.getInitialStartTime(), dto.getInitialEndTime(), null
            );
            if (!conflicts.isEmpty()) {
                throw new ScheduleConflictException("El docente " + teacher.getUser().getFullName() + " ya cuenta con una sesion programada en esa fecha y horario.");
            }
        }

        String groupCode = dto.getCode();
        if (groupCode == null || groupCode.isBlank()) {
            groupCode = "TUT-" + (module.getBook() != null ? "B" + module.getBook().getBookNumber() : "GRP") + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        TutoringGroup group = new TutoringGroup();
        group.setCode(groupCode);
        group.setName(dto.getName());
        group.setCampus(campus);
        group.setTeacher(teacher);
        group.setModule(module);
        group.setTopic(topic);
        group.setCapacity(dto.getCapacity());
        group.setCurrentEnrollment(0);
        group.setStatus(GroupStatus.PUBLISHED);
        group.setModality(dto.getModality() != null ? Modality.valueOf(dto.getModality().toUpperCase()) : Modality.PRESENTIAL);

        SecurityUtils.getCurrentUserId().flatMap(userRepository::findById).ifPresent(group::setCreatedBy);

        TutoringGroup savedGroup = groupRepository.save(group);

        if (dto.getInitialSessionDate() != null && dto.getInitialStartTime() != null) {
            LocalTime end = dto.getInitialEndTime() != null ? dto.getInitialEndTime() : dto.getInitialStartTime().plusMinutes(dto.getDurationMinutes());
            GroupSession session = new GroupSession();
            session.setGroup(savedGroup);
            session.setSessionDate(dto.getInitialSessionDate());
            session.setStartTime(dto.getInitialStartTime());
            session.setEndTime(end);
            session.setDurationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 60);
            session.setRoomOrLink(dto.getRoomOrLink() != null ? dto.getRoomOrLink() : "Aula Asignada");
            session.setStatus(SessionStatus.SCHEDULED);
            sessionRepository.save(session);
        }

        auditService.log("GROUP_CREATED", "TUTORING_GROUP", String.valueOf(savedGroup.getId()), "Created group: " + savedGroup.getCode());
        return entityMapper.toTutoringGroupDTO(savedGroup);
    }

    @Override
    @Transactional
    public TutoringGroupDTO updateGroup(Long id, UpdateTutoringGroupDTO dto) {
        TutoringGroup group = groupRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("TutoringGroup", id));

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

        if (dto.getCapacity() == null || dto.getCapacity() <= 0) {
            throw new BusinessException("INVALID_CAPACITY", "La capacidad del grupo debe ser mayor a cero", HttpStatus.BAD_REQUEST);
        }

        int currentEnrollment = group.getCurrentEnrollment() != null ? group.getCurrentEnrollment() : 0;
        if (dto.getCapacity() < currentEnrollment) {
            throw new BusinessException("CAPACITY_BELOW_ENROLLMENT", 
                "No se puede reducir la capacidad a " + dto.getCapacity() + " porque actualmente hay " + currentEnrollment + " alumnos inscritos.", 
                HttpStatus.CONFLICT);
        }

        group.setName(dto.getName());
        group.setCampus(campus);
        group.setTeacher(teacher);
        group.setModule(module);
        group.setTopic(topic);
        group.setCapacity(dto.getCapacity());
        if (dto.getModality() != null && !dto.getModality().isBlank()) {
            group.setModality(Modality.valueOf(dto.getModality().toUpperCase()));
        }
        if (dto.getStatus() != null) {
            group.setStatus(dto.getStatus());
        }
        group.setUpdatedAt(LocalDateTime.now());

        TutoringGroup updated = groupRepository.save(group);
        auditService.log("GROUP_UPDATED", "TUTORING_GROUP", String.valueOf(updated.getId()), "Updated tutoring group " + updated.getCode());
        return entityMapper.toTutoringGroupDTO(updated);
    }

    @Override
    @Transactional
    public void deleteGroup(Long id) {
        TutoringGroup group = groupRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("TutoringGroup", id));

        int currentEnrollment = group.getCurrentEnrollment() != null ? group.getCurrentEnrollment() : 0;
        List<GroupSession> sessions = group.getSessions();
        boolean hasActiveOrHistoricalSessions = sessions != null && !sessions.isEmpty();

        if (currentEnrollment > 0 || hasActiveOrHistoricalSessions) {
            // Logical deletion to preserve academic history
            group.setStatus(GroupStatus.CANCELLED);
            group.setUpdatedAt(LocalDateTime.now());
            if (sessions != null) {
                for (GroupSession s : sessions) {
                    if (s.getStatus() == SessionStatus.SCHEDULED) {
                        s.setStatus(SessionStatus.CANCELLED);
                    }
                }
            }
            groupRepository.save(group);
            auditService.log("GROUP_DELETED", "TUTORING_GROUP", String.valueOf(id), "Logically deleted (CANCELLED) group " + group.getCode() + " with active history");
        } else {
            // Physical deletion only for empty groups with no historical records
            groupRepository.delete(group);
            auditService.log("GROUP_DELETED", "TUTORING_GROUP", String.valueOf(id), "Physically deleted empty group " + group.getCode());
        }
    }

    @Override
    @Transactional
    public TutoringGroupDTO duplicateGroup(Long groupId, DuplicateGroupDTO dto) {
        TutoringGroup original = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("TutoringGroup", groupId));

        Teacher teacher = original.getTeacher();
        if (dto.getNewTeacherId() != null) {
            teacher = teacherRepository.findById(dto.getNewTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", dto.getNewTeacherId()));
        }

        String newCode = dto.getNewCode();
        if (newCode == null || newCode.isBlank()) {
            newCode = original.getCode() + "-DUP-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        }

        TutoringGroup duplicate = new TutoringGroup();
        duplicate.setCode(newCode);
        duplicate.setName(dto.getNewName() != null && !dto.getNewName().isBlank() ? dto.getNewName() : original.getName() + " (Copia)");
        duplicate.setCampus(original.getCampus());
        duplicate.setTeacher(teacher);
        duplicate.setModule(original.getModule());
        duplicate.setTopic(original.getTopic());
        duplicate.setCapacity(original.getCapacity());
        duplicate.setCurrentEnrollment(0);
        duplicate.setStatus(GroupStatus.PUBLISHED);
        duplicate.setModality(original.getModality());

        SecurityUtils.getCurrentUserId().flatMap(userRepository::findById).ifPresent(duplicate::setCreatedBy);

        TutoringGroup savedDuplicate = groupRepository.save(duplicate);

        if (dto.getNewSessionDate() != null && dto.getNewStartTime() != null) {
            LocalTime end = dto.getNewEndTime() != null ? dto.getNewEndTime() : dto.getNewStartTime().plusMinutes(60);
            GroupSession session = new GroupSession();
            session.setGroup(savedDuplicate);
            session.setSessionDate(dto.getNewSessionDate());
            session.setStartTime(dto.getNewStartTime());
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

    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
