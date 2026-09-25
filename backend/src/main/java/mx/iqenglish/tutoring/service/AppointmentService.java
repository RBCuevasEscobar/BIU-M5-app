package mx.iqenglish.tutoring.service;
import mx.iqenglish.tutoring.dto.*;
import java.util.List;
public interface AppointmentService {
    AppointmentDTO bookAppointment(BookAppointmentDTO dto);
    AppointmentDTO cancelAppointment(Long appointmentId, CancelAppointmentDTO dto);
    AppointmentDTO rescheduleAppointment(Long appointmentId, RescheduleAppointmentDTO dto);
    List<AppointmentDTO> getMyAppointments();
    List<AppointmentDTO> getAppointmentsByStudent(Long studentId);
    List<AppointmentDTO> getAppointmentsBySession(Long sessionId);
    AppointmentDTO getAppointmentById(Long id);
}
