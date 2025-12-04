package com.habit.hero.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "friend_list",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"user_id", "friend_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendList extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "friend_id", nullable = false)
    private User friend;
}


//POST   /api/friends/request
//POST   /api/friends/accept/{requestId}
//POST   /api/friends/reject/{requestId}
//POST   /api/friends/cancel/{requestId}
//DELETE /api/friends/remove/{friendId}
//GET    /api/friends
//GET    /api/friends/requests




