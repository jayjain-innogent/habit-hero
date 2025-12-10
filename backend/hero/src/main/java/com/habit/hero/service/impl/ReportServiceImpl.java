package com.habit.hero.service.impl;

import com.habit.hero.dao.HabitDAO;
import com.habit.hero.dto.report.FullReportResponse;
import com.habit.hero.dto.report.HabitRowDto;
import com.habit.hero.dto.report.ReportCardDto;
import com.habit.hero.entity.Habit;
import com.habit.hero.entity.HabitLog;
import com.habit.hero.enums.Cadence;
import com.habit.hero.enums.HabitStatus; // Import Status
import com.habit.hero.exception.BadRequestException;
import com.habit.hero.mapper.ReportMapper;
import com.habit.hero.repository.HabitLogRepository;
import com.habit.hero.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final HabitDAO habitDAO;
    private final HabitLogRepository habitLogRepository;
    private final ReportMapper reportMapper;

    @Override
    public FullReportResponse getDashboardReport(Long userId, int year, int month, Integer week) {

        if (userId == null) throw new BadRequestException("UserId required");

        // Calculate Date Range
        LocalDate[] range = resolveDateRange(year, month, week);
        LocalDate start = range[0];
        LocalDate end = range[1];

        log.info("Generating Dashboard Report. user={} start={} end={}", userId, start, end);

        // Fetch ALL habits (Active + Paused) using generic findByUserId
        List<Habit> allHabits = habitDAO.findByUserId(userId);

        // Filter: Include Active/Paused, Exclude Archived, Exclude Future starts
        List<Habit> habits = allHabits.stream()
                .filter(h -> h.getStartDate() != null && !h.getStartDate().isAfter(end))
                .filter(h -> h.getStatus() != HabitStatus.ARCHIVED)
                .collect(Collectors.toList());

        // Fetch logs for the range
        List<HabitLog> allLogs = habitLogRepository.findByHabit_User_UserIdAndLogDateBetweenOrderByLogDate(userId, start, end);

        // Group logs by Habit ID
        Map<Long, List<HabitLog>> logsByHabit = allLogs.stream()
                .collect(Collectors.groupingBy(log -> log.getHabit().getId()));

        List<HabitRowDto> habitRows = new ArrayList<>();
        int grandTotalCompleted = 0;
        int grandTotalTarget = 0;
        int maxStreak = 0;
        String bestCategory = "General";
        int maxEfficiency = -1;

        // Process each habit for table rows
        for (Habit habit : habits) {
            List<HabitLog> habitLogs = logsByHabit.getOrDefault(habit.getId(), Collections.emptyList());

            int completedCount = habitLogs.size();
            int targetCount = calculateTarget(habit, start, end);

            grandTotalCompleted += completedCount;
            grandTotalTarget += targetCount;

            // Calculate Efficiency & Best Category
            int efficiency = (targetCount > 0) ? (completedCount * 100) / targetCount : 0;
            if (efficiency > maxEfficiency) {
                maxEfficiency = efficiency;
                bestCategory = habit.getCategory() != null ? habit.getCategory().name() : "General";
            }

            if (habit.getCurrentStreak() > maxStreak) {
                maxStreak = habit.getCurrentStreak();
            }

            habitRows.add(reportMapper.mapToHabitRow(habit, completedCount, targetCount));
        }

        // Overall Card Stats
        int perfectDays = calculatePerfectDays(allLogs);
        List<Boolean> weeklyTrend = calculateWeeklyTrend(allLogs, end);

        ReportCardDto cardDto = reportMapper.mapToReportCard(
                grandTotalCompleted,
                grandTotalTarget,
                maxStreak,
                perfectDays,
                bestCategory,
                weeklyTrend
        );

        String title = (week != null) ? "Weekly Report (Week " + week + ")" : "Monthly Report (" + start.getMonth() + ")";
        String motivation = generateMotivation(cardDto.getScorePercentage());

        return reportMapper.mapToFullReport(start, end, title, cardDto, habitRows, motivation);
    }

    // --- HELPER METHODS ---

    private int calculateTarget(Habit habit, LocalDate reportStart, LocalDate reportEnd) {
        LocalDate effectiveStart = reportStart;

        // If habit started mid-period, calculate target from start date
        if (habit.getStartDate() != null && habit.getStartDate().isAfter(reportStart)) {
            effectiveStart = habit.getStartDate();
        }

        if (effectiveStart.isAfter(reportEnd)) return 0;

        long daysAvailable = ChronoUnit.DAYS.between(effectiveStart, reportEnd) + 1;

        if (habit.getCadence() == Cadence.DAILY) {
            return (int) daysAvailable;
        } else if (habit.getCadence() == Cadence.WEEKLY) {
            int weeks = (int) Math.ceil(daysAvailable / 7.0);
            return weeks * (habit.getSessionCount() != null ? habit.getSessionCount() : 1);
        } else if (habit.getCadence() == Cadence.MONTHLY) {
            int months = (int) Math.ceil(daysAvailable / 30.0);
            return months * (habit.getSessionCount() != null ? habit.getSessionCount() : 1);
        }
        return 0;
    }

    private int calculatePerfectDays(List<HabitLog> allLogs) {
        return allLogs.stream().map(HabitLog::getLogDate).collect(Collectors.toSet()).size();
    }

    private List<Boolean> calculateWeeklyTrend(List<HabitLog> allLogs, LocalDate endDate) {
        List<Boolean> trend = new ArrayList<>();
        Set<LocalDate> activeDays = allLogs.stream().map(HabitLog::getLogDate).collect(Collectors.toSet());

        for (int i = 6; i >= 0; i--) {
            trend.add(activeDays.contains(endDate.minusDays(i)));
        }
        return trend;
    }

    private String generateMotivation(int score) {
        if (score >= 90) return "Incredible! You are creating a new version of yourself.";
        if (score >= 75) return "Great job! Keep this momentum going.";
        if (score >= 50) return "Good effort. Consistency is key!";
        return "Don't give up! Small steps lead to big changes.";
    }

    private LocalDate[] resolveDateRange(int year, int month, Integer week) {
        if (year <= 0) throw new BadRequestException("Invalid year");
        LocalDate today = LocalDate.now();

        if (year > today.getYear() + 1) throw new BadRequestException("Year cannot be in far future");

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
            if (month < 1 || month > 12) throw new BadRequestException("Invalid month");
            try {
                start = LocalDate.of(year, month, 1);
                end = start.withDayOfMonth(start.lengthOfMonth());
            } catch (Exception ex) {
                throw new BadRequestException("Invalid month/year combination");
            }
        }

        // Cap end date at today if report range extends into future
        if (end.isAfter(today) && !start.isAfter(today)) {
            end = today;
        }

        return new LocalDate[]{start, end};
    }
}