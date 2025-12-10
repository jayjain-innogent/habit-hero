package com.habit.hero.service.report;


import com.habit.hero.dao.HabitDAO;
import com.habit.hero.dao.HabitLogDAO;
import com.habit.hero.dto.report.*;
import com.habit.hero.entity.Habit;
import com.habit.hero.entity.HabitLog;
import com.habit.hero.enums.GoalType;
import com.habit.hero.enums.HabitStatus;
import com.habit.hero.exception.BadRequestException;
import com.habit.hero.mapper.ReportMapper;
import com.habit.hero.repository.HabitLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.habit.hero.enums.Cadence;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;


@Slf4j
@Service
public class ReportService {

    private final HabitDAO habitDAO;
    private final HabitLogDAO habitLogDao;
    private final HabitLogRepository habitLogRepository;
    private final ReportMapper reportMapper;

    @Autowired
    public ReportService(HabitDAO habitDAO, HabitLogDAO habitLogDao, HabitLogRepository habitLogRepository, ReportMapper reportMapper) {
        this.habitDAO = habitDAO;
        this.habitLogDao = habitLogDao;
        this.habitLogRepository = habitLogRepository;
        this.reportMapper = reportMapper;
    }

    public WeeklyReportResponse generateWeeklyReport(
            Long userId, LocalDate startDate, LocalDate endDate, Long habitId
    ) {
        log.info("Generating weekly report for userId: {}, habitId: {}, period: {} to {}",
                userId, habitId, startDate, endDate);
        try {
            if (userId == null || habitId == null || startDate == null || endDate == null) {
                throw new IllegalArgumentException("Required parameters cannot be null");
            }
            Optional<Habit> habitOpt = habitDAO.findByIdAndUserId(habitId, userId);
            if (habitOpt.isEmpty()) {
                log.warn("Habit not found for habitId: {} and userId: {}", habitId, userId);
                throw new IllegalArgumentException("Habit not found for userId: " + userId + " and habitId: " + habitId);
            }
            Habit habit = habitOpt.get();
            log.debug("Found habit: {} for user: {}", habit.getTitle(), userId);

            HabitReportData data = calculateHabitStats(habit, startDate, endDate);
            WeeklyReportResponse response = new WeeklyReportResponse();

            response.setWeekRange(new WeekRange(startDate, endDate));
            response.setHabit(data);
            response.setSummary(calculateSummary(habit));

            log.info("Weekly report generated successfully for habitId: {}", habitId);
            return response;
        } catch (NoSuchElementException e) {
            log.error("Habit not found for userId: {}, habitId: {}", userId, habitId);
            throw e;
        } catch (IllegalArgumentException e) {
            log.error("Invalid parameters for weekly report: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error generating weekly report for userId: {}, habitId: {}: {}",
                    userId, habitId, e.getMessage(), e);
            throw e;
        }
    }

    private HabitSummary calculateSummary(Habit habit) {
        log.debug("Calculating summary for habit: {}", habit.getId());

        List<HabitLog> habitLogList = habitLogDao.findByHabitId(habit.getId());
        if (habitLogList == null) {
            log.warn("No habit logs found for habitId: {}", habit.getId());
            return new HabitSummary(0, 0d, 0, 0, null);
        }

        HabitSummary summary = new HabitSummary();

        if (habit.getCadence() == null || habit.getStartDate() == null) {
            log.warn("Habit cadence is null for habitId: {}", habit.getId());
            return new HabitSummary(0, 0d, 0, 0, null);
        }

        LocalDate today = LocalDate.now();

        Integer totalDaysSinceStart = Math.toIntExact(ChronoUnit.DAYS.between(habit.getStartDate(), today));
        long totalWeeks = (totalDaysSinceStart + 6) / 7;
        long totalMonths = (totalDaysSinceStart + 29) / 30;
        Double expectedValue = 0d;
        Double completionCount = 0d;

        if (habit.getCadence() != Cadence.DAILY) {
            if (habit.getGoalType() != GoalType.OFF) {
                if (habit.getTargetValue() != null && habit.getSessionCount() != null) {
                    if (habit.getCadence() == Cadence.WEEKLY) {

                        expectedValue = habit.getTargetValue().multiply(BigDecimal.valueOf(habit.getSessionCount()).multiply(BigDecimal.valueOf(totalWeeks))).doubleValue();
                        summary.setTotalMissedDays((int) (totalWeeks * habit.getSessionCount() - habitLogList.size()));
                    } else if (habit.getCadence() == Cadence.MONTHLY) {
                        expectedValue = habit.getTargetValue().multiply(BigDecimal.valueOf(habit.getSessionCount()).multiply(BigDecimal.valueOf(totalMonths))).doubleValue();
                        summary.setTotalMissedDays((int) (totalMonths * habit.getSessionCount() - habitLogList.size()));
                    }
                    for (HabitLog log : habitLogList) {
                        if (log.getActualValue() != null) {
                            completionCount += log.getActualValue().doubleValue();
                        }
                    }
                }
            } else {
                if (habit.getCadence() == Cadence.WEEKLY) {
                    expectedValue = (double) (habit.getSessionCount() * totalWeeks);
                } else if (habit.getCadence() == Cadence.MONTHLY) {
                    expectedValue = (double) (habit.getSessionCount() * totalMonths);
                }
                completionCount = (double) habitLogList.size();
            }
        } else {
            if (habit.getGoalType() != GoalType.OFF) {
                expectedValue = (habit.getTargetValue().multiply(BigDecimal.valueOf(totalDaysSinceStart))).doubleValue();
                for (HabitLog log : habitLogList) {
                    if (log.getActualValue() != null) {
                        completionCount += log.getActualValue().doubleValue();
                    }
                }
            } else {
                expectedValue = (double) totalDaysSinceStart;
                completionCount = (double) habitLogList.size();
            }
            summary.setTotalMissedDays(totalDaysSinceStart - habitLogList.size());
        }

        double overallRate = expectedValue > 0 ? Math.round((completionCount / (double) expectedValue) * 10000) / 100.0 : 0.0;
        summary.setCompletionRate(Math.min(overallRate, 100));


        summary.setCurrentStreak(habit.getCurrentStreak());
        summary.setLongestStreak(habit.getLongestStreak());

        log.debug("Summary calculated for habit {}: completion rate {}%, streak {}",
                habit.getId(), summary.getCompletionRate(), summary.getCurrentStreak());

        List<LocalDateTime> dateAndTime = habitLogList.stream()
                .map(HabitLog::getCreatedAt)
                .distinct()
                .collect(Collectors.toList());
        List<BigDecimal> completionValue = habitLogList.stream()
                .map(HabitLog::getActualValue)
                .toList();
        CompletionData completionData = new CompletionData(dateAndTime, completionValue);
        summary.setHabitCompletionsData(completionData);
        return summary;
    }

