package com.habit.hero.service.impl;

import com.habit.hero.dto.notification.NotificationResponse;
import com.habit.hero.entity.Notification;
import com.habit.hero.exception.AccessDeniedException;
import com.habit.hero.exception.ResourceNotFoundException;
import com.habit.hero.mapper.NotificationMapper;
import com.habit.hero.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationDAO notificationDAO;
    private final NotificationMapper notificationMapper;

    @Override
    public List<NotificationResponse> getNotifications(Long userId) {
        log.info("getNotifications userId={}", userId);

        // fetch all notifications
        List<Notification> list = notificationDAO.findByUser(userId);


        // convert to response
        return list.stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void markAsRead(Long notificationId, Long userId) {
        log.info("markAsRead id={} userId={}", notificationId, userId);

        // fetch notification
        Notification n = notificationDAO.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("notification not found"));

        // verify owner
        if (!n.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("not allowed");
        }

        // mark as deleted (used as read flag)
        n.setIsDeleted(true);
        notificationDAO.save(n);
    }

    @Override
    public void deleteNotification(Long notificationId, Long userId) {
        log.info("deleteNotification id={} userId={}", notificationId, userId);

        // fetch notification
        Notification n = notificationDAO.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("notification not found"));

        // verify owner
        if (!n.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("not allowed");
        }

        // delete
        notificationDAO.delete(n);
    }
}
