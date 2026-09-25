package mx.iqenglish.tutoring.service;

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
