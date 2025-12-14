package com.habit.hero.repository;

import com.habit.hero.dto.activity.ActivityResponse;
import com.habit.hero.entity.Activity;
import com.habit.hero.entity.User;
import com.habit.hero.enums.Visibility;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    // specific user profile activities
    List<Activity> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    // friends’ activities
    List<Activity> findByUserInOrderByCreatedAtDesc(List<User> users);

    //all feed
    @Query("""
    SELECT a FROM Activity a
    WHERE a.visibility = com.habit.hero.enums.Visibility.PUBLIC
       OR (a.visibility = com.habit.hero.enums.Visibility.FRIENDS AND a.user IN :friends)
       OR a.user = :currentUser
    ORDER BY a.createdAt DESC
    """)
    List<Activity> fetchFeed(@Param("currentUser") User currentUser,
                             @Param("friends") List<User> friends,
                             Pageable pageable);

    @Query("""
    SELECT a FROM Activity a
    WHERE a.visibility = com.habit.hero.enums.Visibility.FRIENDS
      AND a.user IN :friends
    ORDER BY a.createdAt DESC
    """)
    List<Activity> fetchFriendsOnlyFeed(@Param("friends") List<User> friends,
                                        Pageable pageable);
}

