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

    //get all friends(in friendlist)
    @Query("SELECT fl FROM FriendList fl WHERE fl.user = :user OR fl.friend = :user")
    List<FriendList> findFriendsOfUser(@Param("user") User user);

    @Modifying
    @Transactional
    @Query("DELETE FROM FriendList fl WHERE (fl.user.userId = :userId AND fl.friend.userId = :friendId) OR (fl.user.userId = :friendId AND fl.friend.userId = :userId)")
    void removeFriend(@Param("userId") Long userId, @Param("friendId") Long friendId);


    @Query("""
        SELECT COUNT(fl) > 0
        FROM FriendList fl
        WHERE (fl.user = :user AND fl.friend = :friend) OR (fl.user = :friend AND fl.friend = :user)
        """)
    boolean existsFriendship(@Param("user") User user, @Param("friend") User friend);

    @Query("""
    SELECT fl.friend
    FROM FriendList fl
    WHERE fl.user = :user
    UNION
    SELECT fl.user
    FROM FriendList fl
    WHERE fl.friend = :user
    """)
    List<User> findUserFriends(@Param("user") User user);

}