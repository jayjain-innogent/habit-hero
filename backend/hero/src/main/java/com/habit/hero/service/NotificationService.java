package com.habit.hero.service;

import com.habit.hero.dto.notification.NotificationResponse;
import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getNotifications(Long userId);

    void markAsRead(Long notificationId, Long userId);

    void deleteNotification(Long notificationId, Long userId);
}
