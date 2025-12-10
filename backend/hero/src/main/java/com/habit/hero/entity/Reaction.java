package com.habit.hero.entity;

import com.habit.hero.enums.ReactionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "activity_reactions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"activity_id", "reactor_user_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reaction_id")
    private Long reactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false)
    private ReactionType reactionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completion_id")
    private HabitLog completion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reactor_user_id")
    private User reactor;
}