package com.habit.hero.dto.report;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OverallHabitReportDto {

    private String habitName;
    private String category;
    private String cadence;

    // Goal (split fields)
    private Double targetValue;
    private String targetUnit;

    // Progress summary
    private int totalCompletions;
    private int totalMissedDays;
    private int completionPercent;

    // Total actual progress (sum)
    private Double totalActualValue;
    private String actualUnit;
}
