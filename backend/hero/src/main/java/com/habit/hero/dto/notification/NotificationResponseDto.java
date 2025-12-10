package com.habit.hero.dto.notification;

import com.habit.hero.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDto {
    private Long notificationId;
    private NotificationType notificationType;
    private String message;
    private Boolean isRead;
    // To redirect related post or request
    private Long referenceId;
    private LocalDateTime createdAt;
    private Long senderId;
    private String senderName;
    private String senderProfileImage;
}
