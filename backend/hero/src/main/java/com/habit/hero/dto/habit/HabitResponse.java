package com.habit.hero.dto.habit;

import com.habit.hero.enums.Cadence;
import com.habit.hero.enums.GoalType;
import com.habit.hero.enums.Visibility;
import com.habit.hero.enums.HabitStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitResponse {

    private Long id;
    private Long userId;

    private String title;
    private String description;
    private String category;

    private LocalDate startDate;

    private Cadence cadence;
    private Integer sessionCount;

    private GoalType goalType;
    private BigDecimal targetValue;
    private String unit;

    private Visibility visibility;
    private HabitStatus status;

    private Integer currentStreak;
    private Integer longestStreak;
    private LocalDate lastActivityDate;
}