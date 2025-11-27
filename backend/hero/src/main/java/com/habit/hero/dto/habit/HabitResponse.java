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
    private Long userId;                 // Extracted from habit.getUser().getId()

    private String title;
    private String description;
    private String category;             // Enum → String

    private LocalDate startDate;

    private Cadence cadence;
    private Integer sessionCount;      // sessionCount

    private GoalType goalType;
    private BigDecimal targetValue;
    private String unit;                 // GoalUnit enum → String

    private Visibility visibility;
    private HabitStatus status;
}
