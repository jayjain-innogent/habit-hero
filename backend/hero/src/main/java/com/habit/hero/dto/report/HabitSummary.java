package com.habit.hero.dto.report;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HabitSummary {
    private Integer longestStreak;
    private Double currentCompletion;
    private Double expectedCompletion;
    private Integer totalMissedDays;
    private Integer currentStreak;
    private CompletionData  habitCompletionsData;
}
