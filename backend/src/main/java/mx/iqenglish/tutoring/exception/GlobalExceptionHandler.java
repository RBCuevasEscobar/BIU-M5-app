package mx.iqenglish.tutoring.exception;

import jakarta.servlet.http.HttpServletRequest;
import mx.iqenglish.tutoring.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.UUID;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        logger.warn("Business rule violation [{}]: {} - Path: {}", ex.getCode(), ex.getMessage(), request.getRequestURI());
        ErrorResponse err = new ErrorResponse(
            ex.getStatus().value(),
            ex.getCode(),
            ex.getMessage(),
            request.getRequestURI(),
            traceId
        );
        return new ResponseEntity<>(err, ex.getStatus());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        String errorMessages = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        
        ErrorResponse err = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "INVALID_INPUT",
            "Validation failed: " + errorMessages,
            request.getRequestURI(),
            traceId
        );
        return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        logger.warn("Access denied on path {}: {}", request.getRequestURI(), ex.getMessage());
        ErrorResponse err = new ErrorResponse(
            HttpStatus.FORBIDDEN.value(),
            "ACCESS_DENIED",
            "You do not have the required permission to perform this operation.",
            request.getRequestURI(),
            traceId
        );
        return new ResponseEntity<>(err, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        logger.warn("Authentication failed [BAD_CREDENTIALS] on path {}: {}", request.getRequestURI(), ex.getMessage());
        ErrorResponse err = new ErrorResponse(
            HttpStatus.UNAUTHORIZED.value(),
            "BAD_CREDENTIALS",
            "Invalid credentials. Please verify your username and password.",
            request.getRequestURI(),
            traceId
        );
        return new ResponseEntity<>(err, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        logger.warn("Authentication error [AUTHENTICATION_REQUIRED] on path {}: {}", request.getRequestURI(), ex.getMessage());
        ErrorResponse err = new ErrorResponse(
            HttpStatus.UNAUTHORIZED.value(),
            "AUTHENTICATION_REQUIRED",
            "Full authentication is required to access this resource.",
            request.getRequestURI(),
            traceId
        );
        return new ResponseEntity<>(err, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        logger.error("Unhandled server exception [traceId: {}] on {}: {}", traceId, request.getRequestURI(), ex.getMessage(), ex);
        ErrorResponse err = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "INTERNAL_SERVER_ERROR",
            "An unexpected error occurred while processing your request. Please try again or contact support with trace ID: " + traceId,
            request.getRequestURI(),
            traceId
        );
        return new ResponseEntity<>(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
