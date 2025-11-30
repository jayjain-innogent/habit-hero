package com.habit.hero.dto.habitlog;

import lombok.*;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodayStatusResponse {
    private Map<Long, HabitStatusItem> status;
}
