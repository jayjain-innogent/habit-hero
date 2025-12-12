package com.habit.hero.service;

import com.habit.hero.dto.notification.NotificationResponseDto;
import com.habit.hero.enums.NotificationType;
import java.util.List;

public interface NotificationService {

    // create notification and push via websocket
    void createNotification(Long targetUserId, Long relatedUserId, NotificationType type, String message, Long referenceId);

    // get all notifications for current logged in user
    List<NotificationResponseDto> getUserNotifications(Long userId);

    // get count of unread notifications
    long getUnreadCount(Long userId);

    // mark a specific notification as read
    void markAsRead(Long userId, Long notificationId);

    // mark all notifications as read
    void markAllAsRead(Long userId);

    // delete a specific notification manually by id
    void deleteNotification(Long userId, Long notificationId);

    // hard delete notification by reference
    void deleteNotificationByReference(Long userId, NotificationType type, Long referenceId);

    // hard delete notification by reference and sender
    void deleteSocialNotification(Long targetUserId, Long relatedUserId, NotificationType type, Long referenceId);
}