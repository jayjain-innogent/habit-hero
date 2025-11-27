package com.habit.hero.entity;

import com.habit.hero.enums.*;
import jakarta.persistence.*;
import jdk.jshell.Snippet;
import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "habits")
@Getter
@Setter
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

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private HabitStatus status;

    // Set default values automatically
    @PrePersist
    public void prePersist() {
        this.createdAt = new Timestamp(System.currentTimeMillis());
        this.updatedAt = new Timestamp(System.currentTimeMillis());

        if (this.startDate == null) this.startDate = LocalDate.now();
        if (this.cadence == null) this.cadence = com.habit.hero.enums.Cadence.DAILY;
        if (this.goalType == null) this.goalType = GoalType.OFF;
        if (this.visibility == null) this.visibility = Visibility.PRIVATE;
        if (this.status == null) this.status = HabitStatus.ACTIVE;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }

}
