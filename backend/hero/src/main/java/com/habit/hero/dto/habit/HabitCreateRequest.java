package com.habit.hero.dto.habit;

import com.habit.hero.enums.Cadence;
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
    private String category;               // String → Enum in mapper

    private Cadence cadence;               // Enum
    private Integer sessionCount;        // Maps to sessionCount

    private GoalType goalType;             // Enum
    private String unit;                   // String → GoalUnit enum in mapper

    private String targetValue;            // String → BigDecimal

    private Visibility visibility;         // Enum
    private HabitStatus status;            // Enum
}