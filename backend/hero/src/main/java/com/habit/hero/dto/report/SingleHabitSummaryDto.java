package com.habit.hero.dto.report;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SingleHabitSummaryDto {

    private String habitName;
    private String selectedPeriod;
    private String cadence;

    // Goal (split)
    private Double targetValue;
    private String targetUnit;

    // Overall performance
    private int totalCompletions;
    private int totalMissedDays;
    private int completionPercent;

    // Total actual progress in this period
    private Double totalActualValue;
    private String actualUnit;
}
