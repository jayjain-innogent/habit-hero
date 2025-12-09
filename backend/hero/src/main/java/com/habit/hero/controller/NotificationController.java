package com.habit.hero.controller;

import com.habit.hero.dto.notification.NotificationResponseDto;
import com.habit.hero.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:3000") // allow react frontend to access api
public class NotificationController {

    private final NotificationService notificationService;

    // get all notifications for current logged in user
    @GetMapping
    public ResponseEntity<List<NotificationResponseDto>> getUserNotifications() {
        return ResponseEntity.ok(notificationService.getUserNotifications());
    }

    // get count of unread notifications for navbar red badge
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        return ResponseEntity.ok(notificationService.getUnreadCount());
    }

    // mark a specific notification as read by id
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    // mark all notifications as read for current user
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    // Delete a specific notification manually
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        // Ensure you have added void deleteNotification(Long id); in your Service Interface
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }
}