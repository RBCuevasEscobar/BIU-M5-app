package mx.iqenglish.tutoring.service;
import mx.iqenglish.tutoring.dto.AttendanceDTO;
import mx.iqenglish.tutoring.dto.RecordAttendanceDTO;
import java.util.List;
public interface AttendanceService {
    AttendanceDTO recordAttendance(RecordAttendanceDTO dto);
    List<AttendanceDTO> getAttendanceBySession(Long sessionId);
    List<AttendanceDTO> getAttendanceByStudent(Long studentId);
}
