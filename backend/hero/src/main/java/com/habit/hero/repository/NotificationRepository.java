package com.habit.hero.repository;

import com.habit.hero.entity.Notification;
import com.habit.hero.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get all notifications for a user (not deleted, latest first)
    List<Notification> findByUserUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);

    // Count unread notifications for a user (not deleted)
    long countByUserUserIdAndIsReadFalseAndIsDeletedFalse(Long userId);

    // Get notifications by reference ID (for undo/filtering)
    List<Notification> findByReferenceId(Long referenceId);

    // Delete notification directly by user, type, and reference ID (habit undo)
    @Modifying(clearAutomatically = true)
    @Query(value = "DELETE FROM notifications WHERE user_id = :userId AND notification_type = :#{#type.name()} AND reference_id = :refId", nativeQuery = true)
    void deleteDirectly(@Param("userId") Long userId,
                        @Param("type") NotificationType type,
                        @Param("refId") Long refId);

    // Delete social notification directly by user, type, reference ID, and related user (social undo)
    @Modifying(clearAutomatically = true)
    @Query(value = "DELETE FROM notifications WHERE user_id = :userId AND notification_type = :#{#type.name()} AND reference_id = :refId AND related_user_id = :relatedUserId", nativeQuery = true)
    void deleteSocialDirectly(@Param("userId") Long userId,
                              @Param("type") NotificationType type,
                              @Param("refId") Long refId,
                              @Param("relatedUserId") Long relatedUserId);
}