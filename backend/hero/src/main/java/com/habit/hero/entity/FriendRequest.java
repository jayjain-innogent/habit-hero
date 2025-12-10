package com.habit.hero.entity;

import com.habit.hero.enums.FriendRequestStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "friend_requests",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"sender_id", "receiver_id"}
        ) )
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendRequestStatus status = FriendRequestStatus.PENDING;

}
