package com.habit.hero.controller;

import com.habit.hero.dto.notification.NotificationResponseDto;
import com.habit.hero.service.NotificationService;
import com.habit.hero.util.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserUtil currentUserUtil;

    // get all notifications
    @GetMapping
    public ResponseEntity<List<NotificationResponseDto>> getUserNotifications() {
        Long userId = currentUserUtil.getCurrentUserId();
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    // get count of unread notifications
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        Long userId = currentUserUtil.getCurrentUserId();
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    // mark a specific notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        Long userId = currentUserUtil.getCurrentUserId();
        notificationService.markAsRead(userId, id);
        return ResponseEntity.ok().build();
    }

    // mark all notifications as read
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Long userId = currentUserUtil.getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    // delete a specific notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        Long userId = currentUserUtil.getCurrentUserId();
        notificationService.deleteNotification(userId, id);
        return ResponseEntity.ok().build();
    }
}