    private HabitReportData calculateHabitStats(
            Habit habit, LocalDate startDate, LocalDate endDate
    ) {
        log.debug("Calculating habit stats for habit: {} between {} and {}",
                habit.getId(), startDate, endDate);

        List<HabitLog> thisWeekCompletions = habitLogDao.findByHabitIdAndLogDateBetweenOrderByLogDate(habit.getId(), startDate, endDate);
        log.info("Found {} completions for habit: {}", thisWeekCompletions.size(), habit.getId());
        LocalDate prevStart = startDate.minusWeeks(1);
        LocalDate prevEnd = endDate.minusWeeks(1);
        List<HabitLog> prevWeekCompletions = habitLogDao.findByHabitIdAndLogDateBetweenOrderByLogDate(habit.getId(), prevStart, prevEnd);

        log.debug("Found {} completions this week, {} completions previous week for habit: {}",
                thisWeekCompletions.size(), prevWeekCompletions.size(), habit.getId());

        HabitReportData data = new HabitReportData();

        data.setHabitId(habit.getId());
        data.setHabitName(habit.getTitle());
        data.setCategory(habit.getCategory());
        data.setCadence(habit.getCadence());
        data.setDescription(habit.getDescription());
        data.setGoalUnit(habit.getGoalUnit());
        data.setSessionCount(habit.getSessionCount());
        data.setStartDate(habit.getStartDate());
        data.setTargetValue(habit.getTargetValue());
        data.setStatus(habit.getStatus());

        Double expectedValue;
        Double thisWeekCompletionValue = 0d;
        Double prevWeekCompletionValue = 0d;

        WeekStats thisWeekStats = new WeekStats();
        WeekStats prevWeekStats = new WeekStats();

        if (habit.getCadence() != Cadence.DAILY) {
            if (habit.getGoalType() != GoalType.OFF) {
                expectedValue = habit.getTargetValue().multiply(BigDecimal.valueOf(habit.getSessionCount())).doubleValue();

                for (int i = 0; i < thisWeekCompletions.size(); i++) {
                    thisWeekCompletionValue += thisWeekCompletions.get(i).getActualValue().doubleValue();
                }

                for (int i = 0; i < prevWeekCompletions.size(); i++) {
                    prevWeekCompletionValue += prevWeekCompletions.get(i).getActualValue().doubleValue();
                }
            } else {
                expectedValue = habit.getSessionCount().doubleValue();
                thisWeekCompletionValue = (double) thisWeekCompletions.size();
                prevWeekCompletionValue = (double) prevWeekCompletions.size();
            }

            data.setExpectedValue(expectedValue);
            data.setExpectedDays(habit.getSessionCount());
            thisWeekStats.setCompletedDays(thisWeekCompletions.size());
            thisWeekStats.setMissedDays(habit.getSessionCount() - thisWeekCompletions.size());
            prevWeekStats.setMissedDays(habit.getSessionCount() - prevWeekCompletions.size());
            prevWeekStats.setCompletedDays(prevWeekCompletions.size());
        } else {
            if (habit.getGoalType() != GoalType.OFF) {
                expectedValue = habit.getTargetValue().multiply(BigDecimal.valueOf(7)).doubleValue();

                for (int i = 0; i < thisWeekCompletions.size(); i++) {
                    thisWeekCompletionValue += thisWeekCompletions.get(i).getActualValue().doubleValue();
                }

                for (int i = 0; i < prevWeekCompletions.size(); i++) {
                    prevWeekCompletionValue += prevWeekCompletions.get(i).getActualValue().doubleValue();
                }
            } else {
                expectedValue = 7d;
                thisWeekCompletionValue = (double) thisWeekCompletions.size();
                prevWeekCompletionValue = (double) prevWeekCompletions.size();

            }
            data.setExpectedValue(expectedValue);
            data.setExpectedDays(7);
            thisWeekStats.setMissedDays(7 - thisWeekCompletions.size());
            prevWeekStats.setMissedDays(7 - prevWeekCompletions.size());
            thisWeekStats.setCompletedDays(thisWeekCompletions.size());
            prevWeekStats.setCompletedDays(prevWeekCompletions.size());
        }

        double thisWeekRate = Math.round((thisWeekCompletionValue / (double) expectedValue) * 10000) / 100.0;
        double prevWeekRate = Math.round((prevWeekCompletionValue / (double) expectedValue) * 10000) / 100.0;

        thisWeekStats.setCompletionsValue(thisWeekCompletionValue);
        prevWeekStats.setCompletionsValue(prevWeekCompletionValue);

        thisWeekStats.setCompletionPercentage(Math.min(thisWeekRate, 100));
        prevWeekStats.setCompletionPercentage(Math.min(prevWeekRate, 100));

        data.setThisWeek(thisWeekStats);
        data.setPreviousWeek(prevWeekStats);

        WeekComparison comparison = new WeekComparison();
        comparison.setMissedDaysDiff(thisWeekStats.getMissedDays() - prevWeekStats.getMissedDays());
        comparison.setCompletionsDiff(thisWeekCompletionValue - prevWeekCompletionValue);
        comparison.setPercentageDiff(Math.round((thisWeekRate - prevWeekRate) * 100) / 100.0);
        comparison.setCompletedDaysDiff(thisWeekCompletions.size() - prevWeekCompletions.size());
        data.setWeekOverWeekChange(comparison);

        return data;
    }

