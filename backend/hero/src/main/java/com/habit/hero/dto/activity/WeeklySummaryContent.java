package com.habit.hero.dto.activity;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WeeklySummaryContent {
    private int weekNumber;
    private String topHabit;
    private String trend;
    private int completionRate;
}
