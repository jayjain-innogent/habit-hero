package com.habit.hero.dto.report;


import com.habit.hero.entity.HabitLog;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HabitSummary {
    private Integer longestStreak;
    private Double completionRate;
    private Integer totalMissedDays;
    private Integer currentStreak;
    private List<LocalDate> habitCompletions;
}
