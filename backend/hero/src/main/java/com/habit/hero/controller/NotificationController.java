package com.habit.hero.controller;

import com.habit.hero.dto.notification.NotificationResponse;
import com.habit.hero.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    // list notifications
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(@RequestParam Long userId) {
        log.info("GET /notifications userId={}", userId);
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    // mark as read
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            @RequestParam Long userId
    ) {
        log.info("PUT /notifications/{}/read userId={}", notificationId, userId);
        notificationService.markAsRead(notificationId, userId);
        return ResponseEntity.noContent().build();
    }

    // delete
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId,
            @RequestParam Long userId
    ) {
        log.info("DELETE /notifications/{} userId={}", notificationId, userId);
        notificationService.deleteNotification(notificationId, userId);
        return ResponseEntity.noContent().build();
    }
}
