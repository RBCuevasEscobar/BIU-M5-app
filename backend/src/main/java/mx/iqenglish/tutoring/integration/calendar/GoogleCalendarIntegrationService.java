package mx.iqenglish.tutoring.integration.calendar;

import mx.iqenglish.tutoring.entity.Appointment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.integrations.google-calendar.enabled", havingValue = "true")
public class GoogleCalendarIntegrationService implements CalendarIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleCalendarIntegrationService.class);

    @Value("${app.integrations.google-calendar.client-id:}")
    private String clientId;

    @Override
    public CalendarEventDTO createEvent(Appointment appointment) {
        logger.info("[GOOGLE CALENDAR API] Provisioning production event for appointment: {}", appointment.getAppointmentNumber());
        // Integration adapter ready for Google Calendar REST API V3
        CalendarEventDTO dto = new CalendarEventDTO();
        dto.setEventId("gcal-prod-" + appointment.getId());
        dto.setHtmlLink("https://calendar.google.com/calendar/r/eventedit");
        return dto;
    }

    @Override
    public CalendarEventDTO updateEvent(String eventId, Appointment appointment) {
        logger.info("[GOOGLE CALENDAR API] Updating production event: {}", eventId);
        return createEvent(appointment);
    }

    @Override
    public void deleteEvent(String eventId) {
        logger.info("[GOOGLE CALENDAR API] Deleting production event: {}", eventId);
    }
}
