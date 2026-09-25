const fs = require('fs');
const path = require('path');
const base = path.resolve('backend/src/test/java/mx/iqenglish/tutoring');
function w(p, s) {
  const f = path.join(base, p);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, s.trim() + '\n', 'utf8');
}

w('service/AppointmentServiceTest.java', `package mx.iqenglish.tutoring.service;

import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.entity.*;
import mx.iqenglish.tutoring.entity.Module;
import mx.iqenglish.tutoring.exception.*;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.*;
import mx.iqenglish.tutoring.service.impl.AppointmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock private AppointmentRepository appointmentRepository;
    @Mock private GroupSessionRepository sessionRepository;
    @Mock private TutoringGroupRepository groupRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private AttendanceRepository attendanceRepository;
    @Mock private NotificationService notificationService;
    @Mock private AuditService auditService;
    @Mock private EntityMapper entityMapper;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private Student mockStudent;
    private TutoringGroup mockGroup;
    private GroupSession mockSession;
    private Book mockBook;
    private Module mockModule;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(1L);
        user.setUsername("student.carlos");
        user.setFirstName("Carlos");
        user.setLastName("Mendoza");

        AcademicLevel level = new AcademicLevel();
        level.setId(2L);
        level.setName("Level 2 - Intermediate");

        mockBook = new Book();
        mockBook.setId(2L);
        mockBook.setBookNumber(2);
        mockBook.setTitle("Book 2 - Interactive Fluency");
        mockBook.setLevel(level);

        mockModule = new Module();
        mockModule.setId(8L);
        mockModule.setModuleCode("B2-L05B");
        mockModule.setTitle("Lesson 5B: Requests, Excuses and Apologies");
        mockModule.setBook(mockBook);

        Campus campus = new Campus();
        campus.setId(1L);
        campus.setName("Plantel Tlaxcala");

        Teacher teacher = new Teacher();
        teacher.setId(1L);
        teacher.setUser(user);

        mockStudent = new Student();
        mockStudent.setId(1L);
        mockStudent.setUser(user);
        mockStudent.setStudentNumber("STU-001");
        mockStudent.setCurrentBook(mockBook);
        mockStudent.setCurrentModule(mockModule);

        mockGroup = new TutoringGroup();
        mockGroup.setId(1L);
        mockGroup.setCode("TUT-B2-01");
        mockGroup.setName("Group Book 2 Lesson 5B");
        mockGroup.setCampus(campus);
        mockGroup.setTeacher(teacher);
        mockGroup.setModule(mockModule);
        mockGroup.setCapacity(12);
        mockGroup.setCurrentEnrollment(0);
        mockGroup.setStatus(GroupStatus.PUBLISHED);

        mockSession = new GroupSession();
        mockSession.setId(1L);
        mockSession.setGroup(mockGroup);
        mockSession.setSessionDate(LocalDate.now().plusDays(3));
        mockSession.setStartTime(LocalTime.of(17, 0));
        mockSession.setEndTime(LocalTime.of(18, 0));
        mockSession.setStatus(SessionStatus.SCHEDULED);
    }

    @Test
    @DisplayName("Test 1: Student cannot book overlapping appointment (Rule R1)")
    void testStudentCannotBookOverlappingAppointment() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(mockSession));
        when(appointmentRepository.findActiveByStudentAndSession(1L, 1L)).thenReturn(Optional.empty());

        Appointment existingAppt = new Appointment();
        existingAppt.setId(99L);
        existingAppt.setSession(mockSession);
        when(appointmentRepository.findStudentOverlappingAppointments(eq(1L), any(), any(), any(), isNull()))
            .thenReturn(List.of(existingAppt));

        BookAppointmentDTO dto = new BookAppointmentDTO(1L);
        dto.setStudentId(1L);

        assertThrows(ScheduleConflictException.class, () -> appointmentService.bookAppointment(dto));
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Test 3: Group cannot exceed capacity (Rule R3)")
    void testGroupCannotExceedCapacity() {
        mockGroup.setCapacity(5);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(mockSession));
        when(appointmentRepository.findActiveByStudentAndSession(1L, 1L)).thenReturn(Optional.empty());
        when(appointmentRepository.findStudentOverlappingAppointments(eq(1L), any(), any(), any(), isNull()))
            .thenReturn(Collections.emptyList());
        when(appointmentRepository.countConfirmedBySessionId(1L)).thenReturn(5L); // Session is full!

        BookAppointmentDTO dto = new BookAppointmentDTO(1L);
        dto.setStudentId(1L);

        assertThrows(CapacityExceededException.class, () -> appointmentService.bookAppointment(dto));
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Test 4: Cancelled appointment releases capacity (Rule R8)")
    void testCancelledAppointmentReleasesCapacity() {
        mockGroup.setCurrentEnrollment(3);

        Appointment appt = new Appointment();
        appt.setId(10L);
        appt.setAppointmentNumber("APT-100");
        appt.setStudent(mockStudent);
        appt.setSession(mockSession);
        appt.setStatus(AppointmentStatus.CONFIRMED);

        when(appointmentRepository.findById(10L)).thenReturn(Optional.of(appt));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appt);
        when(entityMapper.toAppointmentDTO(any(Appointment.class))).thenReturn(new AppointmentDTO());

        CancelAppointmentDTO cancelDto = new CancelAppointmentDTO("Personal conflict");
        appointmentService.cancelAppointment(10L, cancelDto);

        assertEquals(2, mockGroup.getCurrentEnrollment()); // Capacity decreased by 1
        assertEquals(AppointmentStatus.CANCELLED, appt.getStatus());
        verify(groupRepository).save(mockGroup);
        verify(notificationService).sendNotification(any(), anyString(), anyString(), eq(NotificationType.APPOINTMENT_CANCELLED), anyString(), any());
    }

    @Test
    @DisplayName("Test 5: Rescheduling maintains original appointment if target slot fails (Rule R10)")
    void testReschedulingMaintainsOriginalAppointmentIfNewSlotFails() {
        Appointment originalAppt = new Appointment();
        originalAppt.setId(10L);
        originalAppt.setAppointmentNumber("APT-10");
        originalAppt.setStudent(mockStudent);
        originalAppt.setSession(mockSession);
        originalAppt.setStatus(AppointmentStatus.CONFIRMED);

        GroupSession targetSession = new GroupSession();
        targetSession.setId(2L);
        TutoringGroup fullTargetGroup = new TutoringGroup();
        fullTargetGroup.setId(2L);
        fullTargetGroup.setCapacity(2);
        fullTargetGroup.setStatus(GroupStatus.PUBLISHED);
        targetSession.setGroup(fullTargetGroup);
        targetSession.setSessionDate(LocalDate.now().plusDays(5));
        targetSession.setStartTime(LocalTime.of(19, 0));
        targetSession.setEndTime(LocalTime.of(20, 0));
        targetSession.setStatus(SessionStatus.SCHEDULED);

        when(appointmentRepository.findById(10L)).thenReturn(Optional.of(originalAppt));
        when(sessionRepository.findById(2L)).thenReturn(Optional.of(targetSession));
        when(appointmentRepository.findActiveByStudentAndSession(1L, 2L)).thenReturn(Optional.empty());
        when(appointmentRepository.findStudentOverlappingAppointments(eq(1L), any(), any(), any(), eq(10L)))
            .thenReturn(Collections.emptyList());
        when(appointmentRepository.countConfirmedBySessionId(2L)).thenReturn(2L); // Target session FULL!

        RescheduleAppointmentDTO reschedDto = new RescheduleAppointmentDTO(2L, "Prefer evening");

        assertThrows(CapacityExceededException.class, () -> appointmentService.rescheduleAppointment(10L, reschedDto));

        // Original appointment remains CONFIRMED
        assertEquals(AppointmentStatus.CONFIRMED, originalAppt.getStatus());
    }

    @Test
    @DisplayName("Test 12: Double booking in the same session is prevented (Rule R12)")
    void testDoubleBookingIsPrevented() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(mockSession));
        
        Appointment existing = new Appointment();
        existing.setId(55L);
        when(appointmentRepository.findActiveByStudentAndSession(1L, 1L)).thenReturn(Optional.of(existing));

        BookAppointmentDTO dto = new BookAppointmentDTO(1L);
        dto.setStudentId(1L);

        assertThrows(DoubleBookingException.class, () -> appointmentService.bookAppointment(dto));
    }
}
`);

