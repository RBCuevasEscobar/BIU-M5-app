package mx.iqenglish.tutoring.service;

import java.util.List;
import mx.iqenglish.tutoring.dto.AcademicLevelDTO;
import mx.iqenglish.tutoring.dto.AcademicProgramDTO;
import mx.iqenglish.tutoring.dto.BookDTO;
import mx.iqenglish.tutoring.dto.ModuleDTO;
import mx.iqenglish.tutoring.dto.TopicDTO;

public interface AcademicService {
    List<AcademicProgramDTO> getAllPrograms();
    List<AcademicLevelDTO> getLevelsByProgram(Long programId);
    List<BookDTO> getBooksByLevel(Long levelId);
    List<BookDTO> getAllBooks();
    List<ModuleDTO> getAllModules();
    List<ModuleDTO> getModulesByBook(Long bookId);
    List<TopicDTO> getTopicsByModule(Long moduleId);
    ModuleDTO getModuleById(Long id);
}
