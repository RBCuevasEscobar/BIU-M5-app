package mx.iqenglish.tutoring.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BusinessException {
    public ResourceNotFoundException(String entityName, Object id) {
        super("RESOURCE_NOT_FOUND", entityName + " with ID '" + id + "' was not found.", HttpStatus.NOT_FOUND);
    }
    public ResourceNotFoundException(String message) {
        super("RESOURCE_NOT_FOUND", message, HttpStatus.NOT_FOUND);
    }
}