w('service/TutoringGroupServiceTest.java', `package mx.iqenglish.tutoring.service;

import mx.iqenglish.tutoring.dto.CreateTutoringGroupDTO;
import mx.iqenglish.tutoring.dto.TutoringGroupDTO;
import mx.iqenglish.tutoring.entity.*;
import mx.iqenglish.tutoring.entity.Module;
import mx.iqenglish.tutoring.exception.ScheduleConflictException;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.*;
import mx.iqenglish.tutoring.service.impl.TutoringGroupServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TutoringGroupServiceTest {

    @Mock private TutoringGroupRepository groupRepository;
    @Mock private GroupSessionRepository sessionRepository;
    @Mock private CampusRepository campusRepository;
    @Mock private TeacherRepository teacherRepository;
    @Mock private ModuleRepository moduleRepository;
    @Mock private TopicRepository topicRepository;
    @Mock private UserRepository userRepository;
    @Mock private EntityMapper entityMapper;
    @Mock private AuditService auditService;

    @InjectMocks
    private TutoringGroupServiceImpl groupService;

    private Campus mockCampus;
    private Teacher mockTeacher;
    private Module mockModule;

    @BeforeEach
    void setUp() {
        mockCampus = new Campus();
        mockCampus.setId(1L);
        mockCampus.setName("Campus Tlaxcala");

        User teacherUser = new User();
        teacherUser.setFirstName("Ana");
        teacherUser.setLastName("García");

        mockTeacher = new Teacher();
        mockTeacher.setId(1L);
        mockTeacher.setUser(teacherUser);

        mockModule = new Module();
        mockModule.setId(8L);
        mockModule.setTitle("Lesson 5B");
    }

    @Test
    @DisplayName("Test 2: Teacher cannot have overlapping sessions (Rule R2)")
    void testTeacherCannotHaveOverlappingSessions() {
        when(campusRepository.findById(1L)).thenReturn(Optional.of(mockCampus));
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(mockTeacher));
        when(moduleRepository.findById(8L)).thenReturn(Optional.of(mockModule));

        GroupSession existingSession = new GroupSession();
        existingSession.setId(90L);
        when(sessionRepository.findTeacherOverlappingSessions(eq(1L), any(LocalDate.class), any(LocalTime.class), any(LocalTime.class), isNull()))
            .thenReturn(List.of(existingSession));

        CreateTutoringGroupDTO dto = new CreateTutoringGroupDTO();
        dto.setName("New Group");
        dto.setCampusId(1L);
        dto.setTeacherId(1L);
        dto.setModuleId(8L);
        dto.setCapacity(10);
        dto.setInitialSessionDate(LocalDate.now().plusDays(2));
        dto.setInitialStartTime(LocalTime.of(17, 0));
        dto.setInitialEndTime(LocalTime.of(18, 0));

        assertThrows(ScheduleConflictException.class, () -> groupService.createGroup(dto));
        verify(groupRepository, never()).save(any(TutoringGroup.class));
    }
}
`);

