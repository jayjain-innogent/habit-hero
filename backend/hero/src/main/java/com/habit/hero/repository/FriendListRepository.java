package com.habit.hero.repository;

import com.habit.hero.entity.FriendList;
import com.habit.hero.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface FriendListRepository extends JpaRepository<FriendList, Long> {

    @Query("SELECT fl FROM FriendList fl WHERE fl.user = :user OR fl.friend = :user")
    List<FriendList> findFriendsOfUser(@Param("user") User user);

    @Modifying
    @Transactional
    @Query("DELETE FROM FriendList fl WHERE fl.user = :user AND fl.friend = :friend")
    void removeFriend(
            @Param("user") User user,
            @Param("friend") User friend
    );

    @Query("""
        SELECT COUNT(fl) > 0
        FROM FriendList fl
        WHERE fl.user = :user AND fl.friend = :friend
        """)
    boolean existsFriendship(@Param("user") User user, @Param("friend") User friend);
}