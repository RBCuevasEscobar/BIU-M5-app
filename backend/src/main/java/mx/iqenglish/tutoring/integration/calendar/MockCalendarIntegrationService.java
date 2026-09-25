package mx.iqenglish.tutoring.integration.calendar;

import mx.iqenglish.tutoring.entity.Appointment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.integrations.google-calendar.enabled", havingValue = "false", matchIfMissing = true)
public class MockCalendarIntegrationService implements CalendarIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(MockCalendarIntegrationService.class);

    @Override
    public CalendarEventDTO createEvent(Appointment appt) {
        String eventId = "cal-evt-" + UUID.randomUUID().toString();
        logger.info("[MOCK CALENDAR] Created Calendar event {} for appointment {}", eventId, appt.getAppointmentNumber());
        
        CalendarEventDTO dto = new CalendarEventDTO();
        dto.setEventId(eventId);
        dto.setTitle("IQ English Tutoring: " + appt.getSession().getGroup().getName());
        dto.setDescription("Academic tutoring session with teacher " + appt.getSession().getGroup().getTeacher().getUser().getFullName());
        dto.setLocation(appt.getSession().getRoomOrLink());
        dto.setStartDateTime(LocalDateTime.of(appt.getSession().getSessionDate(), appt.getSession().getStartTime()));
        dto.setEndDateTime(LocalDateTime.of(appt.getSession().getSessionDate(), appt.getSession().getEndTime()));
        dto.setStudentEmail(appt.getStudent().getUser().getEmail());
        dto.setTeacherEmail(appt.getSession().getGroup().getTeacher().getUser().getEmail());
        dto.setHtmlLink("https://calendar.google.com/calendar/event?eid=" + eventId);
        return dto;
    }

    @Override
    public CalendarEventDTO updateEvent(String eventId, Appointment appt) {
        logger.info("[MOCK CALENDAR] Updated Calendar event {} for rescheduled appointment {}", eventId, appt.getAppointmentNumber());
        return createEvent(appt);
    }

    @Override
    public void deleteEvent(String eventId) {
        logger.info("[MOCK CALENDAR] Deleted Calendar event {}", eventId);
    }
}
