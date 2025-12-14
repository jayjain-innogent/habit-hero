package com.habit.hero.dao;

import com.habit.hero.entity.Notification;
import com.habit.hero.enums.NotificationType;
import java.util.List;
import java.util.Optional;

public interface NotificationDAO {

    // Save or update a notification
    Notification save(Notification notification);

    // Find a notification by ID (filters out deleted ones)
    Optional<Notification> findById(Long notificationId);

    // Get all active (not deleted) notifications for a user
    List<Notification> findAllByUserId(Long userId);

    // Get count of unread notifications
    long countUnread(Long userId);

    // Soft delete a notification by marking isDeleted = true
    void softDelete(Long notificationId);

    // Hard delete notification directly by entity
    void delete(Notification notification);

    // Find latest notification to undo (used internally by Service)
    Optional<Notification> findForUndo(Long userId, NotificationType type, Long referenceId);

    // Find latest social notification to undo (used internally by Service)
    Optional<Notification> findForSocialUndo(Long userId, NotificationType type, Long referenceId, Long relatedUserId);

    // Direct SQL Delete for Habit/Simple Undo
    void deleteDirectly(Long userId, NotificationType type, Long referenceId);

    // Direct SQL Delete for Social Undo
    void deleteSocialDirectly(Long userId, NotificationType type, Long referenceId, Long relatedUserId);
}