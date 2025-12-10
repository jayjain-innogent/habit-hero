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

    // Save a notification to the database
    @Override
    public Notification save(Notification notification) {
        return notificationRepository.save(notification);
    }

    // Find a notification by its ID (if not deleted)
    @Override
    public Optional<Notification> findById(Long notificationId) {
        logger.debug("Fetching notification with ID: {}", notificationId);
        return notificationRepository.findById(notificationId)
                .filter(n -> !n.getIsDeleted());
    }

    // Get all notifications for a user (not deleted, latest first)
    @Override
    public List<Notification> findAllByUserId(Long userId) {
        return notificationRepository.findByUserUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
    }

    // Count unread notifications for a user
    @Override
    public long countUnread(Long userId) {
        return notificationRepository.countByUserUserIdAndIsReadFalseAndIsDeletedFalse(userId);
    }

    // Soft delete a notification (mark as deleted)
    @Override
    public void softDelete(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setIsDeleted(true);
            notificationRepository.save(notification);
        }
    }

    // Hard delete a notification from the database
    @Override
    public void delete(Notification notification) {
        logger.info("Hard deleting notification ID: {}", notification.getNotificationId());
        notificationRepository.delete(notification);
    }

    // Find notification for undo action (by user, type, referenceId)
    @Override
    public Optional<Notification> findForUndo(Long userId, NotificationType type, Long referenceId) {
        List<Notification> candidates = notificationRepository.findByReferenceId(referenceId);
        return candidates.stream()
                .filter(n -> n.getUser().getUserId().equals(userId))
                .filter(n -> n.getNotificationType() == type)
                .max(Comparator.comparing(Notification::getCreatedAt));
    }

    // Find social notification for undo (by user, type, referenceId, relatedUser)
    @Override
    public Optional<Notification> findForSocialUndo(Long userId, NotificationType type, Long referenceId, Long relatedUserId) {
        List<Notification> candidates = notificationRepository.findByReferenceId(referenceId);
        return candidates.stream()
                .filter(n -> n.getUser().getUserId().equals(userId))
                .filter(n -> n.getNotificationType() == type)
                .filter(n -> n.getRelatedUser() != null && n.getRelatedUser().getUserId().equals(relatedUserId))
                .max(Comparator.comparing(Notification::getCreatedAt));
    }

    // Directly delete notification using custom SQL (by user, type, referenceId)
    @Override
    public void deleteDirectly(Long userId, NotificationType type, Long referenceId) {
        notificationRepository.deleteDirectly(userId, type, referenceId);
    }

    // Directly delete social notification using custom SQL (by user, type, referenceId, relatedUser)
    @Override
    public void deleteSocialDirectly(Long userId, NotificationType type, Long referenceId, Long relatedUserId) {
        notificationRepository.deleteSocialDirectly(userId, type, referenceId, relatedUserId);
    }
}