package mx.iqenglish.tutoring.service;

import java.time.LocalDate;
import java.util.List;
import mx.iqenglish.tutoring.dto.CreateSessionDTO;
import mx.iqenglish.tutoring.dto.GroupSessionDTO;

public interface GroupSessionService {
    List<GroupSessionDTO> searchAvailableSessions(Long campusId, Long moduleId, Long teacherId, Long bookId, LocalDate dateFrom, LocalDate dateTo);
    GroupSessionDTO getSessionById(Long id);
    GroupSessionDTO createSession(CreateSessionDTO dto);
    void cancelSession(Long sessionId, String reason);
}
