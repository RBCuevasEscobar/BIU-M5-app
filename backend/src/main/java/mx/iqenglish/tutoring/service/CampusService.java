package mx.iqenglish.tutoring.service;
import mx.iqenglish.tutoring.dto.CampusDTO;
import java.util.List;
public interface CampusService {
    List<CampusDTO> getAllActiveCampuses();
    CampusDTO getCampusById(Long id);
}
