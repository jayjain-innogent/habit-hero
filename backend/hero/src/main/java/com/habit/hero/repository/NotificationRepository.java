package com.habit.hero.repository;

import com.habit.hero.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // fetch notifications sorted by latest
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

}
