package mx.iqenglish.tutoring.dto;
import java.time.LocalDateTime;
public class NotificationDTO {
    private Long id; private Long userId; private String title; private String message; private String type; private Boolean isRead; private String relatedEntityType; private Long relatedEntityId; private LocalDateTime createdAt;
    public NotificationDTO() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; } public void setUserId(Long id) { this.userId = id; }
    public String getTitle() { return title; } public void setTitle(String s) { this.title = s; }
    public String getMessage() { return message; } public void setMessage(String s) { this.message = s; }
    public String getType() { return type; } public void setType(String s) { this.type = s; }
    public Boolean getIsRead() { return isRead; } public void setIsRead(Boolean b) { this.isRead = b; }
    public String getRelatedEntityType() { return relatedEntityType; } public void setRelatedEntityType(String s) { this.relatedEntityType = s; }
    public Long getRelatedEntityId() { return relatedEntityId; } public void setRelatedEntityId(Long id) { this.relatedEntityId = id; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