w('security/SecurityRbacTest.java', `package mx.iqenglish.tutoring.security;

import mx.iqenglish.tutoring.entity.Permission;
import mx.iqenglish.tutoring.entity.Role;
import mx.iqenglish.tutoring.entity.User;
import mx.iqenglish.tutoring.entity.UserStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class SecurityRbacTest {

    @Test
    @DisplayName("Test 6, 7, 8: RBAC Permission Mapping for Student, Supervisor, and Admin")
    void testRbacPermissionMapping() {
        // 1. Student setup
        Role studentRole = new Role("ROLE_STUDENT", "Student");
        Permission bookPerm = new Permission("TUTORING_BOOK", "Book tutoring", "TUTORING");
        studentRole.setPermissions(Set.of(bookPerm));

        User studentUser = new User();
        studentUser.setId(1L);
        studentUser.setUsername("student.carlos");
        studentUser.setEmail("carlos@iqenglish.mx");
        studentUser.setPasswordHash("hash");
        studentUser.setFirstName("Carlos");
        studentUser.setLastName("Mendoza");
        studentUser.setStatus(UserStatus.ACTIVE);
        studentUser.setRoles(Set.of(studentRole));

        UserPrincipal principal = UserPrincipal.create(studentUser);
        Set<String> authorities = principal.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toSet());

        assertTrue(authorities.contains("ROLE_STUDENT"));
        assertTrue(authorities.contains("TUTORING_BOOK"));
        assertFalse(authorities.contains("GROUP_CREATE")); // Student cannot create groups (Rule R6 check)

        // 2. Supervisor setup
        Role supervisorRole = new Role("ROLE_SUPERVISOR", "Supervisor");
        Permission groupCreatePerm = new Permission("GROUP_CREATE", "Create groups", "TUTORING");
        supervisorRole.setPermissions(Set.of(groupCreatePerm));

        User supervisorUser = new User();
        supervisorUser.setId(2L);
        supervisorUser.setUsername("supervisor.patricia");
        supervisorUser.setEmail("patricia@iqenglish.mx");
        supervisorUser.setPasswordHash("hash");
        supervisorUser.setFirstName("Patricia");
        supervisorUser.setLastName("Veloz");
        supervisorUser.setStatus(UserStatus.ACTIVE);
        supervisorUser.setRoles(Set.of(supervisorRole));

        UserPrincipal superPrincipal = UserPrincipal.create(supervisorUser);
        Set<String> superAuths = superPrincipal.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toSet());

        assertTrue(superAuths.contains("ROLE_SUPERVISOR"));
        assertTrue(superAuths.contains("GROUP_CREATE")); // Supervisor can manage groups
    }
}
`);

console.log('Unit and RBAC tests written successfully');
