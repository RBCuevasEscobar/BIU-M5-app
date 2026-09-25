package mx.iqenglish.tutoring.dto;
import java.util.List;
public class DashboardSummaryDTO {
    private String role; private String userFullName; private StudentDTO studentProfile; private TeacherDTO teacherProfile; private List<AppointmentDTO> upcomingAppointments; private List<TutoringGroupDTO> activeGroups; private List<NotificationDTO> recentNotifications; private Long totalActiveGroups; private Long totalAppointmentsToday; private Double campusOccupancyRate; private Long unreadNotificationsCount;
    public DashboardSummaryDTO() {}
    public String getRole() { return role; } public void setRole(String s) { this.role = s; }
    public String getUserFullName() { return userFullName; } public void setUserFullName(String s) { this.userFullName = s; }
    public StudentDTO getStudentProfile() { return studentProfile; } public void setStudentProfile(StudentDTO s) { this.studentProfile = s; }
    public TeacherDTO getTeacherProfile() { return teacherProfile; } public void setTeacherProfile(TeacherDTO t) { this.teacherProfile = t; }
    public List<AppointmentDTO> getUpcomingAppointments() { return upcomingAppointments; } public void setUpcomingAppointments(List<AppointmentDTO> l) { this.upcomingAppointments = l; }
    public List<TutoringGroupDTO> getActiveGroups() { return activeGroups; } public void setActiveGroups(List<TutoringGroupDTO> l) { this.activeGroups = l; }
    public List<NotificationDTO> getRecentNotifications() { return recentNotifications; } public void setRecentNotifications(List<NotificationDTO> l) { this.recentNotifications = l; }
    public Long getTotalActiveGroups() { return totalActiveGroups; } public void setTotalActiveGroups(Long n) { this.totalActiveGroups = n; }
    public Long getTotalAppointmentsToday() { return totalAppointmentsToday; } public void setTotalAppointmentsToday(Long n) { this.totalAppointmentsToday = n; }
    public Double getCampusOccupancyRate() { return campusOccupancyRate; } public void setCampusOccupancyRate(Double d) { this.campusOccupancyRate = d; }
    public Long getUnreadNotificationsCount() { return unreadNotificationsCount; } public void setUnreadNotificationsCount(Long n) { this.unreadNotificationsCount = n; }
}
