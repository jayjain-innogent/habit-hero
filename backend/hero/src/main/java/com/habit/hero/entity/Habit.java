package com.habit.hero.entity;

import com.habit.hero.enums.Frequency;
import com.habit.hero.enums.GoalType;
import com.habit.hero.enums.HabitStatus;
import com.habit.hero.enums.Visibility;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;

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
    private Long id;


    @JoinColumn(name = "user_id", nullable = false)
    private Long userId;

    // Identity & Visuals
    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private String category;

    @Column(length = 7)
    private String color;

    private String icon;

    // Timeline
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    // Frequency
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frequency frequency;

    private Integer frequencyCount;

//    @Column(columnDefinition = "jsonb")
//    private String frequencyDays;

    // Goal Configuration
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalType goalType;

    private BigDecimal targetValue;

    private String unit;

    // Privacy
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Visibility visibility;

    // Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HabitStatus status;

    // Audit Logs
    @Column(nullable = false, updatable = false)
    private Timestamp createdAt;

    @Column(nullable = false)
    private Timestamp updatedAt;

    // Set default values automatically
    @PrePersist
    public void prePersist() {
        this.createdAt = new Timestamp(System.currentTimeMillis());
        this.updatedAt = new Timestamp(System.currentTimeMillis());

        if (this.color == null) this.color = "#3B82F6";
        if (this.icon == null) this.icon = "📝";
        if (this.startDate == null) this.startDate = LocalDate.now();
        if (this.frequency == null) this.frequency = Frequency.DAILY;
        if (this.goalType == null) this.goalType = GoalType.OFF;
        if (this.visibility == null) this.visibility = Visibility.PRIVATE;
        if (this.status == null) this.status = HabitStatus.ACTIVE;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }

}
