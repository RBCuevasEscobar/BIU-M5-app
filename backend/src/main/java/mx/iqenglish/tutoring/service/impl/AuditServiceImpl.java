package mx.iqenglish.tutoring.service.impl;

import mx.iqenglish.tutoring.dto.AuditLogDTO;
import mx.iqenglish.tutoring.entity.AuditLog;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.AuditLogRepository;
import mx.iqenglish.tutoring.security.SecurityUtils;
import mx.iqenglish.tutoring.service.AuditService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;
    private final EntityMapper entityMapper;

    public AuditServiceImpl(AuditLogRepository auditLogRepository, EntityMapper entityMapper) {
        this.auditLogRepository = auditLogRepository;
        this.entityMapper = entityMapper;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entityName, String entityId, String details) {
        Long userId = SecurityUtils.getCurrentUserId().orElse(null);
        String username = SecurityUtils.getCurrentUsername().orElse("SYSTEM");
        AuditLog audit = new AuditLog(userId, username, action, entityName, entityId, details, "127.0.0.1", UUID.randomUUID().toString());
        auditLogRepository.save(audit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDTO> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc().stream().map(entityMapper::toAuditLogDTO).collect(Collectors.toList());
    }
}
