package mx.iqenglish.tutoring.service.impl;

import mx.iqenglish.tutoring.dto.NotificationDTO;
import mx.iqenglish.tutoring.entity.Notification;
import mx.iqenglish.tutoring.entity.NotificationType;
import mx.iqenglish.tutoring.entity.User;
import mx.iqenglish.tutoring.exception.BusinessException;
import mx.iqenglish.tutoring.exception.ResourceNotFoundException;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.NotificationRepository;
import mx.iqenglish.tutoring.repository.UserRepository;
import mx.iqenglish.tutoring.security.SecurityUtils;
import mx.iqenglish.tutoring.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;

    public NotificationServiceImpl(NotificationRepository notificationRepository, UserRepository userRepository, EntityMapper entityMapper) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.entityMapper = entityMapper;
    }

    @Override
    @Transactional
    public void sendNotification(User user, String title, String message, NotificationType type, String relatedEntityType, Long relatedEntityId) {
        if (user == null) return;
        Notification notif = new Notification(user, title, message, type, relatedEntityType, relatedEntityId);
        notificationRepository.save(notif);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getMyNotifications() {
        Long userId = SecurityUtils.getCurrentUserId()
            .orElseThrow(() -> new BusinessException("UNAUTHENTICATED", "Authentication required", HttpStatus.UNAUTHORIZED));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(entityMapper::toNotificationDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notif = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        notif.setIsRead(true);
        notificationRepository.save(notif);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return SecurityUtils.getCurrentUserId()
            .map(notificationRepository::countByUserIdAndIsReadFalse)
            .orElse(0L);
    }
}
