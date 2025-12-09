package com.habit.hero.dao.impl;

import com.habit.hero.dao.NotificationDAO;
import com.habit.hero.entity.Notification;
import com.habit.hero.enums.NotificationType;
import com.habit.hero.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Repository
public class NotificationDAOImpl implements NotificationDAO {

    private static final Logger logger = LoggerFactory.getLogger(NotificationDAOImpl.class);
    private final NotificationRepository notificationRepository;

    public NotificationDAOImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public Notification save(Notification notification) {
        return notificationRepository.save(notification);
    }

    @Override
    public Optional<Notification> findById(Long notificationId) {
        logger.debug("Fetching notification with ID: {}", notificationId);
        return notificationRepository.findById(notificationId)
                .filter(n -> !n.getIsDeleted());
    }

    @Override
    public List<Notification> findAllByUserId(Long userId) {
        return notificationRepository.findByUserUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
    }

    @Override
    public long countUnread(Long userId) {
        return notificationRepository.countByUserUserIdAndIsReadFalseAndIsDeletedFalse(userId);
    }

    @Override
    public void softDelete(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setIsDeleted(true);
            notificationRepository.save(notification);
        }
    }

    @Override
    public void delete(Notification notification) {
        logger.info("Hard deleting notification ID: {}", notification.getNotificationId());
        notificationRepository.delete(notification);
    }

    // --- UNDO FIND METHODS (Required for Service) ---

    @Override
    public Optional<Notification> findForUndo(Long userId, NotificationType type, Long referenceId) {
        // Find by Reference ID and filter in Java
        List<Notification> candidates = notificationRepository.findByReferenceId(referenceId);

        return candidates.stream()
                .filter(n -> n.getUser().getUserId().equals(userId))
                .filter(n -> n.getNotificationType() == type)
                .max(Comparator.comparing(Notification::getCreatedAt));
    }

    @Override
    public Optional<Notification> findForSocialUndo(Long userId, NotificationType type, Long referenceId, Long relatedUserId) {
        // Find by Reference ID and filter in Java
        List<Notification> candidates = notificationRepository.findByReferenceId(referenceId);

        return candidates.stream()
                .filter(n -> n.getUser().getUserId().equals(userId))
                .filter(n -> n.getNotificationType() == type)
                .filter(n -> n.getRelatedUser() != null && n.getRelatedUser().getUserId().equals(relatedUserId))
                .max(Comparator.comparing(Notification::getCreatedAt));
    }

    // --- DIRECT SQL DELETE METHODS (For efficiency) ---

    @Override
    public void deleteDirectly(Long userId, NotificationType type, Long referenceId) {
        notificationRepository.deleteDirectly(userId, type, referenceId);
    }

    @Override
    public void deleteSocialDirectly(Long userId, NotificationType type, Long referenceId, Long relatedUserId) {
        notificationRepository.deleteSocialDirectly(userId, type, referenceId, relatedUserId);
    }
}