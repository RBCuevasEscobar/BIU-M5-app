package mx.iqenglish.tutoring.mapper;

import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.entity.*;
import mx.iqenglish.tutoring.entity.Module;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class EntityMapper {

    public UserDTO toUserDTO(User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setStatus(user.getStatus() != null ? user.getStatus().name() : null);
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        if (user.getRoles() != null) {
            dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
            Set<String> perms = user.getRoles().stream()
                .filter(r -> r.getPermissions() != null)
                .flatMap(r -> r.getPermissions().stream())
                .map(Permission::getName)
                .collect(Collectors.toSet());
            dto.setPermissions(perms);
        }
        return dto;
    }

    public CampusDTO toCampusDTO(Campus campus) {
        if (campus == null) return null;
        CampusDTO dto = new CampusDTO();
        dto.setId(campus.getId());
        dto.setCode(campus.getCode());
        dto.setName(campus.getName());
        dto.setAddress(campus.getAddress());
        dto.setCity(campus.getCity());
        dto.setState(campus.getState());
        dto.setPostalCode(campus.getPostalCode());
        dto.setPhone(campus.getPhone());
        dto.setEmail(campus.getEmail());
        dto.setIsActive(campus.getIsActive());
        return dto;
    }

    public AcademicProgramDTO toAcademicProgramDTO(AcademicProgram prog, List<AcademicLevelDTO> levels) {
        if (prog == null) return null;
        AcademicProgramDTO dto = new AcademicProgramDTO();
        dto.setId(prog.getId());
        dto.setCode(prog.getCode());
        dto.setName(prog.getName());
        dto.setDescription(prog.getDescription());
        dto.setLevels(levels != null ? levels : Collections.emptyList());
        return dto;
    }

    public AcademicLevelDTO toAcademicLevelDTO(AcademicLevel level, List<BookDTO> books) {
        if (level == null) return null;
        AcademicLevelDTO dto = new AcademicLevelDTO();
        dto.setId(level.getId());
        dto.setProgramId(level.getProgram() != null ? level.getProgram().getId() : null);
        dto.setCode(level.getCode());
        dto.setName(level.getName());
        dto.setSequenceOrder(level.getSequenceOrder());
        dto.setDescription(level.getDescription());
        dto.setBooks(books != null ? books : Collections.emptyList());
        return dto;
    }

    public BookDTO toBookDTO(Book book, List<ModuleDTO> modules) {
        if (book == null) return null;
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setLevelId(book.getLevel() != null ? book.getLevel().getId() : null);
        dto.setLevelName(book.getLevel() != null ? book.getLevel().getName() : null);
        dto.setBookNumber(book.getBookNumber());
        dto.setTitle(book.getTitle());
        dto.setDescription(book.getDescription());
        dto.setCoverImage(book.getCoverImage());
        dto.setModules(modules != null ? modules : Collections.emptyList());
        return dto;
    }

    public ModuleDTO toModuleDTO(Module mod, List<TopicDTO> topics) {
        if (mod == null) return null;
        ModuleDTO dto = new ModuleDTO();
        dto.setId(mod.getId());
        dto.setBookId(mod.getBook() != null ? mod.getBook().getId() : null);
        dto.setBookNumber(mod.getBook() != null ? mod.getBook().getBookNumber() : null);
        dto.setBookTitle(mod.getBook() != null ? mod.getBook().getTitle() : null);
        dto.setModuleCode(mod.getModuleCode());
        dto.setTitle(mod.getTitle());
        dto.setDescription(mod.getDescription());
        dto.setSequenceOrder(mod.getSequenceOrder());
        dto.setTopics(topics != null ? topics : Collections.emptyList());
        return dto;
    }

    public TopicDTO toTopicDTO(Topic topic) {
        if (topic == null) return null;
        TopicDTO dto = new TopicDTO();
        dto.setId(topic.getId());
        dto.setModuleId(topic.getModule() != null ? topic.getModule().getId() : null);
        dto.setTopicCode(topic.getTopicCode());
        dto.setTitle(topic.getTitle());
        dto.setGrammarFocus(topic.getGrammarFocus());
        dto.setVocabularyFocus(topic.getVocabularyFocus());
        dto.setSpeakingFocus(topic.getSpeakingFocus());
        return dto;
    }

    public StudentDTO toStudentDTO(Student student) {
        if (student == null) return null;
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        if (student.getUser() != null) {
            dto.setUserId(student.getUser().getId());
            dto.setFullName(student.getUser().getFullName());
            dto.setEmail(student.getUser().getEmail());
            dto.setPhone(student.getUser().getPhone());
        }
        dto.setStudentNumber(student.getStudentNumber());
        if (student.getCampus() != null) {
            dto.setCampusId(student.getCampus().getId());
            dto.setCampusName(student.getCampus().getName());
        }
        if (student.getCurrentLevel() != null) {
            dto.setCurrentLevelId(student.getCurrentLevel().getId());
            dto.setCurrentLevelName(student.getCurrentLevel().getName());
        }
        if (student.getCurrentBook() != null) {
            dto.setCurrentBookId(student.getCurrentBook().getId());
            dto.setCurrentBookNumber(student.getCurrentBook().getBookNumber());
            dto.setCurrentBookTitle(student.getCurrentBook().getTitle());
        }
        if (student.getCurrentModule() != null) {
            dto.setCurrentModuleId(student.getCurrentModule().getId());
            dto.setCurrentModuleCode(student.getCurrentModule().getModuleCode());
            dto.setCurrentModuleTitle(student.getCurrentModule().getTitle());
        }
        dto.setEnrollmentDate(student.getEnrollmentDate());
        dto.setStatus(student.getStatus() != null ? student.getStatus().name() : null);
        return dto;
    }

    public TeacherDTO toTeacherDTO(Teacher teacher) {
        if (teacher == null) return null;
        TeacherDTO dto = new TeacherDTO();
        dto.setId(teacher.getId());
        if (teacher.getUser() != null) {
            dto.setUserId(teacher.getUser().getId());
            dto.setFullName(teacher.getUser().getFullName());
            dto.setEmail(teacher.getUser().getEmail());
            dto.setPhone(teacher.getUser().getPhone());
        }
        dto.setEmployeeNumber(teacher.getEmployeeNumber());
        if (teacher.getCampus() != null) {
            dto.setCampusId(teacher.getCampus().getId());
            dto.setCampusName(teacher.getCampus().getName());
        }
        dto.setSpecialty(teacher.getSpecialty());
        dto.setHireDate(teacher.getHireDate());
        dto.setStatus(teacher.getStatus() != null ? teacher.getStatus().name() : null);
        return dto;
    }

    public TutoringGroupDTO toTutoringGroupDTO(TutoringGroup group) {
        if (group == null) return null;
        TutoringGroupDTO dto = new TutoringGroupDTO();
        dto.setId(group.getId());
        dto.setCode(group.getCode());
        dto.setName(group.getName());
        if (group.getCampus() != null) {
            dto.setCampusId(group.getCampus().getId());
            dto.setCampusName(group.getCampus().getName());
        }
        if (group.getTeacher() != null) {
            dto.setTeacherId(group.getTeacher().getId());
            dto.setTeacherName(group.getTeacher().getUser() != null ? group.getTeacher().getUser().getFullName() : null);
        }
        if (group.getModule() != null) {
            dto.setModuleId(group.getModule().getId());
            dto.setModuleCode(group.getModule().getModuleCode());
            dto.setModuleTitle(group.getModule().getTitle());
            if (group.getModule().getBook() != null) {
                dto.setBookId(group.getModule().getBook().getId());
                dto.setBookNumber(group.getModule().getBook().getBookNumber());
                dto.setBookTitle(group.getModule().getBook().getTitle());
            }
        }
        if (group.getTopic() != null) {
            dto.setTopicId(group.getTopic().getId());
            dto.setTopicTitle(group.getTopic().getTitle());
        }
        dto.setCapacity(group.getCapacity());
        dto.setCurrentEnrollment(group.getCurrentEnrollment());
        dto.setAvailableSeats(group.getAvailableSeats());
        dto.setFull(group.isFull());
        dto.setStatus(group.getStatus() != null ? group.getStatus().name() : null);
        dto.setModality(group.getModality() != null ? group.getModality().name() : null);
        dto.setCreatedAt(group.getCreatedAt());
        if (group.getSessions() != null) {
            dto.setSessions(group.getSessions().stream().map(this::toGroupSessionDTO).collect(Collectors.toList()));
        }
        return dto;
    }

    public GroupSessionDTO toGroupSessionDTO(GroupSession session) {
        if (session == null) return null;
        GroupSessionDTO dto = new GroupSessionDTO();
        dto.setId(session.getId());
        if (session.getGroup() != null) {
            TutoringGroup g = session.getGroup();
            dto.setGroupId(g.getId());
            dto.setGroupCode(g.getCode());
            dto.setGroupName(g.getName());
            if (g.getCampus() != null) {
                dto.setCampusId(g.getCampus().getId());
                dto.setCampusName(g.getCampus().getName());
            }
            if (g.getTeacher() != null) {
                dto.setTeacherId(g.getTeacher().getId());
                dto.setTeacherName(g.getTeacher().getUser() != null ? g.getTeacher().getUser().getFullName() : null);
            }
            if (g.getModule() != null) {
                dto.setModuleId(g.getModule().getId());
                dto.setModuleCode(g.getModule().getModuleCode());
                dto.setModuleTitle(g.getModule().getTitle());
                if (g.getModule().getBook() != null) {
                    dto.setBookId(g.getModule().getBook().getId());
                    dto.setBookNumber(g.getModule().getBook().getBookNumber());
                    dto.setBookTitle(g.getModule().getBook().getTitle());
                }
            }
            if (g.getTopic() != null) {
                dto.setTopicId(g.getTopic().getId());
                dto.setTopicTitle(g.getTopic().getTitle());
                dto.setGrammarFocus(g.getTopic().getGrammarFocus());
                dto.setVocabularyFocus(g.getTopic().getVocabularyFocus());
                dto.setSpeakingFocus(g.getTopic().getSpeakingFocus());
            }
            dto.setCapacity(g.getCapacity());
            dto.setCurrentEnrollment(g.getCurrentEnrollment());
            dto.setAvailableSeats(g.getAvailableSeats());
            dto.setFull(g.isFull());
            dto.setModality(g.getModality() != null ? g.getModality().name() : null);
        }
        dto.setSessionDate(session.getSessionDate());
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setDurationMinutes(session.getDurationMinutes());
        dto.setRoomOrLink(session.getRoomOrLink());
        dto.setStatus(session.getStatus() != null ? session.getStatus().name() : null);
        return dto;
    }

    public AppointmentDTO toAppointmentDTO(Appointment appt) {
        if (appt == null) return null;
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appt.getId());
        dto.setAppointmentNumber(appt.getAppointmentNumber());
        if (appt.getStudent() != null) {
            dto.setStudentId(appt.getStudent().getId());
            dto.setStudentNumber(appt.getStudent().getStudentNumber());
            if (appt.getStudent().getUser() != null) {
                dto.setStudentName(appt.getStudent().getUser().getFullName());
            }
        }
        dto.setSession(toGroupSessionDTO(appt.getSession()));
        dto.setStatus(appt.getStatus() != null ? appt.getStatus().name() : null);
        dto.setBookedAt(appt.getBookedAt());
        dto.setCancelledAt(appt.getCancelledAt());
        dto.setCancellationReason(appt.getCancellationReason());
        dto.setPreviousAppointmentId(appt.getPreviousAppointment() != null ? appt.getPreviousAppointment().getId() : null);
        return dto;
    }

    public AttendanceDTO toAttendanceDTO(Attendance att) {
        if (att == null) return null;
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(att.getId());
        dto.setAppointmentId(att.getAppointment() != null ? att.getAppointment().getId() : null);
        dto.setSessionId(att.getSession() != null ? att.getSession().getId() : null);
        if (att.getStudent() != null) {
            dto.setStudentId(att.getStudent().getId());
            dto.setStudentNumber(att.getStudent().getStudentNumber());
            if (att.getStudent().getUser() != null) {
                dto.setStudentName(att.getStudent().getUser().getFullName());
            }
        }
        dto.setStatus(att.getStatus() != null ? att.getStatus().name() : null);
        dto.setNotes(att.getNotes());
        if (att.getRecordedBy() != null) {
            dto.setRecordedByTeacherId(att.getRecordedBy().getId());
            if (att.getRecordedBy().getUser() != null) {
                dto.setTeacherName(att.getRecordedBy().getUser().getFullName());
            }
        }
        dto.setRecordedAt(att.getRecordedAt());
        return dto;
    }

    public NotificationDTO toNotificationDTO(Notification notif) {
        if (notif == null) return null;
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notif.getId());
        dto.setUserId(notif.getUser() != null ? notif.getUser().getId() : null);
        dto.setTitle(notif.getTitle());
        dto.setMessage(notif.getMessage());
        dto.setType(notif.getType() != null ? notif.getType().name() : null);
        dto.setIsRead(notif.getIsRead());
        dto.setRelatedEntityType(notif.getRelatedEntityType());
        dto.setRelatedEntityId(notif.getRelatedEntityId());
        dto.setCreatedAt(notif.getCreatedAt());
        return dto;
    }

    public AuditLogDTO toAuditLogDTO(AuditLog log) {
        if (log == null) return null;
        AuditLogDTO dto = new AuditLogDTO();
        dto.setId(log.getId());
        dto.setUserId(log.getUserId());
        dto.setUsername(log.getUsername());
        dto.setAction(log.getAction());
        dto.setEntityName(log.getEntityName());
        dto.setEntityId(log.getEntityId());
        dto.setDetails(log.getDetails());
        dto.setIpAddress(log.getIpAddress());
        dto.setTraceId(log.getTraceId());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}
