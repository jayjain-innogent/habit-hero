package com.habit.hero.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Email
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "is_private", nullable = false)
    private Boolean isPrivate = false;

    @Column(name = "notification_prefs_friend_requests")
    private Boolean notificationPrefsFriendRequests = true;

    @Column(name = "notification_prefs_message")
    private Boolean notificationPrefsMessage = true;

    @Column(name = "notification_prefs_streak_breaks")
    private Boolean notificationPrefsStreakBreaks = true;

    @Column(name = "user_bio")
    private String userBio;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<Habit> habits;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Notification> notifications;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<FeedPost> feedPosts;
}
