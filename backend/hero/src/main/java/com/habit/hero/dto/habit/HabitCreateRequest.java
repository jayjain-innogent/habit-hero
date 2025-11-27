package com.habit.hero.dto.habit;

import com.habit.hero.enums.Frequency;
import com.habit.hero.enums.GoalType;
import com.habit.hero.enums.Visibility;
import com.habit.hero.enums.HabitStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitCreateRequest {

    private String title;
    private String description;
    private String category;

    private String color;
    private String icon;

    private Frequency frequency;
    private Integer frequencyCount;
    private String frequencyDays;

    private GoalType goalType;
    private String unit;

    // String → BigDecimal in mapper
    private String targetValue;

    private Visibility visibility;

    private HabitStatus status;
}
