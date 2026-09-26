package mx.iqenglish.tutoring.service;

import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.entity.*;
import mx.iqenglish.tutoring.entity.Module;
import mx.iqenglish.tutoring.exception.BusinessException;
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
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
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
    private TutoringGroup mockGroup;

    @BeforeEach
    void setUp() {
        mockCampus = new Campus();
        mockCampus.setId(1L);
        mockCampus.setName("Campus Tlaxcala");

        User teacherUser = new User();
        teacherUser.setId(4L);
        teacherUser.setFirstName("Ana");
        teacherUser.setLastName("Garcia");
        teacherUser.setEmail("ana.garcia@iqenglish.mx");

        mockTeacher = new Teacher();
        mockTeacher.setId(1L);
        mockTeacher.setUser(teacherUser);

        Book mockBook = new Book();
        mockBook.setId(2L);
        mockBook.setBookNumber(2);
        mockBook.setTitle("Book 2 Elementary");

        mockModule = new Module();
        mockModule.setId(8L);
        mockModule.setModuleCode("MOD-05B");
        mockModule.setTitle("Lesson 5B");
        mockModule.setBook(mockBook);

        mockGroup = new TutoringGroup();
        mockGroup.setId(100L);
        mockGroup.setCode("TUT-B2-01");
        mockGroup.setName("Tutoring Book 2 - Lesson 5B");
        mockGroup.setCampus(mockCampus);
        mockGroup.setTeacher(mockTeacher);
        mockGroup.setModule(mockModule);
        mockGroup.setCapacity(12);
        mockGroup.setCurrentEnrollment(5);
        mockGroup.setStatus(GroupStatus.PUBLISHED);
        mockGroup.setModality(Modality.PRESENTIAL);
        mockGroup.setCreatedAt(LocalDateTime.now().minusDays(5));
        mockGroup.setSessions(new ArrayList<>());
    }

    @Test
    @DisplayName("Test 1: Teacher cannot have overlapping sessions (Rule R2)")
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

    @Test
    @DisplayName("Test 2: Update group successfully with valid data")
    void testUpdateGroupSuccess() {
        when(groupRepository.findById(100L)).thenReturn(Optional.of(mockGroup));
        when(campusRepository.findById(1L)).thenReturn(Optional.of(mockCampus));
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(mockTeacher));
        when(moduleRepository.findById(8L)).thenReturn(Optional.of(mockModule));
        when(groupRepository.save(any(TutoringGroup.class))).thenAnswer(inv -> inv.getArgument(0));

        TutoringGroupDTO expectedDTO = new TutoringGroupDTO();
        expectedDTO.setId(100L);
        expectedDTO.setName("Updated Group Name");
        expectedDTO.setCapacity(15);
        when(entityMapper.toTutoringGroupDTO(any(TutoringGroup.class))).thenReturn(expectedDTO);

        UpdateTutoringGroupDTO updateDTO = new UpdateTutoringGroupDTO();
        updateDTO.setName("Updated Group Name");
        updateDTO.setCampusId(1L);
        updateDTO.setTeacherId(1L);
        updateDTO.setModuleId(8L);
        updateDTO.setCapacity(15);
        updateDTO.setModality("PRESENTIAL");
        updateDTO.setStatus(GroupStatus.PUBLISHED);

        TutoringGroupDTO result = groupService.updateGroup(100L, updateDTO);
        assertNotNull(result);
        assertEquals("Updated Group Name", result.getName());
        assertEquals(15, result.getCapacity());

        verify(auditService).log(eq("GROUP_UPDATED"), eq("TUTORING_GROUP"), eq("100"), anyString());
    }

    @Test
    @DisplayName("Test 3: Update group rejects capacity below current enrollment")
    void testUpdateGroupCapacityBelowEnrollmentFails() {
        mockGroup.setCurrentEnrollment(8);
        when(groupRepository.findById(100L)).thenReturn(Optional.of(mockGroup));
        when(campusRepository.findById(1L)).thenReturn(Optional.of(mockCampus));
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(mockTeacher));
        when(moduleRepository.findById(8L)).thenReturn(Optional.of(mockModule));

        UpdateTutoringGroupDTO updateDTO = new UpdateTutoringGroupDTO();
        updateDTO.setName("Group with lower capacity");
        updateDTO.setCampusId(1L);
        updateDTO.setTeacherId(1L);
        updateDTO.setModuleId(8L);
        updateDTO.setCapacity(5); // Less than current enrollment (8)

        BusinessException ex = assertThrows(BusinessException.class, () -> groupService.updateGroup(100L, updateDTO));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("CAPACITY_BELOW_ENROLLMENT", ex.getCode());
        verify(groupRepository, never()).save(any(TutoringGroup.class));
    }

    @Test
    @DisplayName("Test 4: Delete group with historical enrollment performs logical deletion")
    void testDeleteGroupWithEnrollmentPerformsLogicalDeletion() {
        mockGroup.setCurrentEnrollment(3);
        GroupSession session = new GroupSession();
        session.setId(50L);
        session.setStatus(SessionStatus.SCHEDULED);
        mockGroup.getSessions().add(session);

        when(groupRepository.findById(100L)).thenReturn(Optional.of(mockGroup));
        when(groupRepository.save(any(TutoringGroup.class))).thenReturn(mockGroup);

        groupService.deleteGroup(100L);

        assertEquals(GroupStatus.CANCELLED, mockGroup.getStatus());
        assertEquals(SessionStatus.CANCELLED, session.getStatus());
        verify(groupRepository, never()).delete(any(TutoringGroup.class));
        verify(groupRepository).save(mockGroup);
        verify(auditService).log(eq("GROUP_DELETED"), eq("TUTORING_GROUP"), eq("100"), contains("Logically deleted"));
    }

    @Test
    @DisplayName("Test 5: Delete empty group performs physical deletion")
    void testDeleteEmptyGroupPerformsPhysicalDeletion() {
        mockGroup.setCurrentEnrollment(0);
        mockGroup.setSessions(new ArrayList<>());

        when(groupRepository.findById(100L)).thenReturn(Optional.of(mockGroup));

        groupService.deleteGroup(100L);

        verify(groupRepository).delete(mockGroup);
        verify(auditService).log(eq("GROUP_DELETED"), eq("TUTORING_GROUP"), eq("100"), contains("Physically deleted"));
    }

    @Test
    @DisplayName("Test 6: Generate group report calculates correct occupancy and totals")
    void testGenerateGroupReport() {
        TutoringGroup group1 = new TutoringGroup();
        group1.setId(1L);
        group1.setCode("GRP-01");
        group1.setName("Group 1");
        group1.setCampus(mockCampus);
        group1.setTeacher(mockTeacher);
        group1.setModule(mockModule);
        group1.setCapacity(10);
        group1.setCurrentEnrollment(6);
        group1.setStatus(GroupStatus.PUBLISHED);
        group1.setModality(Modality.PRESENTIAL);
        group1.setSessions(new ArrayList<>());

        when(groupRepository.filterGroups(null, null, null, null, null)).thenReturn(List.of(group1));

        GroupReportDTO report = groupService.generateGroupReport(null, null, null, null, null);

        assertNotNull(report);
        assertEquals(1, report.getTotalGroups());
        assertEquals(10, report.getTotalCapacity());
        assertEquals(6, report.getTotalEnrolled());
        assertEquals(4, report.getTotalAvailableSeats());
        assertEquals(60.0, report.getAverageOccupancyPercentage());
        assertEquals(1, report.getPublishedCount());
        assertEquals(1, report.getItems().size());
        assertEquals("GRP-01", report.getItems().get(0).getCode());
    }

    @Test
    @DisplayName("Test 7: Export group report to CSV generates valid header and data rows")
    void testExportGroupReportCsv() {
        when(groupRepository.filterGroups(null, null, null, null, null)).thenReturn(List.of(mockGroup));

        byte[] csvBytes = groupService.exportGroupReportCsv(null, null, null, null, null);
        assertNotNull(csvBytes);
        String csv = new String(csvBytes);
        assertTrue(csv.startsWith("ID,Codigo,Nombre,Plantel,Docente,Email Docente,Libro,Modulo,Tema,Capacidad,Inscritos,Cupos Disponibles,Ocupacion (%),Estado,Modalidad,Sesiones,Fecha Creacion"));
        assertTrue(csv.contains("TUT-B2-01"));
        assertTrue(csv.contains("Campus Tlaxcala"));
    }
}
