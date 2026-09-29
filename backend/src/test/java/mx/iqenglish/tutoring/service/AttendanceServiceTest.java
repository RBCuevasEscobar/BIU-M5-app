package mx.iqenglish.tutoring.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import mx.iqenglish.tutoring.dto.AttendanceDTO;
import mx.iqenglish.tutoring.dto.RecordAttendanceDTO;
import mx.iqenglish.tutoring.entity.Appointment;
import mx.iqenglish.tutoring.entity.AppointmentStatus;
import mx.iqenglish.tutoring.entity.Attendance;
import mx.iqenglish.tutoring.entity.AttendanceStatus;
import mx.iqenglish.tutoring.entity.Campus;
import mx.iqenglish.tutoring.entity.GroupSession;
import mx.iqenglish.tutoring.entity.GroupStatus;
import mx.iqenglish.tutoring.entity.Module;
import mx.iqenglish.tutoring.entity.SessionStatus;
import mx.iqenglish.tutoring.entity.Student;
import mx.iqenglish.tutoring.entity.Teacher;
import mx.iqenglish.tutoring.entity.TutoringGroup;
import mx.iqenglish.tutoring.entity.User;
import mx.iqenglish.tutoring.exception.BusinessException;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.AppointmentRepository;
import mx.iqenglish.tutoring.repository.AttendanceRepository;
import mx.iqenglish.tutoring.repository.GroupSessionRepository;
import mx.iqenglish.tutoring.repository.TeacherRepository;
import mx.iqenglish.tutoring.repository.TutoringGroupRepository;
import mx.iqenglish.tutoring.service.impl.AttendanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AttendanceServiceTest {

    @Mock private AttendanceRepository attendanceRepository;
    @Mock private AppointmentRepository appointmentRepository;
    @Mock private TeacherRepository teacherRepository;
    @Mock private GroupSessionRepository sessionRepository;
    @Mock private TutoringGroupRepository groupRepository;
    @Mock private AcademicProgressService progressService;
    @Mock private NotificationService notificationService;
    @Mock private AuditService auditService;
    @Mock private EntityMapper entityMapper;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    private Appointment mockAppt;
    private GroupSession mockSession;
    private TutoringGroup mockGroup;
    private Student mockStudent;
    private Teacher mockTeacher;

    @BeforeEach
    void setUp() {
        User teacherUser = new User();
        teacherUser.setId(4L);
        teacherUser.setUsername("teacher.ana");
        teacherUser.setFirstName("Ana");
        teacherUser.setLastName("Garcia");

        User studentUser = new User();
        studentUser.setId(1L);
        studentUser.setUsername("student.carlos");
        studentUser.setFirstName("Carlos");
        studentUser.setLastName("Mendoza");

        mockTeacher = new Teacher();
        mockTeacher.setId(1L);
        mockTeacher.setUser(teacherUser);

        mockStudent = new Student();
        mockStudent.setId(1L);
        mockStudent.setUser(studentUser);

        Campus campus = new Campus();
        campus.setId(1L);
        campus.setName("Plantel Tlaxcala");

        Module module = new Module();
        module.setId(8L);
        module.setTitle("Lesson 5B");

        mockGroup = new TutoringGroup();
        mockGroup.setId(1L);
        mockGroup.setName("Group Book 2");
        mockGroup.setCampus(campus);
        mockGroup.setTeacher(mockTeacher);
        mockGroup.setModule(module);
        mockGroup.setStatus(GroupStatus.PUBLISHED);

        mockSession = new GroupSession();
        mockSession.setId(1L);
        mockSession.setGroup(mockGroup);
        mockSession.setSessionDate(LocalDate.now());
        mockSession.setStartTime(LocalTime.of(17, 0));
        mockSession.setEndTime(LocalTime.of(18, 0));
        mockSession.setStatus(SessionStatus.SCHEDULED);

        mockAppt = new Appointment();
        mockAppt.setId(1L);
        mockAppt.setStudent(mockStudent);
        mockAppt.setSession(mockSession);
        mockAppt.setStatus(AppointmentStatus.CONFIRMED);

        mx.iqenglish.tutoring.security.UserPrincipal principal = mx.iqenglish.tutoring.security.UserPrincipal.create(teacherUser);
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(mockAppt));
        when(teacherRepository.findByUserId(4L)).thenReturn(Optional.of(mockTeacher));
        when(attendanceRepository.findByAppointmentId(1L)).thenReturn(Optional.empty());
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(entityMapper.toAttendanceDTO(any(Attendance.class))).thenReturn(new AttendanceDTO());
    }

    @Test
    @DisplayName("Record Attendance - ABSENT with grade throws BusinessException (GRADE_NOT_ALLOWED)")
    void recordAttendance_AbsentWithGrade_ThrowsBusinessException() {
        RecordAttendanceDTO dto = new RecordAttendanceDTO();
        dto.setAppointmentId(1L);
        dto.setStatus("ABSENT");
        dto.setGrade(new BigDecimal("85.00")); // Grade not allowed!

        BusinessException ex = assertThrows(BusinessException.class, () -> attendanceService.recordAttendance(dto));
        assertEquals("GRADE_NOT_ALLOWED", ex.getCode());
        verify(attendanceRepository, never()).save(any(Attendance.class));
    }

    @Test
    @DisplayName("Record Attendance - EXCUSED with grade throws BusinessException (GRADE_NOT_ALLOWED)")
    void recordAttendance_ExcusedWithGrade_ThrowsBusinessException() {
        RecordAttendanceDTO dto = new RecordAttendanceDTO();
        dto.setAppointmentId(1L);
        dto.setStatus("EXCUSED");
        dto.setGrade(new BigDecimal("70.00")); // Grade not allowed!

        BusinessException ex = assertThrows(BusinessException.class, () -> attendanceService.recordAttendance(dto));
        assertEquals("GRADE_NOT_ALLOWED", ex.getCode());
        verify(attendanceRepository, never()).save(any(Attendance.class));
    }

    @Test
    @DisplayName("Record Attendance - PRESENT with valid grade saves and auto-closes group when all attendances recorded")
    void recordAttendance_PresentValidGrade_AutoClosesGroup() {
        RecordAttendanceDTO dto = new RecordAttendanceDTO();
        dto.setAppointmentId(1L);
        dto.setStatus("PRESENT");
        dto.setGrade(new BigDecimal("95.00"));

        when(appointmentRepository.findBySessionId(1L)).thenReturn(List.of(mockAppt));
        when(attendanceRepository.findBySessionId(1L)).thenReturn(List.of(new Attendance()));

        attendanceService.recordAttendance(dto);

        assertEquals(SessionStatus.COMPLETED, mockSession.getStatus());
        assertEquals(GroupStatus.COMPLETED, mockGroup.getStatus());
        verify(sessionRepository).save(mockSession);
        verify(groupRepository).save(mockGroup);
    }
}
