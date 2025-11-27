package com.habit.hero.entity;

import com.habit.hero.enums.*;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "habits")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long Id;

    @Column(name = "title")
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private Categories category;

    @Enumerated(EnumType.STRING)
    @Column(name = "cadence")
    private Cadence cadence;

    @Column(name = "session_count")
    private Integer sessionCount;

    @Column(name = "target_value")
    private BigDecimal targetValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type")
    private GoalType goalType;

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_unit")
    private GoalUnit goalUnit;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility")
    private Visibility visibility;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name= "status", nullable = false)
    private HabitStatus status;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "habit", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    private List<HabitLog> completions;

    @OneToOne(mappedBy = "habit", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    private Streak streak;
}