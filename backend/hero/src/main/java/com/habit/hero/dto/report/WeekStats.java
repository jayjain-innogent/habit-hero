package com.habit.hero.dto.report;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WeekStats {
    private Double completions;
    private Double completionPercentage;
    private Integer missedDays;
}
