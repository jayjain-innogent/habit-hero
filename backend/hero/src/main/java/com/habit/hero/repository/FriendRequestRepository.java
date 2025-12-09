package com.habit.hero.repository;

import com.habit.hero.entity.FriendRequest;
import com.habit.hero.entity.User;
import com.habit.hero.enums.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    @Query("SELECT fr FROM FriendRequest fr WHERE fr.sender = :sender AND fr.receiver = :receiver")
    Optional<FriendRequest> findAnyRequest(
            @Param("sender") User sender,
            @Param("receiver") User receiver
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM FriendRequest fr WHERE " +
            "(fr.sender = :sender AND fr.receiver = :receiver) OR " +
            "(fr.sender = :receiver AND fr.receiver = :sender)")
    void deleteExistingBetween(
            @Param("sender") User sender,
            @Param("receiver") User receiver
    );

    @Query("SELECT fr FROM FriendRequest fr WHERE fr.receiver = :receiver AND fr.status = :status")
    List<FriendRequest> findPendingRequests(
            @Param("receiver") User receiver,
            @Param("status") FriendRequestStatus status
    );

    @Query("SELECT fr FROM FriendRequest fr WHERE fr.sender = :sender AND fr.status = :status")
    List<FriendRequest> findBySenderAndStatus(@Param("sender") User sender, @Param("status") FriendRequestStatus status);

}
