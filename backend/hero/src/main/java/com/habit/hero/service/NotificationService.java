package com.habit.hero.service;

import com.habit.hero.dto.notification.NotificationResponseDto;
import com.habit.hero.enums.NotificationType;
import java.util.List;

public interface NotificationService {

    // create notification and push via websocket
    void createNotification(Long targetUserId, Long relatedUserId, NotificationType type, String message, Long referenceId);

    // get all notifications for current logged in user
    List<NotificationResponseDto> getUserNotifications();

    // get count of unread notifications
    long getUnreadCount();

    // mark a specific notification as read
    void markAsRead(Long notificationId);

    // mark all notifications as read
    void markAllAsRead();

    // delete a specific notification manually by id
    void deleteNotification(Long notificationId);

    // Hard delete notification by reference (used for habit undo logic)
    void deleteNotificationByReference(Long userId, NotificationType type, Long referenceId);

    // Hard delete notification by reference and sender (used for social undo logic like unlike)
    void deleteSocialNotification(Long targetUserId, Long relatedUserId, NotificationType type, Long referenceId);
}