package mx.iqenglish.tutoring.service;
import mx.iqenglish.tutoring.dto.AuditLogDTO;
import java.util.List;
public interface AuditService {
    void log(String action, String entityName, String entityId, String details);
    List<AuditLogDTO> getRecentLogs();
}
