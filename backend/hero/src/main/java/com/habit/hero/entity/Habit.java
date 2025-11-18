package com.habit.hero.entity;

import com.habit.hero.enums.Visibility;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    @Column(name = "habit_id")
    private Long habitId;

    @Column(name = "habit_name")
    private String habitName;

    @Column(name = "category")
    private String category;

    @Column(name = "cadence")
    private String cadence;

    @Column(name = "goal_per_period", precision = 10, scale = 2)
    private BigDecimal goalPerPeriod;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility")
    private Visibility visibility;

    @Column(name = "description")
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "habit", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    private List<HabitCompletion> completions;

    @OneToOne(mappedBy = "habit", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    private Streak streak;

}
