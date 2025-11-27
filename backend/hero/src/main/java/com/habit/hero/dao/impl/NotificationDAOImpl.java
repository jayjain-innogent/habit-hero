package com.habit.hero.dao.impl;

import com.habit.hero.dao.NotificationDAO;
import com.habit.hero.entity.Notification;
import com.habit.hero.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class NotificationDAOImpl implements NotificationDAO {

    private final NotificationRepository notificationRepository;

    @Override
    public List<Notification> findByUser(Long userId) {
        // fetch notifications by user
        return notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public Optional<Notification> findById(Long id) {
        // fetch notification by id
        return notificationRepository.findById(id);
    }

    @Override
    public Notification save(Notification notification) {
        // save notification changes
        return notificationRepository.save(notification);
    }

    @Override
    public void delete(Notification notification) {
        // delete notification
        notificationRepository.delete(notification);
    }
}
