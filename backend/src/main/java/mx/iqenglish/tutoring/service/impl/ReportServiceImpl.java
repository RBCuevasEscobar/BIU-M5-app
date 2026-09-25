package mx.iqenglish.tutoring.service.impl;

import mx.iqenglish.tutoring.dto.DashboardSummaryDTO;
import mx.iqenglish.tutoring.dto.StudentDTO;
import mx.iqenglish.tutoring.dto.TeacherDTO;
import mx.iqenglish.tutoring.entity.GroupStatus;
import mx.iqenglish.tutoring.entity.TutoringGroup;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.*;
import mx.iqenglish.tutoring.security.SecurityUtils;
import mx.iqenglish.tutoring.service.AppointmentService;
import mx.iqenglish.tutoring.service.NotificationService;
import mx.iqenglish.tutoring.service.ReportService;
import mx.iqenglish.tutoring.service.TutoringGroupService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

    private final TutoringGroupRepository groupRepository;
    private final AppointmentRepository appointmentRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final TutoringGroupService groupService;
    private final AppointmentService appointmentService;
    private final NotificationService notificationService;
    private final EntityMapper entityMapper;

    public ReportServiceImpl(TutoringGroupRepository groupRepository,
                             AppointmentRepository appointmentRepository,
                             StudentRepository studentRepository,
                             TeacherRepository teacherRepository,
                             TutoringGroupService groupService,
                             AppointmentService appointmentService,
                             NotificationService notificationService,
                             EntityMapper entityMapper) {
        this.groupRepository = groupRepository;
        this.appointmentRepository = appointmentRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
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
                summary.setUpcomingAppointments(appointmentService.getAppointmentsByStudent(s.getId()));
            });

            teacherRepository.findByUserId(userId).ifPresent(t -> {
                summary.setRole("TEACHER");
                summary.setUserFullName(t.getUser().getFullName());
                summary.setTeacherProfile(entityMapper.toTeacherDTO(t));
                summary.setActiveGroups(groupService.filterGroups(t.getCampus().getId(), null, t.getId(), null, GroupStatus.PUBLISHED));
            });
        }

        if (summary.getRole() == null) {
            summary.setRole("ADMIN_OR_SUPERVISOR");
            summary.setActiveGroups(groupService.getAllGroups().stream().limit(10).toList());
        }

        return summary;
    }
}
