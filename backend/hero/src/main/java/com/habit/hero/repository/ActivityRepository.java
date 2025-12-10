package com.habit.hero.repository;

import com.habit.hero.entity.Activity;
import com.habit.hero.entity.User;
import com.habit.hero.enums.Visibility;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    //specific users activity(profile)
    List<Activity> findByUserAndIsDeletedFalseOrderByCreatedAtDesc(User user);

    //friends only feed
    List<Activity> findByUserInAndIsDeletedFalseOrderByCreatedAtDesc(List<User> users);

    //all feed
    @Query("""
        SELECT a FROM Activity a
        WHERE a.isDeleted = false
          AND (
               a.visibility = com.habit.hero.enums.Visibility.PUBLIC
               OR (a.visibility = com.habit.hero.enums.Visibility.FRIENDS AND a.user IN :friends)
               OR a.user = :currentUser
          )
        ORDER BY a.createdAt DESC
    """)
    List<Activity> fetchFeed(User currentUser, List<User> friends, Pageable pageable);
}
