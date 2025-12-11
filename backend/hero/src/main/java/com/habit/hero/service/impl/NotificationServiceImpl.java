package com.habit.hero.service.impl;

import com.habit.hero.dao.NotificationDAO;
import com.habit.hero.dto.notification.NotificationResponseDto;
import com.habit.hero.entity.Notification;
import com.habit.hero.entity.User;
import com.habit.hero.enums.NotificationType;
import com.habit.hero.mapper.NotificationMapper;
import com.habit.hero.repository.UserRepository;
import com.habit.hero.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationDAO notificationDAO;
    private final NotificationMapper notificationMapper;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Create and send a new notification to a user
    @Override
    @Transactional
    public void createNotification(Long targetUserId, Long relatedUserId, NotificationType type, String message, Long referenceId) {

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // check if user has notifications disabled
        if (Boolean.FALSE.equals(targetUser.getNotificationEnabled())) {
            return;
        }

        User relatedUser = null;
        if (relatedUserId != null) {
            relatedUser = userRepository.findById(relatedUserId).orElse(null);
        }

        Notification notification = Notification.builder()
                .user(targetUser)
                .relatedUser(relatedUser)
                .notificationType(type)
                .message(message)
                .referenceId(referenceId)
                .isRead(false)
                .isDeleted(false)
                .build();

        Notification savedNotification = notificationDAO.save(notification);
        NotificationResponseDto responseDto = notificationMapper.toDto(savedNotification);

        // send notification to frontend via WebSocket
        messagingTemplate.convertAndSend("/topic/user/" + targetUserId, responseDto);
    }

    // Get all notifications for the current user
    @Override
    public List<NotificationResponseDto> getUserNotifications(Long userId) {
        List<Notification> notifications = notificationDAO.findAllByUserId(userId);
        return notifications.stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    // Get count of unread notifications for the current user
    @Override
    public long getUnreadCount(Long userId) {
        return notificationDAO.countUnread(userId);
    }

    // Mark a specific notification as read
    @Override
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationDAO.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // check if the notification belongs to the user
        if (!notification.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }

        notification.setIsRead(true);
        notificationDAO.save(notification);
    }

    // Mark all notifications as read for the current user
    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationDAO.findAllByUserId(userId);

        for (Notification n : notifications) {
            if (!n.getIsRead()) {
                n.setIsRead(true);
                notificationDAO.save(n);
            }
        }
    }

    // Delete a specific notification
    @Override
    @Transactional
    public void deleteNotification(Long userId, Long notificationId) {
        Notification notification = notificationDAO.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // check if the notification belongs to the user
        if (!notification.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }

        notificationDAO.delete(notification);
    }

    // Delete notification by reference using direct SQL and notify frontend to refresh
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deleteNotificationByReference(Long userId, NotificationType type, Long referenceId) {
        notificationDAO.deleteDirectly(userId, type, referenceId);

        // send refresh command to frontend
        NotificationResponseDto refreshSignal = NotificationResponseDto.builder()
                .message("REFRESH_COMMAND")
                .build();
        messagingTemplate.convertAndSend("/topic/user/" + userId, refreshSignal);
    }

    // Delete social notification by reference and related user
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deleteSocialNotification(Long targetUserId, Long relatedUserId, NotificationType type, Long referenceId) {
        notificationDAO.deleteSocialDirectly(targetUserId, type, referenceId, relatedUserId);

        // send refresh command to frontend
        NotificationResponseDto refreshSignal = NotificationResponseDto.builder()
                .message("REFRESH_COMMAND")
                .build();
        messagingTemplate.convertAndSend("/topic/user/" + targetUserId, refreshSignal);
    }
}