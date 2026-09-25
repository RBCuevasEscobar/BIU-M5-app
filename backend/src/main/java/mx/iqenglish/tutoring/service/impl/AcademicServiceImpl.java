package mx.iqenglish.tutoring.service.impl;

import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.entity.*;
import mx.iqenglish.tutoring.entity.Module;
import mx.iqenglish.tutoring.exception.ResourceNotFoundException;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.*;
import mx.iqenglish.tutoring.service.AcademicService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AcademicServiceImpl implements AcademicService {

    private final AcademicProgramRepository programRepository;
    private final AcademicLevelRepository levelRepository;
    private final BookRepository bookRepository;
    private final ModuleRepository moduleRepository;
    private final TopicRepository topicRepository;
    private final EntityMapper entityMapper;

    public AcademicServiceImpl(AcademicProgramRepository programRepository,
                               AcademicLevelRepository levelRepository,
                               BookRepository bookRepository,
                               ModuleRepository moduleRepository,
                               TopicRepository topicRepository,
                               EntityMapper entityMapper) {
        this.programRepository = programRepository;
        this.levelRepository = levelRepository;
        this.bookRepository = bookRepository;
        this.moduleRepository = moduleRepository;
        this.topicRepository = topicRepository;
        this.entityMapper = entityMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicProgramDTO> getAllPrograms() {
        return programRepository.findAll().stream().map(prog -> {
            List<AcademicLevelDTO> levels = levelRepository.findByProgramIdOrderBySequenceOrderAsc(prog.getId())
                .stream().map(lvl -> {
                    List<BookDTO> books = bookRepository.findByLevelId(lvl.getId())
                        .stream().map(b -> {
                            List<ModuleDTO> mods = moduleRepository.findByBookIdOrderBySequenceOrderAsc(b.getId())
                                .stream().map(m -> entityMapper.toModuleDTO(m, getTopicsByModule(m.getId())))
                                .collect(Collectors.toList());
                            return entityMapper.toBookDTO(b, mods);
                        }).collect(Collectors.toList());
                    return entityMapper.toAcademicLevelDTO(lvl, books);
                }).collect(Collectors.toList());
            return entityMapper.toAcademicProgramDTO(prog, levels);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicLevelDTO> getLevelsByProgram(Long programId) {
        return levelRepository.findByProgramIdOrderBySequenceOrderAsc(programId).stream()
            .map(lvl -> entityMapper.toAcademicLevelDTO(lvl, getBooksByLevel(lvl.getId())))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookDTO> getBooksByLevel(Long levelId) {
        return bookRepository.findByLevelId(levelId).stream()
            .map(b -> entityMapper.toBookDTO(b, getModulesByBook(b.getId())))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookDTO> getAllBooks() {
        return bookRepository.findAll().stream()
            .map(b -> entityMapper.toBookDTO(b, getModulesByBook(b.getId())))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleDTO> getModulesByBook(Long bookId) {
        return moduleRepository.findByBookIdOrderBySequenceOrderAsc(bookId).stream()
            .map(m -> entityMapper.toModuleDTO(m, getTopicsByModule(m.getId())))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicDTO> getTopicsByModule(Long moduleId) {
        return topicRepository.findByModuleId(moduleId).stream()
            .map(entityMapper::toTopicDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ModuleDTO getModuleById(Long id) {
        Module mod = moduleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Module", id));
        return entityMapper.toModuleDTO(mod, getTopicsByModule(id));
    }
}
