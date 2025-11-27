package com.habit.hero.dto.notification;

import lombok.Data;

@Data
public class NotificationResponse {

    // response
    private Long notificationId;
    private String notificationType;
    private String comment;
    private String createdAt;
    private Long relatedUserId;
}
