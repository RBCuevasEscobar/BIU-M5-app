package mx.iqenglish.tutoring.exception;

import org.springframework.http.HttpStatus;

public class AcademicLevelMismatchException extends BusinessException {
    public AcademicLevelMismatchException(String message) {
        super("ACADEMIC_LEVEL_MISMATCH", message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
