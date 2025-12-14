package com.habit.hero.dto.report;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ReportCardDto {

    private int totalCompleted;

    private int totalTarget;

    private int scorePercentage;

    private int currentStreak;

    private int perfectDays;
    private int consistencyScore;
    private String momentum;
    private int totalTimeInvested;
    private int activeDaysCount;
    private int longestStreak;
    private String bestCategory;

    private List<Boolean> weeklyTrend;
}