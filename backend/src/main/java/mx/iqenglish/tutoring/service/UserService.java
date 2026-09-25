package mx.iqenglish.tutoring.service;
import mx.iqenglish.tutoring.dto.UserDTO;
import java.util.List;
public interface UserService {
    List<UserDTO> getAllUsers();
    UserDTO getUserById(Long id);
    UserDTO getUserByUsername(String username);
}
