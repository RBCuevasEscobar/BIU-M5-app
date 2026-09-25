package mx.iqenglish.tutoring.exception;

import org.springframework.http.HttpStatus;

public class ScheduleConflictException extends BusinessException {
    public ScheduleConflictException(String message) {
        super("SCHEDULE_CONFLICT", message, HttpStatus.CONFLICT);
    }
}
