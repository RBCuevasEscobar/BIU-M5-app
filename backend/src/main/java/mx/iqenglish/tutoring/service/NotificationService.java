package mx.iqenglish.tutoring.service;
import mx.iqenglish.tutoring.dto.NotificationDTO;
import mx.iqenglish.tutoring.entity.NotificationType;
import mx.iqenglish.tutoring.entity.User;
import java.util.List;
public interface NotificationService {
    void sendNotification(User user, String title, String message, NotificationType type, String relatedEntityType, Long relatedEntityId);
    List<NotificationDTO> getMyNotifications();
    void markAsRead(Long notificationId);
    long getUnreadCount();
}
