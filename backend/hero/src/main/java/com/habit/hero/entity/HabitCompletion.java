package com.habit.hero.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table(
        name = "habit_completions",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"habit_id", "completion_date"})
        }
)
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "completion_id")
    private Long completionId;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(name = "note")
    private String note;

    @Column(name = "current_count")
    private Integer currentCount = 0;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habit_id")
    private Habit habit;

    @OneToMany(mappedBy = "completion", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<StreakReaction> reactions;
}
