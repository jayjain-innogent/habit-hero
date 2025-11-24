package com.habit.hero.dao;

import com.habit.hero.entity.Notification;
import java.util.List;
import java.util.Optional;

public interface NotificationDAO {

    // fetch notifications for a user
    List<Notification> findByUser(Long userId);

    // fetch single notification
    Optional<Notification> findById(Long id);

    // save notification
    Notification save(Notification notification);

    // delete notification
    void delete(Notification notification);
}
