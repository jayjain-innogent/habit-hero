package com.habit.hero.mapper;

import com.habit.hero.dto.notification.NotificationResponse;
import com.habit.hero.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    //response
    public NotificationResponse toResponse(Notification n){
        NotificationResponse  res  = new NotificationResponse();
        res.setNotificationId(n.getNotificationId());
        res.setNotificationType(n.getNotificationType().name());
        res.setComment(n.getComment());
        res.setCreatedAt(n.getCreatedAt().toString());
        res.setRelatedUserId(
                n.getRelatedUser() != null ? n.getRelatedUser().getUserId() : null
        );
        return res;
    }

}
