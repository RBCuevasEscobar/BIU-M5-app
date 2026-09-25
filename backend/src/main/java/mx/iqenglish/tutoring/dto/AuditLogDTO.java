package mx.iqenglish.tutoring.dto;
import java.time.LocalDateTime;
public class AuditLogDTO {
    private Long id; private Long userId; private String username; private String action; private String entityName; private String entityId; private String details; private String ipAddress; private String traceId; private LocalDateTime createdAt;
    public AuditLogDTO() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; } public void setUserId(Long id) { this.userId = id; }
    public String getUsername() { return username; } public void setUsername(String s) { this.username = s; }
    public String getAction() { return action; } public void setAction(String s) { this.action = s; }
    public String getEntityName() { return entityName; } public void setEntityName(String s) { this.entityName = s; }
    public String getEntityId() { return entityId; } public void setEntityId(String s) { this.entityId = s; }
    public String getDetails() { return details; } public void setDetails(String s) { this.details = s; }
    public String getIpAddress() { return ipAddress; } public void setIpAddress(String s) { this.ipAddress = s; }
    public String getTraceId() { return traceId; } public void setTraceId(String s) { this.traceId = s; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
