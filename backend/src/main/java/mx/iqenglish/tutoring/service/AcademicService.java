package mx.iqenglish.tutoring.service;
import mx.iqenglish.tutoring.dto.*;
import java.util.List;
public interface AcademicService {
    List<AcademicProgramDTO> getAllPrograms();
    List<AcademicLevelDTO> getLevelsByProgram(Long programId);
    List<BookDTO> getBooksByLevel(Long levelId);
    List<BookDTO> getAllBooks();
    List<ModuleDTO> getModulesByBook(Long bookId);
    List<TopicDTO> getTopicsByModule(Long moduleId);
    ModuleDTO getModuleById(Long id);
}
