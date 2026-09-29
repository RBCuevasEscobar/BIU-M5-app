package mx.iqenglish.tutoring.service;

import java.util.List;
import mx.iqenglish.tutoring.dto.AppointmentDTO;
import mx.iqenglish.tutoring.dto.BookAppointmentDTO;
import mx.iqenglish.tutoring.dto.CancelAppointmentDTO;
import mx.iqenglish.tutoring.dto.RescheduleAppointmentDTO;

public interface AppointmentService {
    AppointmentDTO bookAppointment(BookAppointmentDTO dto);
    AppointmentDTO cancelAppointment(Long appointmentId, CancelAppointmentDTO dto);
    AppointmentDTO rescheduleAppointment(Long appointmentId, RescheduleAppointmentDTO dto);
    List<AppointmentDTO> getMyAppointments();
    List<AppointmentDTO> getAppointmentsByStudent(Long studentId);
    List<AppointmentDTO> getAppointmentsBySession(Long sessionId);
    AppointmentDTO getAppointmentById(Long id);
}
