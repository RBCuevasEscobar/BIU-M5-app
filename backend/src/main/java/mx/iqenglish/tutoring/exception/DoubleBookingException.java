package mx.iqenglish.tutoring.exception;

import org.springframework.http.HttpStatus;

public class DoubleBookingException extends BusinessException {
    public DoubleBookingException(String message) {
        super("DOUBLE_BOOKING_NOT_ALLOWED", message, HttpStatus.CONFLICT);
    }
}
