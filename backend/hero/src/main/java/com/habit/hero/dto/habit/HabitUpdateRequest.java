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
public class HabitUpdateRequest {

    private String title;
    private String description;
    private String category;               // String → Enum

    private Cadence cadence;               // Enum
    private Integer sessionCount;        // sessionCount

    private GoalType goalType;             // Enum
    private String unit;                   // String → GoalUnit enum

    private String targetValue;            // String → BigDecimal

    private Visibility visibility;         // Enum
    private HabitStatus status;            // Enum
<<<<<<< HEAD
}
=======
}
>>>>>>> d399aa005139d2520c55c57a1f294150a6a7b1af
