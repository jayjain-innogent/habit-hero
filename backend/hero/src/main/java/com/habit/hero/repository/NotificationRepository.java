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

    // ✅ FIX 1 (The missing method for fetching the list in DAOImpl.findAllByUserId)
    List<Notification> findByUserUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);

    // ✅ FIX 2 (The method required for DAOImpl.countUnread)
    long countByUserUserIdAndIsReadFalseAndIsDeletedFalse(Long userId);

    // ✅ FIX 3 (Method required for findById / softDelete checking)
    // List<Notification> findByReferenceId(Long referenceId); // Required for Java Filtering in DAOImpl

    // Simple fetch by Reference ID only (for Java filtering in DAO)
    List<Notification> findByReferenceId(Long referenceId);


    // 1. FIX: Habit Undo Delete
    @Modifying(clearAutomatically = true)
    @Query(value = "DELETE FROM notifications WHERE user_id = :userId AND notification_type = :#{#type.name()} AND reference_id = :refId", nativeQuery = true) // <-- Table name changed to notifications
    void deleteDirectly(@Param("userId") Long userId,
                        @Param("type") NotificationType type,
                        @Param("refId") Long refId);

    // 2. FIX: Social Undo Delete
    @Modifying(clearAutomatically = true)
    @Query(value = "DELETE FROM notifications WHERE user_id = :userId AND notification_type = :#{#type.name()} AND reference_id = :refId AND related_user_id = :relatedUserId", nativeQuery = true) // <-- Table name changed to notifications
    void deleteSocialDirectly(@Param("userId") Long userId,
                              @Param("type") NotificationType type,
                              @Param("refId") Long refId,
                              @Param("relatedUserId") Long relatedUserId);
}