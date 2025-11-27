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

    @Query("SELECT fr FROM FriendRequest fr WHERE fr.sender = :sender AND fr.receiver = :receiver ")
    Optional<FriendRequest> findAnyRequest(
            @Param("sender") User sender,
            @Param("receiver") User receiver
    );

    @Modifying
    @Transactional
    @Query("""
    DELETE FROM FriendRequest fr
    WHERE fr.sender = :sender
      AND fr.receiver = :receiver
      AND fr.status IN :statuses
    """)
    void deleteRequestsByStatus(
            @Param("sender") User sender,
            @Param("receiver") User receiver,
            @Param("statuses") List<FriendRequestStatus> statuses
    );

    @Query("SELECT fr FROM FriendRequest fr WHERE fr.receiver = :receiver AND fr.status = :status")
    List<FriendRequest> findPendingRequests(@Param("receiver") User receiver, @Param("status") FriendRequestStatus status);

}
