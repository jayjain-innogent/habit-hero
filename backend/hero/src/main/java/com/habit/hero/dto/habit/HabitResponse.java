package com.habit.hero.dto.habit;

import com.habit.hero.enums.Frequency;
import com.habit.hero.enums.GoalType;
import com.habit.hero.enums.Visibility;
import com.habit.hero.enums.HabitStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.sql.Timestamp;

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

    private String color;
    private String icon;

    private LocalDate startDate;

    private Frequency frequency;
    private Integer frequencyCount;
    private String frequencyDays;

    private GoalType goalType;
    private BigDecimal targetValue;
    private String unit;

    private Visibility visibility;

    private HabitStatus status;
}
