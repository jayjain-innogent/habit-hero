package com.habit.hero.entity;

import com.habit.hero.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType notificationType;

    // The notification message (e.g., "Rahul liked your post")
    @Column(name = "message", nullable = false)
    private String message;

    // Read status: false = unread, true = read
    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    // Reference ID for navigation (could be a post ID or user ID)
    @Column(name = "reference_id")
    private Long referenceId;

    // When the notification was created
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Delete status: false = not deleted, true = deleted
    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    // The user who receives the notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The user related to the notification (e.g., the one who liked or commented)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_user_id")
    private User relatedUser;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}