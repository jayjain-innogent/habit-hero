package com.habit.hero.dto.habitlog;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitStatusItem {
    private boolean completedToday;
    private Object actualValue;
}
