package com.habit.hero.entity;

import com.habit.hero.enums.ReactionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "streak_reactions")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StreakReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reaction_id")
    private Long reactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type")
    private ReactionType reactionType;

    @Column(name = "comment_text", columnDefinition = "TEXT")
    private String commentText;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completion_id")
    private HabitCompletion completion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reactor_user_id")
    private User reactor;
}

