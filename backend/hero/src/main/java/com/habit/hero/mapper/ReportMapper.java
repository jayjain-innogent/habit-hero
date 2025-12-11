package com.habit.hero.mapper;

import com.habit.hero.dto.report.FullReportResponse;
import com.habit.hero.dto.report.HabitRowDto;
import com.habit.hero.dto.report.ReportCardDto;
import com.habit.hero.entity.Habit;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class ReportMapper {

    public HabitRowDto mapToHabitRow(Habit habit, int completedCount, int totalTarget) {
        int efficiency = calculatePercentage(completedCount, totalTarget);

        return HabitRowDto.builder()
                .habitName(habit.getTitle())
                .category(habit.getCategory() != null ? habit.getCategory().name() : "General") // Enum -> String
                .taskCompletedCount(completedCount)
                .totalTargetTask(totalTarget)
                .efficiency(efficiency)
                .grade(calculateGrade(efficiency))
                .build();
    }

    public ReportCardDto mapToReportCard(int totalCompleted, int totalTarget, int streak,
                                         int perfectDays, String bestCategory, List<Boolean> weeklyTrend, int consistencyScore, String momentum, int totalTimeInvested, int activeDaysCount, int longestStreak) {

        return ReportCardDto.builder()
                .totalCompleted(totalCompleted)
                .totalTarget(totalTarget)
                .scorePercentage(calculatePercentage(totalCompleted, totalTarget))
                .currentStreak(streak)
                .perfectDays(perfectDays)
                .bestCategory(bestCategory)
                .weeklyTrend(weeklyTrend)
                .consistencyScore(consistencyScore)
                .momentum(momentum) // Placeholder
                .totalTimeInvested(totalTimeInvested) // Placeholder
                .activeDaysCount(activeDaysCount) // Placeholder
                .longestStreak(longestStreak) // Placeholder
                .build();
    }

    public FullReportResponse mapToFullReport(LocalDate start, LocalDate end, String title,
                                              ReportCardDto card, List<HabitRowDto> rows, String motivation) {
        return FullReportResponse.builder()
                .startDate(start)
                .endDate(end)
                .reportTitle(title)
                .cardData(card)
                .tableData(rows)
                .motivationMessage(motivation)
                .build();
    }

    private int calculatePercentage(int obtained, int total) {
        if (total == 0) return 0;
        return Math.min(100, (int) Math.round(((double) obtained / total) * 100));
    }

    // Helper: Generate Grade
    private String calculateGrade(int percentage) {
        if (percentage >= 90) return "S";
        if (percentage >= 80) return "A";
        if (percentage >= 60) return "B";
        if (percentage >= 40) return "C";
        return "D";
    }
}