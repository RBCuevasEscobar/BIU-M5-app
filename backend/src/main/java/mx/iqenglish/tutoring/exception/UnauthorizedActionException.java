package mx.iqenglish.tutoring.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedActionException extends BusinessException {
    public UnauthorizedActionException(String message) {
        super("UNAUTHORIZED_ACTION", message, HttpStatus.FORBIDDEN);
    }
}
