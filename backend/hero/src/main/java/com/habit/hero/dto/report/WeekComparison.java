package com.habit.hero.dto.report;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WeekComparison {
    private Double completionsDiff;
    private Double percentageDiff;
    private Integer missedDaysDiff;
    private Integer completedDaysDiff;
}
