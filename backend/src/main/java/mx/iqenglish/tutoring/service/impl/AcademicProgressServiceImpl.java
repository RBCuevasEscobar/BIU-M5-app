package mx.iqenglish.tutoring.service.impl;

import mx.iqenglish.tutoring.entity.AcademicProgress;
import mx.iqenglish.tutoring.entity.Module;
import mx.iqenglish.tutoring.entity.Student;
import mx.iqenglish.tutoring.repository.AcademicProgressRepository;
import mx.iqenglish.tutoring.repository.ModuleRepository;
import mx.iqenglish.tutoring.repository.StudentRepository;
import mx.iqenglish.tutoring.service.AcademicProgressService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AcademicProgressServiceImpl implements AcademicProgressService {

    private final AcademicProgressRepository progressRepository;
    private final StudentRepository studentRepository;
    private final ModuleRepository moduleRepository;

    public AcademicProgressServiceImpl(AcademicProgressRepository progressRepository,
                                       StudentRepository studentRepository,
                                       ModuleRepository moduleRepository) {
        this.progressRepository = progressRepository;
        this.studentRepository = studentRepository;
        this.moduleRepository = moduleRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicProgress> getProgressByStudent(Long studentId) {
        return progressRepository.findByStudentId(studentId);
    }

    @Override
    @Transactional
    public void recordModuleAttendance(Long studentId, Long moduleId) {
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
        if (newCount >= 4) { // 4 tutoring sessions per module completes the module
            prog.setStatus("COMPLETED");
            prog.setCompletionDate(LocalDate.now());
        }
        prog.setUpdatedAt(LocalDateTime.now());
        progressRepository.save(prog);
    }
}
