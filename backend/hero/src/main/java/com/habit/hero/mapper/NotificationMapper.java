package com.habit.hero.mapper;

import com.habit.hero.dto.notification.NotificationResponseDto;
import com.habit.hero.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponseDto toDto(Notification notification) {
        if (notification == null) {
            return null;
        }

        return NotificationResponseDto.builder()
                .notificationId(notification.getNotificationId())
                .notificationType(notification.getNotificationType())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .referenceId(notification.getReferenceId())
                .createdAt(notification.getCreatedAt())
                .senderId(notification.getRelatedUser() != null ? notification.getRelatedUser().getUserId() : null)
                .senderName(notification.getRelatedUser() != null ? notification.getRelatedUser().getName() : null)
                .senderProfileImage(notification.getRelatedUser() != null ? notification.getRelatedUser().getProfileImageUrl() : null)
                .build();
    }
}