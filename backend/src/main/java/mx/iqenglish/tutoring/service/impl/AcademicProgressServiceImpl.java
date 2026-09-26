package mx.iqenglish.tutoring.service.impl;

import mx.iqenglish.tutoring.entity.AcademicProgress;
import mx.iqenglish.tutoring.entity.Book;
import mx.iqenglish.tutoring.entity.Module;
import mx.iqenglish.tutoring.entity.Student;
import mx.iqenglish.tutoring.repository.AcademicProgressRepository;
import mx.iqenglish.tutoring.repository.BookRepository;
import mx.iqenglish.tutoring.repository.ModuleRepository;
import mx.iqenglish.tutoring.repository.StudentRepository;
import mx.iqenglish.tutoring.service.AcademicProgressService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AcademicProgressServiceImpl implements AcademicProgressService {

    private final AcademicProgressRepository progressRepository;
    private final StudentRepository studentRepository;
    private final ModuleRepository moduleRepository;
    private final BookRepository bookRepository;

    public AcademicProgressServiceImpl(AcademicProgressRepository progressRepository,
                                       StudentRepository studentRepository,
                                       ModuleRepository moduleRepository,
                                       BookRepository bookRepository) {
        this.progressRepository = progressRepository;
        this.studentRepository = studentRepository;
        this.moduleRepository = moduleRepository;
        this.bookRepository = bookRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicProgress> getProgressByStudent(Long studentId) {
        return progressRepository.findByStudentId(studentId);
    }

    @Override
    @Transactional
    public void recordModuleAttendance(Long studentId, Long moduleId, BigDecimal grade) {
        Student student = studentRepository.findById(studentId).orElse(null);
        Module module = moduleRepository.findById(moduleId).orElse(null);
        if (student == null || module == null) return;

        AcademicProgress prog = progressRepository.findByStudentIdAndModuleId(studentId, moduleId)
            .orElseGet(() -> {
                AcademicProgress p = new AcademicProgress();
                p.setStudent(student);
                p.setModule(module);
                p.setStatus("IN_PROGRESS");
                p.setAttendanceCount(0);
                return p;
            });

        int newCount = prog.getAttendanceCount() + 1;
        prog.setAttendanceCount(newCount);

        if (grade != null) {
            BigDecimal roundedGrade = grade.setScale(2, RoundingMode.HALF_UP);
            if (prog.getGrade() != null) {
                // Calculate average grade
                BigDecimal avg = prog.getGrade().add(roundedGrade).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                prog.setGrade(avg);
            } else {
                prog.setGrade(roundedGrade);
            }
        }

        // 4 tutoring attendances per module completes the module
        if (newCount >= 4) {
            prog.setStatus("COMPLETED");
            prog.setCompletionDate(LocalDate.now());

            // Advance student to next module / book if this was their active module
            if (student.getCurrentModule() != null && student.getCurrentModule().getId().equals(moduleId)) {
                List<Module> bookModules = moduleRepository.findByBookIdOrderBySequenceOrderAsc(module.getBook().getId());
                Module nextMod = null;
                for (int i = 0; i < bookModules.size(); i++) {
                    if (bookModules.get(i).getId().equals(moduleId) && i + 1 < bookModules.size()) {
                        nextMod = bookModules.get(i + 1);
                        break;
                    }
                }

                if (nextMod != null) {
                    student.setCurrentModule(nextMod);
                } else {
                    // Advance to next book
                    int nextBookNumber = module.getBook().getBookNumber() + 1;
                    bookRepository.findByBookNumber(nextBookNumber).ifPresent(nextBook -> {
                        student.setCurrentBook(nextBook);
                        student.setCurrentLevel(nextBook.getLevel());
                        List<Module> nextBookMods = moduleRepository.findByBookIdOrderBySequenceOrderAsc(nextBook.getId());
                        if (!nextBookMods.isEmpty()) {
                            student.setCurrentModule(nextBookMods.get(0));
                        }
                    });
                }
                student.setUpdatedAt(LocalDateTime.now());
                studentRepository.save(student);
            }
        }

        prog.setUpdatedAt(LocalDateTime.now());
        progressRepository.save(prog);
    }
}