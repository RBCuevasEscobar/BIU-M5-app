package mx.iqenglish.tutoring.service.impl;

import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.entity.*;
import mx.iqenglish.tutoring.entity.Module;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.*;
import mx.iqenglish.tutoring.security.SecurityUtils;
import mx.iqenglish.tutoring.service.AppointmentService;
import mx.iqenglish.tutoring.service.NotificationService;
import mx.iqenglish.tutoring.service.ReportService;
import mx.iqenglish.tutoring.service.TutoringGroupService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    private final TutoringGroupRepository groupRepository;
    private final GroupSessionRepository sessionRepository;
    private final AppointmentRepository appointmentRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ModuleRepository moduleRepository;
    private final AcademicProgressRepository progressRepository;
    private final TutoringGroupService groupService;
    private final AppointmentService appointmentService;
    private final NotificationService notificationService;
    private final EntityMapper entityMapper;

    public ReportServiceImpl(TutoringGroupRepository groupRepository,
                             GroupSessionRepository sessionRepository,
                             AppointmentRepository appointmentRepository,
                             StudentRepository studentRepository,
                             TeacherRepository teacherRepository,
                             ModuleRepository moduleRepository,
                             AcademicProgressRepository progressRepository,
                             TutoringGroupService groupService,
                             AppointmentService appointmentService,
                             NotificationService notificationService,
                             EntityMapper entityMapper) {
        this.groupRepository = groupRepository;
        this.sessionRepository = sessionRepository;
        this.appointmentRepository = appointmentRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.moduleRepository = moduleRepository;
        this.progressRepository = progressRepository;
        this.groupService = groupService;
        this.appointmentService = appointmentService;
        this.notificationService = notificationService;
        this.entityMapper = entityMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDTO getDashboardSummary() {
        DashboardSummaryDTO summary = new DashboardSummaryDTO();
        Long userId = SecurityUtils.getCurrentUserId().orElse(null);
        String username = SecurityUtils.getCurrentUsername().orElse("Guest");
        summary.setUserFullName(username);

        List<TutoringGroup> activeGroups = groupRepository.findByStatus(GroupStatus.PUBLISHED);
        summary.setTotalActiveGroups((long) activeGroups.size());

        int totalCap = activeGroups.stream().mapToInt(TutoringGroup::getCapacity).sum();
        int totalEnr = activeGroups.stream().mapToInt(TutoringGroup::getCurrentEnrollment).sum();
        double occupancy = totalCap > 0 ? (double) totalEnr / totalCap * 100.0 : 0.0;
        summary.setCampusOccupancyRate(Math.round(occupancy * 10.0) / 10.0);

        summary.setUnreadNotificationsCount(notificationService.getUnreadCount());
        summary.setRecentNotifications(notificationService.getMyNotifications().stream().limit(5).toList());

        if (userId != null) {
            studentRepository.findByUserId(userId).ifPresent(s -> {
                summary.setRole("STUDENT");
                summary.setUserFullName(s.getUser().getFullName());
                summary.setStudentProfile(entityMapper.toStudentDTO(s));

                // 1. All student appointments mapped with attendance details
                List<AppointmentDTO> allAppts = appointmentService.getAppointmentsByStudent(s.getId());

                // 2. Upcoming CONFIRMED appointments only, sorted chronologically (Requirement 1)
                List<AppointmentDTO> confirmedAppts = allAppts.stream()
                    .filter(a -> "CONFIRMED".equalsIgnoreCase(a.getStatus()))
                    .sorted((a1, a2) -> {
                        if (a1.getSession() == null || a2.getSession() == null) return 0;
                        int cmp = a1.getSession().getSessionDate().compareTo(a2.getSession().getSessionDate());
                        if (cmp != 0) return cmp;
                        return a1.getSession().getStartTime().compareTo(a2.getSession().getStartTime());
                    })
                    .collect(Collectors.toList());
                summary.setUpcomingAppointments(confirmedAppts);

                // 3. Academic progress for student's current module (Requirement 2)
                Long currentModId = s.getCurrentModule() != null ? s.getCurrentModule().getId() : null;
                if (currentModId != null) {
                    progressRepository.findByStudentIdAndModuleId(s.getId(), currentModId).ifPresent(p -> {
                        summary.setCurrentModuleAttendanceCount(p.getAttendanceCount());
                        summary.setCurrentModuleGrade(p.getGrade());
                    });
                }
                summary.setCurrentModuleTotalRequired(4);
                if (summary.getCurrentModuleAttendanceCount() == null) {
                    summary.setCurrentModuleAttendanceCount(0);
                }

                // 4. Curriculum modules and dynamic statuses (Requirements 5 & 6)
                List<AcademicProgress> studentProgs = progressRepository.findByStudentId(s.getId());
                Map<Long, AcademicProgress> progMap = studentProgs.stream()
                    .collect(Collectors.toMap(p -> p.getModule().getId(), p -> p, (p1, p2) -> p1));

                List<Module> bookModules = Collections.emptyList();
                if (s.getCurrentBook() != null) {
                    bookModules = moduleRepository.findByBookIdOrderBySequenceOrderAsc(s.getCurrentBook().getId());
                }

                List<StudentModuleItemDTO> curriculumProgress = new ArrayList<>();
                StudentModuleItemDTO nextPendingModuleItem = null;

                for (Module mod : bookModules) {
                    StudentModuleItemDTO item = new StudentModuleItemDTO();
                    item.setModuleId(mod.getId());
                    item.setModuleCode(mod.getModuleCode());
                    item.setModuleTitle(mod.getTitle());
                    item.setBookId(mod.getBook().getId());
                    item.setBookNumber(mod.getBook().getBookNumber());
                    item.setBookTitle(mod.getBook().getTitle());
                    item.setSequenceOrder(mod.getSequenceOrder());

                    AcademicProgress p = progMap.get(mod.getId());
                    boolean isCompleted = p != null && "COMPLETED".equalsIgnoreCase(p.getStatus());

                    // Check if student has active confirmed appointment for this module
                    AppointmentDTO activeApptForMod = confirmedAppts.stream()
                        .filter(a -> a.getSession() != null && a.getSession().getModuleId() != null && a.getSession().getModuleId().equals(mod.getId()))
                        .findFirst().orElse(null);

                    // Check if there are published groups/sessions for this module
                    List<TutoringGroup> modGroups = groupRepository.findByModuleId(mod.getId()).stream()
                        .filter(g -> g.getStatus() == GroupStatus.PUBLISHED)
                        .collect(Collectors.toList());
                    boolean hasGroups = !modGroups.isEmpty();
                    item.setHasAvailableGroups(hasGroups);

                    if (isCompleted) {
                        item.setStatus("COMPLETED");
                        item.setCompletionDate(p.getCompletionDate());
                        item.setGrade(p.getGrade());
                        item.setAttendanceCount(p.getAttendanceCount());
                    } else if (activeApptForMod != null) {
                        item.setStatus("CONFIRMED");
                        item.setAppointmentId(activeApptForMod.getId());
                        item.setAppointmentDate(activeApptForMod.getSession().getSessionDate());
                        item.setAppointmentTime(activeApptForMod.getSession().getStartTime());
                        item.setTeacherName(activeApptForMod.getSession().getTeacherName());
                        item.setCampusName(activeApptForMod.getSession().getCampusName());
                        if (p != null) {
                            item.setAttendanceCount(p.getAttendanceCount());
                            item.setGrade(p.getGrade());
                        }
                    } else if (hasGroups) {
                        item.setStatus("PENDING");
                        if (p != null) {
                            item.setAttendanceCount(p.getAttendanceCount());
                            item.setGrade(p.getGrade());
                        }
                    } else {
                        item.setStatus("GROUP_PENDING");
                        if (p != null) {
                            item.setAttendanceCount(p.getAttendanceCount());
                            item.setGrade(p.getGrade());
                        }
                    }

                    curriculumProgress.add(item);

                    if (!isCompleted && nextPendingModuleItem == null) {
                        nextPendingModuleItem = item;
                    }
                }
                summary.setStudentCurriculumProgress(curriculumProgress);

                // 5. Suggested tutoring when no upcoming confirmed appointments (Requirement 1)
                if (confirmedAppts.isEmpty() && nextPendingModuleItem != null) {
                    SuggestedTutoringDTO suggested = new SuggestedTutoringDTO();
                    suggested.setModuleId(nextPendingModuleItem.getModuleId());
                    suggested.setModuleCode(nextPendingModuleItem.getModuleCode());
                    suggested.setModuleTitle(nextPendingModuleItem.getModuleTitle());
                    suggested.setBookTitle(nextPendingModuleItem.getBookTitle());
                    suggested.setBookNumber(nextPendingModuleItem.getBookNumber());

                    // Check for available sessions for this next module
                    List<GroupSession> availSessions = sessionRepository.findAvailableSessionsByModuleId(nextPendingModuleItem.getModuleId());
                    if (!availSessions.isEmpty()) {
                        GroupSession s0 = availSessions.get(0);
                        suggested.setHasGroup(true);
                        suggested.setStatus("PENDING");
                        suggested.setGroupId(s0.getGroup().getId());
                        suggested.setGroupCode(s0.getGroup().getCode());
                        suggested.setGroupName(s0.getGroup().getName());
                        suggested.setSessionId(s0.getId());
                        suggested.setSessionDate(s0.getSessionDate());
                        suggested.setStartTime(s0.getStartTime());
                        suggested.setEndTime(s0.getEndTime());
                        suggested.setTeacherName(s0.getGroup().getTeacher().getUser().getFullName());
                        suggested.setCampusName(s0.getGroup().getCampus().getName());
                        suggested.setAvailableSeats(s0.getGroup().getAvailableSeats());
                        suggested.setCapacity(s0.getGroup().getCapacity());
                    } else {
                        suggested.setHasGroup(false);
                        suggested.setStatus("GROUP_PENDING");
                    }
                    summary.setSuggestedTutoring(suggested);
                }
            });

            teacherRepository.findByUserId(userId).ifPresent(t -> {
                summary.setRole("TEACHER");
                summary.setUserFullName(t.getUser().getFullName());
                summary.setTeacherProfile(entityMapper.toTeacherDTO(t));
                List<TutoringGroupDTO> teacherGroups = groupService.filterGroups(null, null, t.getId(), null, GroupStatus.PUBLISHED);
                summary.setActiveGroups(teacherGroups);

                // Populate teacher's active sessions (Requirement 4)
                List<GroupSessionDTO> tSessions = sessionRepository.findActiveSessionsByTeacherId(t.getId()).stream()
                    .map(entityMapper::toGroupSessionDTO)
                    .collect(Collectors.toList());
                summary.setTeacherSessions(tSessions);
            });
        }

        if (summary.getRole() == null) {
            summary.setRole("ADMIN_OR_SUPERVISOR");
            summary.setActiveGroups(groupService.getAllGroups().stream().limit(10).toList());
        }

        return summary;
    }
}