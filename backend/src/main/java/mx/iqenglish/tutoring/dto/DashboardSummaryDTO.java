package mx.iqenglish.tutoring.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryDTO {
    private String role;
    private String userFullName;
    private StudentDTO studentProfile;
    private TeacherDTO teacherProfile;
    private List<AppointmentDTO> upcomingAppointments;
    private List<TutoringGroupDTO> activeGroups;
    private List<GroupSessionDTO> teacherSessions;
    private List<NotificationDTO> recentNotifications;
    private Long totalActiveGroups;
    private Long totalAppointmentsToday;
    private Double campusOccupancyRate;
    private Long unreadNotificationsCount;

    // Student Progress Context (Requirements 1, 2, 5, 6)
    private Integer currentModuleAttendanceCount;
    private Integer currentModuleTotalRequired;
    private BigDecimal currentModuleGrade;
    private List<StudentModuleItemDTO> studentCurriculumProgress;
    private SuggestedTutoringDTO suggestedTutoring;

    public DashboardSummaryDTO() {}

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }
    public StudentDTO getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentDTO studentProfile) { this.studentProfile = studentProfile; }
    public TeacherDTO getTeacherProfile() { return teacherProfile; }
    public void setTeacherProfile(TeacherDTO teacherProfile) { this.teacherProfile = teacherProfile; }
    public List<AppointmentDTO> getUpcomingAppointments() { return upcomingAppointments; }
    public void setUpcomingAppointments(List<AppointmentDTO> upcomingAppointments) { this.upcomingAppointments = upcomingAppointments; }
    public List<TutoringGroupDTO> getActiveGroups() { return activeGroups; }
    public void setActiveGroups(List<TutoringGroupDTO> activeGroups) { this.activeGroups = activeGroups; }
    public List<GroupSessionDTO> getTeacherSessions() { return teacherSessions; }
    public void setTeacherSessions(List<GroupSessionDTO> teacherSessions) { this.teacherSessions = teacherSessions; }
    public List<NotificationDTO> getRecentNotifications() { return recentNotifications; }
    public void setRecentNotifications(List<NotificationDTO> recentNotifications) { this.recentNotifications = recentNotifications; }
    public Long getTotalActiveGroups() { return totalActiveGroups; }
    public void setTotalActiveGroups(Long totalActiveGroups) { this.totalActiveGroups = totalActiveGroups; }
    public Long getTotalAppointmentsToday() { return totalAppointmentsToday; }
    public void setTotalAppointmentsToday(Long totalAppointmentsToday) { this.totalAppointmentsToday = totalAppointmentsToday; }
    public Double getCampusOccupancyRate() { return campusOccupancyRate; }
    public void setCampusOccupancyRate(Double campusOccupancyRate) { this.campusOccupancyRate = campusOccupancyRate; }
    public Long getUnreadNotificationsCount() { return unreadNotificationsCount; }
    public void setUnreadNotificationsCount(Long unreadNotificationsCount) { this.unreadNotificationsCount = unreadNotificationsCount; }

    public Integer getCurrentModuleAttendanceCount() { return currentModuleAttendanceCount; }
    public void setCurrentModuleAttendanceCount(Integer currentModuleAttendanceCount) { this.currentModuleAttendanceCount = currentModuleAttendanceCount; }
    public Integer getCurrentModuleTotalRequired() { return currentModuleTotalRequired; }
    public void setCurrentModuleTotalRequired(Integer currentModuleTotalRequired) { this.currentModuleTotalRequired = currentModuleTotalRequired; }
    public BigDecimal getCurrentModuleGrade() { return currentModuleGrade; }
    public void setCurrentModuleGrade(BigDecimal currentModuleGrade) { this.currentModuleGrade = currentModuleGrade; }
    public List<StudentModuleItemDTO> getStudentCurriculumProgress() { return studentCurriculumProgress; }
    public void setStudentCurriculumProgress(List<StudentModuleItemDTO> studentCurriculumProgress) { this.studentCurriculumProgress = studentCurriculumProgress; }
    public SuggestedTutoringDTO getSuggestedTutoring() { return suggestedTutoring; }
    public void setSuggestedTutoring(SuggestedTutoringDTO suggestedTutoring) { this.suggestedTutoring = suggestedTutoring; }
}