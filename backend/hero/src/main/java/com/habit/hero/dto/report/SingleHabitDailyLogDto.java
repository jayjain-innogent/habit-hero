package com.habit.hero.dto.report;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SingleHabitDailyLogDto {

    private String date;
    private boolean completed;

    // Goal (split)
    private Double targetValue;
    private String targetUnit;

    // Actual done (per day)
    private String actual;
    private String actualUnit;

    // Daily performance
    private int percentAchieved;

    private String notes;
}
