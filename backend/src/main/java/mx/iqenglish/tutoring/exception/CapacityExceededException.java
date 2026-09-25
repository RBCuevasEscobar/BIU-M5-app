package mx.iqenglish.tutoring.exception;

import org.springframework.http.HttpStatus;

public class CapacityExceededException extends BusinessException {
    public CapacityExceededException(String message) {
        super("GROUP_CAPACITY_EXCEEDED", message, HttpStatus.CONFLICT);
    }
}
