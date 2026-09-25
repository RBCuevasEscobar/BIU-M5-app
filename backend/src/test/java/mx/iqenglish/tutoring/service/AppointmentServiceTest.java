package mx.iqenglish.tutoring.service;

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
