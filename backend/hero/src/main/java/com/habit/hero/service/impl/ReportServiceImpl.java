package com.habit.hero.service.impl;

import com.habit.hero.dao.HabitDAO;
import com.habit.hero.dao.HabitLogDAO;
import com.habit.hero.dto.report.OverallHabitReportDto;
import com.habit.hero.dto.report.SingleHabitDailyLogDto;
import com.habit.hero.dto.report.SingleHabitSummaryDto;
import com.habit.hero.entity.Habit;
import com.habit.hero.entity.HabitLog;
import com.habit.hero.exception.BadRequestException;
import com.habit.hero.mapper.ReportMapper;
import com.habit.hero.service.ReportService;
import com.habit.hero.utils.CsvUtil;
import com.opencsv.CSVWriter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final HabitDAO habitDAO;
    private final HabitLogDAO habitLogDAO;


    @Override
    public void downloadOverallReport(Long userId, int year, int month, Integer week, HttpServletResponse response) {

        if (userId == null) {
            throw new BadRequestException("UserId cannot be null");
        }

        LocalDate[] range = resolveDateRange(year, month, week);

        log.info("Generating OVERALL report. user={} start={} end={}", userId, range[0], range[1]);

        writeOverallCsv(userId, range[0], range[1], response);
    }


    @Override
    public void downloadSingleHabitReport(Long userId, Long habitId, int year, int month, Integer week, HttpServletResponse response) {

        if (userId == null || habitId == null) {
            throw new BadRequestException("UserId and HabitId cannot be null");
        }

        LocalDate[] range = resolveDateRange(year, month, week);

        log.info("Generating SINGLE HABIT report. user={} habit={} start={} end={}", userId, habitId, range[0], range[1]);

        writeSingleHabitCsv(userId, habitId, range[0], range[1], response);
    }


    private LocalDate[] resolveDateRange(int year, int month, Integer week) {

        if (year <= 0) throw new BadRequestException("Invalid year");

        LocalDate today = LocalDate.now();
        if (year > today.getYear()) throw new BadRequestException("Year cannot be in future");

        LocalDate start;
        LocalDate end;

        if (week != null) {

            if (week < 1 || week > 53) throw new BadRequestException("Invalid week number");

            try {
                LocalDate firstDay = LocalDate.of(year, 1, 1);
                int offset = firstDay.getDayOfWeek().getValue() - DayOfWeek.MONDAY.getValue();
                LocalDate firstMonday = firstDay.minusDays(offset);

                start = firstMonday.plusWeeks(week - 1);
                end = start.plusDays(6);

            } catch (Exception ex) {
                throw new BadRequestException("Invalid week/year combination");
            }

        } else {

            if (month < 1 || month > 12)
                throw new BadRequestException("Invalid month");

            try {
                start = LocalDate.of(year, month, 1);
                end = start.withDayOfMonth(start.lengthOfMonth());
            } catch (Exception ex) {
                throw new BadRequestException("Invalid month/year combination");
            }
        }

        if (start.isAfter(today)) throw new BadRequestException("Future date ranges not allowed");
        if (end.isAfter(today)) end = today;
        if (start.isAfter(end)) throw new BadRequestException("Invalid date range");

        return new LocalDate[]{start, end};
    }


    private void writeOverallCsv(Long userId, LocalDate start, LocalDate end, HttpServletResponse response) {

        CSVWriter writer = null;

        try {
            List<Habit> habits = habitDAO.findActiveHabitsSorted(userId);
            List<HabitLog> logs = habitLogDAO.findLogsForUserInDateRange(userId, start, end);

            Map<Long, List<HabitLog>> logsByHabit =
                    logs.stream().collect(Collectors.groupingBy(l -> l.getHabit().getId()));

            response.setContentType("text/csv");
            response.setHeader("Content-Disposition", "attachment; filename=overall_report.csv");

            writer = CsvUtil.createWriter(response.getOutputStream());

            CsvUtil.writeHeader(writer,
                    "Habit Name",
                    "Category",
                    "Cadence",
                    "Target Value",
                    "Target Unit",
                    "Total Completions",
                    "Total Missed Days",
                    "Completion %",
                    "Total Actual Value",
                    "Actual Unit"
            );

            int totalDays = (int) (end.toEpochDay() - start.toEpochDay() + 1);
            if (totalDays <= 0) totalDays = 1;

            for (Habit habit : habits) {

                List<HabitLog> habitLogs = logsByHabit.getOrDefault(habit.getId(), Collections.emptyList());

                int completions = countCompletions(habit, habitLogs);
                int missedDays = Math.max(0, totalDays - completions);

                int completionPercent =
                        (int) Math.round((completions * 100.0) / totalDays);

                Double targetValue = null;

                if (habit.getGoalType() != null && !"OFF".equals(habit.getGoalType().name())) {
                    if (habit.getTargetValue() != null) {
                        targetValue = habit.getTargetValue().doubleValue();
                    }
                }

                String targetUnit = habit.getGoalType() != null && !"OFF".equals(habit.getGoalType().name()) && habit.getGoalUnit() != null
                        ? habit.getGoalUnit().name()
                        : null;

                Double totalActualValue = calculateTotalActual(habit, habitLogs);

                String actualUnit = targetUnit;

                OverallHabitReportDto dto = ReportMapper.toOverallHabitRow(
                        habit,
                        completions,
                        missedDays,
                        completionPercent,
                        targetValue,
                        targetUnit,
                        totalActualValue,
                        actualUnit
                );

                CsvUtil.writeRow(writer, List.of(
                        dto.getHabitName(),
                        dto.getCategory(),
                        dto.getCadence(),
                        dto.getTargetValue() == null ? "" : dto.getTargetValue().toString(),
                        dto.getTargetUnit() == null ? "" : dto.getTargetUnit(),
                        String.valueOf(dto.getTotalCompletions()),
                        String.valueOf(dto.getTotalMissedDays()),
                        String.valueOf(dto.getCompletionPercent()),
                        dto.getTotalActualValue() == null ? "" : dto.getTotalActualValue().toString(),
                        dto.getActualUnit() == null ? "" : dto.getActualUnit()
                ));
            }

            writer.flush();

        } catch (Exception ex) {
            log.error("Error generating overall CSV", ex);
            throw new RuntimeException("Unable to generate overall report");
        } finally {
            CsvUtil.closeQuietly(writer);
        }
    }


    private void writeSingleHabitCsv(Long userId, Long habitId, LocalDate start, LocalDate end, HttpServletResponse response) {

        CSVWriter writer = null;

        try {
            Habit habit = habitDAO.findByIdAndUserId(habitId, userId)
                    .orElseThrow(() -> new BadRequestException("Habit not found"));

            List<HabitLog> logs = habitLogDAO.findByHabitIdAndDateRange(habitId, start, end);

            response.setContentType("text/csv");
            response.setHeader("Content-Disposition", "attachment; filename=habit_report.csv");

            writer = CsvUtil.createWriter(response.getOutputStream());

            int totalDays = (int) (end.toEpochDay() - start.toEpochDay() + 1);
            if (totalDays <= 0) totalDays = 1;

            int completions = countCompletions(habit, logs);
            int missedDays = Math.max(0, totalDays - completions);

            int completionPercent =
                    (int) Math.round(completions * 100.0 / totalDays);

            String periodText = start + " to " + end;

            Double targetValue = null;

            if (habit.getGoalType() != null && !"OFF".equals(habit.getGoalType().name())) {
                if (habit.getTargetValue() != null) {
                    targetValue = habit.getTargetValue().doubleValue();
                }
            }

            String targetUnit = habit.getGoalType() != null && !"OFF".equals(habit.getGoalType().name()) && habit.getGoalUnit() != null
                    ? habit.getGoalUnit().name()
                    : null;

            Double totalActualValue = calculateTotalActual(habit, logs);

            String actualUnit = targetUnit;

            SingleHabitSummaryDto summary = ReportMapper.toSummary(
                    habit,
                    periodText,
                    targetValue,
                    targetUnit,
                    completions,
                    missedDays,
                    completionPercent,
                    totalActualValue,
                    actualUnit
            );

            CsvUtil.writeRow(writer, List.of("Habit Name", summary.getHabitName()));
            CsvUtil.writeRow(writer, List.of("Period", summary.getSelectedPeriod()));
            CsvUtil.writeRow(writer, List.of("Target Value", summary.getTargetValue() == null ? "" : summary.getTargetValue().toString()));
            CsvUtil.writeRow(writer, List.of("Target Unit", summary.getTargetUnit() == null ? "" : summary.getTargetUnit()));
            CsvUtil.writeRow(writer, List.of("Total Completions", String.valueOf(summary.getTotalCompletions())));
            CsvUtil.writeRow(writer, List.of("Total Missed Days", String.valueOf(summary.getTotalMissedDays())));
            CsvUtil.writeRow(writer, List.of("Completion %", String.valueOf(summary.getCompletionPercent())));
            CsvUtil.writeRow(writer, List.of("Total Actual Value", summary.getTotalActualValue() == null ? "" : summary.getTotalActualValue().toString()));
            CsvUtil.writeRow(writer, List.of("Actual Unit", summary.getActualUnit() == null ? "" : summary.getActualUnit()));
            writer.writeNext(new String[]{});

            CsvUtil.writeHeader(writer,
                    "Date",
                    "Completed",
                    "Target Value",
                    "Target Unit",
                    "Actual",
                    "Actual Unit",
                    "% Achieved",
                    "Notes"
            );

            for (HabitLog log : logs) {

                boolean completed = isCompleted(habit, log);

                int percentAchieved = calculatePercent(habit, log, completed);

                SingleHabitDailyLogDto dto = ReportMapper.toDailyRow(
                        habit,
                        log,
                        targetValue,
                        targetUnit,
                        actualUnit,
                        completed,
                        percentAchieved
                );

                CsvUtil.writeRow(writer, List.of(
                        dto.getDate(),
                        dto.isCompleted() ? "Yes" : "No",
                        dto.getTargetValue() == null ? "" : dto.getTargetValue().toString(),
                        dto.getTargetUnit() == null ? "" : dto.getTargetUnit(),
                        dto.getActual(),
                        dto.getActualUnit() == null ? "" : dto.getActualUnit(),
                        dto.getPercentAchieved() < 0 ? "-" : String.valueOf(dto.getPercentAchieved()),
                        dto.getNotes()
                ));
            }

            writer.flush();

        } catch (Exception ex) {
            log.error("Error generating single habit CSV", ex);
            throw new RuntimeException("Unable to generate single habit report");
        } finally {
            CsvUtil.closeQuietly(writer);
        }
    }


    private boolean isCompleted(Habit habit, HabitLog log) {

        if (habit.getGoalType() != null && "OFF".equals(habit.getGoalType().name())) {
            return log.getActualValue() != null && log.getActualValue().intValue() == 1;
        }

        return log.getActualValue() != null;
    }


    private int countCompletions(Habit habit, List<HabitLog> logs) {

        return (int) logs.stream()
                .filter(l -> isCompleted(habit, l))
                .count();
    }


    private Double calculateTotalActual(Habit habit, List<HabitLog> logs) {

        if (habit.getGoalType() == null || "OFF".equals(habit.getGoalType().name())) {
            return null;
        }

        return logs.stream()
                .filter(l -> l.getActualValue() != null)
                .mapToDouble(l -> l.getActualValue().doubleValue())
                .sum();
    }


    private int calculatePercent(Habit habit, HabitLog log, boolean completed) {

        if (habit.getGoalType() == null || "OFF".equals(habit.getGoalType().name())) {
            return -1;
        }

        if (habit.getTargetValue() == null || habit.getTargetValue().doubleValue() == 0) {
            return -1;
        }

        if (!completed) {
            return 0;
        }

        double pct = (log.getActualValue().doubleValue() / habit.getTargetValue().doubleValue()) * 100;

        return (int) Math.min(100, Math.round(pct));
    }
}