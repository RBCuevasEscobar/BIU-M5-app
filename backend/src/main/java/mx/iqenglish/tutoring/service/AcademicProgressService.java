package mx.iqenglish.tutoring.service;

import mx.iqenglish.tutoring.entity.AcademicProgress;
import java.math.BigDecimal;
import java.util.List;

public interface AcademicProgressService {
    List<AcademicProgress> getProgressByStudent(Long studentId);
    void recordModuleAttendance(Long studentId, Long moduleId, BigDecimal grade);
}