    public ResponseEntity<HttpStatusCode> calculateStreak(long habitId, long userId) {
        Optional<Habit> habitOpt = habitDAO.findByIdAndUserId(habitId, userId);
        if (habitOpt.isEmpty()) {
            throw new IllegalArgumentException("Habit not found for userId: " + userId + " and habitId: " + habitId);
        }

        Habit habit = habitOpt.get();
        List<HabitLog> completions = habitLogDao.findByHabitId(habit.getId());

        // For first completion, streak = 1
        if (completions == null || completions.size() <= 1) {
            habit.setCurrentStreak(1);
            updateLongestStreak(habit, 1);
            habitDAO.save(habit);
            return new ResponseEntity<>(HttpStatus.OK);
        }

        // Get distinct dates and sort descending (newest first)
        List<LocalDate> dates = completions.stream()
                .map(HabitLog::getLogDate)
                .distinct()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());

        LocalDate today = LocalDate.now();
        int streak = 1; // Start with today's completion

        // Calculate consecutive streak from today backwards
        for (int i = 1; i < dates.size(); i++) {
            LocalDate currentDate = dates.get(i);
            LocalDate previousDate = dates.get(i - 1);

            if (isConsecutive(previousDate, currentDate, habit)) {
                streak++;
            } else {
                break; // Streak broken
            }
        }

        habit.setCurrentStreak(streak);
        updateLongestStreak(habit, streak);
        habitDAO.save(habit);

        return new ResponseEntity<>(HttpStatus.OK);
    }
    private boolean isConsecutive(LocalDate newer, LocalDate older, Habit habit) {
        long daysBetween = ChronoUnit.DAYS.between(older, newer);

        switch (habit.getCadence()) {
            case DAILY:
                return daysBetween == 1;
            case WEEKLY:
                int sessionsPerWeek = habit.getSessionCount() != null ? habit.getSessionCount() : 1;
                long expectedGap = 7 / sessionsPerWeek;
                return daysBetween <= expectedGap;
            case MONTHLY:
                int sessionsPerMonth = habit.getSessionCount() != null ? habit.getSessionCount() : 1;
                long expectedMonthlyGap = 30 / sessionsPerMonth;
                return daysBetween <= expectedMonthlyGap;
            default:
                return false;
        }
    }
    private void updateLongestStreak(Habit habit, int currentStreak) {
        Integer longestStreak = habit.getLongestStreak();
        if (longestStreak == null || currentStreak > longestStreak) {
            habit.setLongestStreak(currentStreak);
        }
    }

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
