package com.habit.hero.mapper;

import com.habit.hero.dto.report.OverallHabitReportDto;
import com.habit.hero.dto.report.SingleHabitDailyLogDto;
import com.habit.hero.dto.report.SingleHabitSummaryDto;
import com.habit.hero.entity.Habit;
import com.habit.hero.entity.HabitLog;

public class ReportMapper {

    public static OverallHabitReportDto toOverallHabitRow(
            Habit habit,
            int totalCompletions,
            int totalMissedDays,
            int completionPercent,
            Double targetValue,
            String targetUnit,
            Double totalActualValue,
            String actualUnit
    ) {
        return OverallHabitReportDto.builder()
                .habitName(habit.getTitle())
                .category(habit.getCategory().name())
                .cadence(habit.getCadence().name())
                .targetValue(targetValue)
                .targetUnit(targetUnit)
                .totalCompletions(totalCompletions)
                .totalMissedDays(totalMissedDays)
                .completionPercent(completionPercent)
                .totalActualValue(totalActualValue)
                .actualUnit(actualUnit)
                .build();
    }

    public static SingleHabitDailyLogDto toDailyRow(
            Habit habit,
            HabitLog log,
            Double targetValue,
            String targetUnit,
            String actualUnit,
            boolean completed,
            int percentAchieved
    ) {
        return SingleHabitDailyLogDto.builder()
                .date(log.getLogDate().toString())
                .completed(completed)
                .targetValue(targetValue)
                .targetUnit(targetUnit)
                .actual(log.getActualValue() == null ? "" : log.getActualValue().toString())
                .actualUnit(actualUnit)
                .percentAchieved(percentAchieved)
                .notes(log.getNote() == null ? "" : log.getNote())
                .build();
    }

    public static SingleHabitSummaryDto toSummary(
            Habit habit,
            String selectedPeriod,
            Double targetValue,
            String targetUnit,
            int totalCompletions,
            int totalMissedDays,
            int completionPercent,
            Double totalActualValue,
            String actualUnit
    ) {
        return SingleHabitSummaryDto.builder()
                .habitName(habit.getTitle())
                .selectedPeriod(selectedPeriod)
                .cadence(habit.getCadence().name())
                .targetValue(targetValue)
                .targetUnit(targetUnit)
                .totalCompletions(totalCompletions)
                .totalMissedDays(totalMissedDays)
                .completionPercent(completionPercent)
                .totalActualValue(totalActualValue)
                .actualUnit(actualUnit)
                .build();
    }
}
