package mx.iqenglish.tutoring.service;
import mx.iqenglish.tutoring.dto.AuthRequest;
import mx.iqenglish.tutoring.dto.AuthResponse;
import mx.iqenglish.tutoring.dto.UserDTO;
public interface AuthService {
    AuthResponse login(AuthRequest request);
    UserDTO getCurrentUser();
}
