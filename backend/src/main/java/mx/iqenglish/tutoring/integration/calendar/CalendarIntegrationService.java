package mx.iqenglish.tutoring.integration.calendar;

import mx.iqenglish.tutoring.entity.Appointment;

public interface CalendarIntegrationService {
    CalendarEventDTO createEvent(Appointment appointment);
    CalendarEventDTO updateEvent(String eventId, Appointment appointment);
    void deleteEvent(String eventId);
}
