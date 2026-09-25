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
import mx.iqenglish.tutoring.service.AuditService;
import mx.iqenglish.tutoring.service.TutoringGroupService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
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
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", dto.getTeacherId())); // R5
        Module module = moduleRepository.findById(dto.getModuleId())
            .orElseThrow(() -> new ResourceNotFoundException("Module", dto.getModuleId()));

        Topic topic = null;
        if (dto.getTopicId() != null) {
            topic = topicRepository.findById(dto.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic", dto.getTopicId()));
        }

        if (dto.getCapacity() == null || dto.getCapacity() <= 0) {
            throw new BusinessException("INVALID_CAPACITY", "Group capacity must be greater than zero", HttpStatus.BAD_REQUEST);
        }

        // Validate teacher schedule conflict if initial session is provided (R2)
        if (dto.getInitialSessionDate() != null && dto.getInitialStartTime() != null && dto.getInitialEndTime() != null) {
            List<GroupSession> conflicts = sessionRepository.findTeacherOverlappingSessions(
                teacher.getId(), dto.getInitialSessionDate(), dto.getInitialStartTime(), dto.getInitialEndTime(), null
            );
            if (!conflicts.isEmpty()) {
                throw new ScheduleConflictException("Teacher " + teacher.getUser().getFullName() + " already has a scheduled session at this date and time.");
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

        // Create initial session if date provided
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
        duplicate.setName(dto.getNewName() != null && !dto.getNewName().isBlank() ? dto.getNewName() : original.getName() + " (Copy)");
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
}
