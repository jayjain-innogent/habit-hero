//package com.habit.hero.service.impl;
//
//
//import com.habit.hero.dao.HabitDAO;
//import com.habit.hero.dao.HabitLogDAO;
//import com.habit.hero.dto.report.*;
//import com.habit.hero.entity.Habit;
//import com.habit.hero.entity.HabitLog;
//import com.habit.hero.enums.GoalType;
//import com.habit.hero.enums.HabitStatus;
//import com.habit.hero.exception.BadRequestException;
//import com.habit.hero.mapper.ReportMapper;
//import com.habit.hero.repository.HabitLogRepository;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.HttpStatusCode;
//import org.springframework.http.ResponseEntity;
//import org.springframework.stereotype.Service;
//import com.habit.hero.enums.Cadence;
//import com.habit.hero.service.ReportService;
//import java.math.BigDecimal;
//import java.time.DayOfWeek;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.temporal.ChronoUnit;
//import java.util.*;
//import java.util.stream.Collectors;
//
//
//@Slf4j
//@Service
//public class ReportServiceImpl implements ReportService {
//
//    private final HabitDAO habitDAO;
//    private final HabitLogDAO habitLogDao;
//    private final HabitLogRepository habitLogRepository;
//    private final ReportMapper reportMapper;
//
//    @Autowired
//    public ReportServiceImpl(HabitDAO habitDAO, HabitLogDAO habitLogDao, HabitLogRepository habitLogRepository, ReportMapper reportMapper) {
//        this.habitDAO = habitDAO;
//        this.habitLogDao = habitLogDao;
//        this.habitLogRepository = habitLogRepository;
//        this.reportMapper = reportMapper;
//    }
//
//
//    public WeeklyReportResponse generateWeeklyReport(
//            Long userId, LocalDate startDate, LocalDate endDate, Long habitId
//    ) {
//        log.info("Generating weekly report for userId: {}, habitId: {}, period: {} to {}",
//                userId, habitId, startDate, endDate);
//        try {
//            if (userId == null || habitId == null || startDate == null || endDate == null) {
//                throw new IllegalArgumentException("Required parameters cannot be null");
//            }
//            Optional<Habit> habitOpt = habitDAO.findByIdAndUserId(habitId, userId);
//            if (habitOpt.isEmpty()) {
//                log.warn("Habit not found for habitId: {} and userId: {}", habitId, userId);
//                throw new IllegalArgumentException("Habit not found for userId: " + userId + " and habitId: " + habitId);
//            }
//            Habit habit = habitOpt.get();
//            log.debug("Found habit: {} for user: {}", habit.getTitle(), userId);
//
//            HabitReportData data = calculateHabitStats(habit, startDate, endDate);
//            WeeklyReportResponse response = new WeeklyReportResponse();
//
//            response.setWeekRange(new WeekRange(startDate, endDate));
//            response.setHabit(data);
//            response.setSummary(calculateSummary(habit));
//
//            log.info("Weekly report generated successfully for habitId: {}", habitId);
//            return response;
//        } catch (NoSuchElementException e) {
//            log.error("Habit not found for userId: {}, habitId: {}", userId, habitId);
//            throw e;
//        } catch (IllegalArgumentException e) {
//            log.error("Invalid parameters for weekly report: {}", e.getMessage());
//            throw e;
//        } catch (Exception e) {
//            log.error("Error generating weekly report for userId: {}, habitId: {}: {}",
//                    userId, habitId, e.getMessage(), e);
//            throw e;
//        }
//    }
//
//    private HabitSummary calculateSummary(Habit habit) {
//        log.debug("Calculating summary for habit: {}", habit.getId());
//
//        try {
//            List<HabitLog> habitLogList = habitLogDao.findByHabitId(habit.getId());
//            if (habitLogList == null) {
//                habitLogList = Collections.emptyList();
//            }
//
//            HabitSummary summary = new HabitSummary();
//
//            if (habit.getCadence() == null || habit.getStartDate() == null) {
//                log.warn("Habit missing required fields for habitId: {}", habit.getId());
//                return createEmptySummary();
//            }
//
//            LocalDate today = LocalDate.now();
//            LocalDate effectiveEndDate = today.isBefore(habit.getStartDate()) ? habit.getStartDate() : today;
//
//            // Get unique completion days
//            Set<LocalDate> uniqueCompletionDays = habitLogList.stream()
//                    .map(HabitLog::getLogDate)
//                    .filter(Objects::nonNull)
//                    .collect(Collectors.toSet());
//
//            int expectedDays = calculateExpectedDays(habit, habit.getStartDate(), effectiveEndDate);
//            int missedDays = Math.max(0, expectedDays - uniqueCompletionDays.size());
//
//            Double expectedValue = calculateExpectedValue(habit, habit.getStartDate(), effectiveEndDate);
//            Double completionCount = calculateCompletionCount(habit, habitLogList);
//
//            summary.setTotalMissedDays(missedDays);
//
//            double overallRate = expectedValue > 0 ?
//                    Math.round((completionCount / expectedValue) * 10000) / 100.0 : 0.0;
//            summary.setCompletionRate(Math.min(overallRate, 100.0));
//
//            summary.setCurrentStreak(habit.getCurrentStreak() != null ? habit.getCurrentStreak() : 0);
//            summary.setLongestStreak(habit.getLongestStreak() != null ? habit.getLongestStreak() : 0);
//
//            log.debug("Summary calculated for habit {}: completion rate {}%, missed days {}",
//                    habit.getId(), summary.getCompletionRate(), summary.getTotalMissedDays());
//
//            List<LocalDateTime> dateAndTime = habitLogList.stream()
//                    .map(HabitLog::getCreatedAt)
//                    .filter(Objects::nonNull)
//                    .distinct()
//                    .collect(Collectors.toList());
//            List<BigDecimal> completionValue = habitLogList.stream()
//                    .map(HabitLog::getActualValue)
//                    .filter(Objects::nonNull)
//                    .collect(Collectors.toList());
//            CompletionData completionData = new CompletionData(dateAndTime, completionValue);
//            summary.setHabitCompletionsData(completionData);
//
//            return summary;
//        } catch (Exception e) {
//            log.error("Error calculating summary for habit {}: {}", habit.getId(), e.getMessage(), e);
//            return createEmptySummary();
//        }
//    }
//
//    private HabitSummary createEmptySummary() {
//        return new HabitSummary(0, 0.0, 0, 0, new CompletionData(Collections.emptyList(), Collections.emptyList()));
//    }
//
//    private int calculateExpectedDays(Habit habit, LocalDate startDate, LocalDate endDate) {
//        if (startDate.isAfter(endDate)) {
//            return 0;
//        }
//
//        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
//
//        switch (habit.getCadence()) {
//            case DAILY:
//                return (int) totalDays;
//            case WEEKLY:
//                long weeks = (totalDays + 6) / 7;
//                return (int) (weeks * (habit.getSessionCount() != null ? habit.getSessionCount() : 1));
//            case MONTHLY:
//                long months = (totalDays + 29) / 30;
//                return (int) (months * (habit.getSessionCount() != null ? habit.getSessionCount() : 1));
//            default:
//                return 0;
//        }
//    }
//
//    private Double calculateExpectedValue(Habit habit, LocalDate startDate, LocalDate endDate) {
//        if (habit.getGoalType() == GoalType.OFF) {
//            return (double) calculateExpectedDays(habit, startDate, endDate);
//        }
//
//        if (habit.getTargetValue() == null) {
//            return 0.0;
//        }
//
//        int expectedDays = calculateExpectedDays(habit, startDate, endDate);
//        return habit.getTargetValue().multiply(BigDecimal.valueOf(expectedDays)).doubleValue();
//    }
//
//    private Double calculateCompletionCount(Habit habit, List<HabitLog> habitLogList) {
//        if (habit.getGoalType() == GoalType.OFF) {
//            return (double) habitLogList.size();
//        }
//
//        return habitLogList.stream()
//                .map(HabitLog::getActualValue)
//                .filter(Objects::nonNull)
//                .mapToDouble(BigDecimal::doubleValue)
//                .sum();
//    }
//
//    private HabitReportData calculateHabitStats(
//            Habit habit, LocalDate startDate, LocalDate endDate
//    ) {
//        log.debug("Calculating habit stats for habit: {} between {} and {}",
//                habit.getId(), startDate, endDate);
//
//        try {
//            List<HabitLog> thisWeekCompletions = habitLogDao.findByHabitIdAndLogDateBetweenOrderByLogDate(
//                    habit.getId(), startDate, endDate);
//            if (thisWeekCompletions == null) thisWeekCompletions = Collections.emptyList();
//
//            LocalDate prevStart = startDate.minusWeeks(1);
//            LocalDate prevEnd = endDate.minusWeeks(1);
//            List<HabitLog> prevWeekCompletions = habitLogDao.findByHabitIdAndLogDateBetweenOrderByLogDate(
//                    habit.getId(), prevStart, prevEnd);
//            if (prevWeekCompletions == null) prevWeekCompletions = Collections.emptyList();
//
//            log.debug("Found {} completions this week, {} completions previous week for habit: {}",
//                    thisWeekCompletions.size(), prevWeekCompletions.size(), habit.getId());
//
//            HabitReportData data = new HabitReportData();
//            populateHabitBasicData(data, habit);
//
//            // Get unique completion days for accurate missed days calculation
//            Set<LocalDate> thisWeekUniqueDays = thisWeekCompletions.stream()
//                    .map(HabitLog::getLogDate)
//                    .filter(Objects::nonNull)
//                    .collect(Collectors.toSet());
//
//            Set<LocalDate> prevWeekUniqueDays = prevWeekCompletions.stream()
//                    .map(HabitLog::getLogDate)
//                    .filter(Objects::nonNull)
//                    .collect(Collectors.toSet());
//
//            // Calculate expected days for each week considering habit start date
//            int thisWeekExpectedDays = calculateExpectedDaysForPeriod(habit, startDate, endDate);
//            int prevWeekExpectedDays = calculateExpectedDaysForPeriod(habit, prevStart, prevEnd);
//
//            Double expectedValue = calculateExpectedValueForPeriod(habit, startDate, endDate);
//            Double thisWeekCompletionValue = calculateCompletionValueForPeriod(habit, thisWeekCompletions);
//            Double prevWeekCompletionValue = calculateCompletionValueForPeriod(habit, prevWeekCompletions);
//
//            WeekStats thisWeekStats = createWeekStats(
//                    thisWeekUniqueDays.size(),
//                    Math.max(0, thisWeekExpectedDays - thisWeekUniqueDays.size()),
//                    thisWeekCompletionValue,
//                    expectedValue
//            );
//
//            WeekStats prevWeekStats = createWeekStats(
//                    prevWeekUniqueDays.size(),
//                    Math.max(0, prevWeekExpectedDays - prevWeekUniqueDays.size()),
//                    prevWeekCompletionValue,
//                    calculateExpectedValueForPeriod(habit, prevStart, prevEnd)
//            );
//
//            data.setExpectedValue(expectedValue);
//            data.setExpectedDays(thisWeekExpectedDays);
//            data.setThisWeek(thisWeekStats);
//            data.setPreviousWeek(prevWeekStats);
//
//            WeekComparison comparison = createWeekComparison(thisWeekStats, prevWeekStats,
//                    thisWeekUniqueDays.size(), prevWeekUniqueDays.size());
//            data.setWeekOverWeekChange(comparison);
//
//            return data;
//        } catch (Exception e) {
//            log.error("Error calculating habit stats for habit {}: {}", habit.getId(), e.getMessage(), e);
//            throw new RuntimeException("Failed to calculate habit statistics", e);
//        }
//    }
//
//    private void populateHabitBasicData(HabitReportData data, Habit habit) {
//        data.setHabitId(habit.getId());
//        data.setHabitName(habit.getTitle());
//        data.setCategory(habit.getCategory());
//        data.setCadence(habit.getCadence());
//        data.setDescription(habit.getDescription());
//        data.setGoalUnit(habit.getGoalUnit());
//        data.setSessionCount(habit.getSessionCount());
//        data.setStartDate(habit.getStartDate());
//        data.setTargetValue(habit.getTargetValue());
//        data.setStatus(habit.getStatus());
//    }
//
//    private int calculateExpectedDaysForPeriod(Habit habit, LocalDate startDate, LocalDate endDate) {
//        // Adjust start date if habit started after period start
//        LocalDate effectiveStart = habit.getStartDate() != null && habit.getStartDate().isAfter(startDate)
//                ? habit.getStartDate() : startDate;
//
//        if (effectiveStart.isAfter(endDate)) {
//            return 0;
//        }
//
//        return calculateExpectedDays(habit, effectiveStart, endDate);
//    }
//
//    @Override
//    public Double calculateExpectedValueForPeriod(Habit habit, LocalDate startDate, LocalDate endDate) {
//        int expectedDays = calculateExpectedDaysForPeriod(habit, startDate, endDate);
//
//        if (habit.getGoalType() == GoalType.OFF) {
//            return (double) expectedDays;
//        }
//
//        if (habit.getTargetValue() == null) {
//            return 0.0;
//        }
//
//        return habit.getTargetValue().multiply(BigDecimal.valueOf(expectedDays)).doubleValue();
//    }
//
//     @Override
//      calculateCompletionValueForPeriod(Habit habit, List<HabitLog> completions) {
//        if (habit.getGoalType() == GoalType.OFF) {
//            return (double) completions.size();
//        }
//
//        return completions.stream()
//                .map(HabitLog::getActualValue)
//                .filter(Objects::nonNull)
//                .mapToDouble(BigDecimal::doubleValue)
//                .sum();
//    }
//
//    private WeekStats createWeekStats(int completedDays, int missedDays,
//                                      Double completionValue, Double expectedValue) {
//        WeekStats stats = new WeekStats();
//        stats.setCompletedDays(completedDays);
//        stats.setMissedDays(missedDays);
//        stats.setCompletionsValue(completionValue);
//
//        double rate = expectedValue > 0 ?
//                Math.round((completionValue / expectedValue) * 10000) / 100.0 : 0.0;
//        stats.setCompletionPercentage(Math.min(rate, 100.0));
//
//        return stats;
//    }
//
//    private WeekComparison createWeekComparison(WeekStats thisWeek, WeekStats prevWeek,
//                                                int thisWeekUniqueDays, int prevWeekUniqueDays) {
//        WeekComparison comparison = new WeekComparison();
//        comparison.setMissedDaysDiff(thisWeek.getMissedDays() - prevWeek.getMissedDays());
//        comparison.setCompletionsDiff(thisWeek.getCompletionsValue() - prevWeek.getCompletionsValue());
//        comparison.setPercentageDiff(
//                Math.round((thisWeek.getCompletionPercentage() - prevWeek.getCompletionPercentage()) * 100) / 100.0);
//        comparison.setCompletedDaysDiff(thisWeekUniqueDays - prevWeekUniqueDays);
//        return comparison;
//    }
//
//    public ResponseEntity<HttpStatusCode> calculateStreak(long habitId, long userId) {
//        try {
//            Optional<Habit> habitOpt = habitDAO.findByIdAndUserId(habitId, userId);
//            if (habitOpt.isEmpty()) {
//                throw new IllegalArgumentException("Habit not found for userId: " + userId + " and habitId: " + habitId);
//            }
//
//            Habit habit = habitOpt.get();
//            List<HabitLog> completions = habitLogDao.findByHabitId(habit.getId());
//
//            if (completions == null) {
//                completions = Collections.emptyList();
//            }
//
//            int calculatedStreak = calculateStreakFromLogs(habit, completions);
//
//            habit.setCurrentStreak(calculatedStreak);
//            updateLongestStreak(habit, calculatedStreak);
//            habitDAO.save(habit);
//
//            return new ResponseEntity<>(HttpStatus.OK);
//        } catch (Exception e) {
//            log.error("Error calculating streak for habit {} and user {}: {}", habitId, userId, e.getMessage(), e);
//            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }
//
//    private int calculateStreakFromLogs(Habit habit, List<HabitLog> completions) {
//        if (completions.isEmpty()) {
//            return 0;
//        }
//
//        // Get distinct dates and sort descending (newest first)
//        List<LocalDate> dates = completions.stream()
//                .map(HabitLog::getLogDate)
//                .filter(Objects::nonNull)
//                .distinct()
//                .sorted(Comparator.reverseOrder())
//                .collect(Collectors.toList());
//
//        if (dates.isEmpty()) {
//            return 0;
//        }
//
//        // For single completion
//        if (dates.size() == 1) {
//            return 1;
//        }
//
//        int streak = 1; // Start with most recent completion
//
//        // Calculate consecutive streak from newest backwards
//        for (int i = 1; i < dates.size(); i++) {
//            LocalDate newerDate = dates.get(i - 1);
//            LocalDate olderDate = dates.get(i);
//
//            if (isConsecutiveForCadence(newerDate, olderDate, habit)) {
//                streak++;
//            } else {
//                break; // Streak broken
//            }
//        }
//
//        return streak;
//    }
//    private void updateLongestStreak(Habit habit, int currentStreak) {
//        try {
//            Integer longestStreak = habit.getLongestStreak();
//            if (longestStreak == null || currentStreak > longestStreak) {
//                habit.setLongestStreak(currentStreak);
//                log.debug("Updated longest streak for habit {} to {}", habit.getId(), currentStreak);
//            }
//        } catch (Exception e) {
//            log.error("Error updating longest streak for habit {}: {}", habit.getId(), e.getMessage());
//        }
//    }
//
//    @Override
//    public FullReportResponse getDashboardReport(Long userId, int year, int month, Integer week) {
//        try {
//            if (userId == null) {
//                throw new BadRequestException("UserId required");
//            }
//
//            LocalDate[] range = resolveDateRange(year, month, week);
//            LocalDate start = range[0];
//            LocalDate end = range[1];
//            LocalDate today = LocalDate.now();
//
//            log.info("Generating Dashboard Report. user={} start={} end={}", userId, start, end);
//
//            // Fetch active habits only
//            List<Habit> allHabits = habitDAO.findByUserId(userId);
//            if (allHabits == null) {
//                allHabits = Collections.emptyList();
//            }
//
//            List<Habit> habits = allHabits.stream()
//                    .filter(Objects::nonNull)
//                    .filter(h -> h.getStartDate() != null && !h.getStartDate().isAfter(end))
//                    .filter(h -> h.getStatus() == HabitStatus.ACTIVE)
//                    .collect(Collectors.toList());
//
//            if (habits.isEmpty()) {
//                log.info("No active habits found for user {}", userId);
//                return createEmptyDashboard(start, end, week);
//            }
//
//            // Fetch logs for the range
//            List<HabitLog> allLogs = habitLogRepository.findByHabit_User_UserIdAndLogDateBetweenOrderByLogDate(userId, start, end);
//            if (allLogs == null) {
//                allLogs = Collections.emptyList();
//            }
//
//            Map<Long, List<HabitLog>> logsByHabit = allLogs.stream()
//                    .filter(Objects::nonNull)
//                    .filter(log -> log.getHabit() != null)
//                    .collect(Collectors.groupingBy(log -> log.getHabit().getId()));
//
//            // Calculate professional metrics
//            DashboardMetrics metrics = calculateDashboardMetrics(habits, logsByHabit, start, end, today);
//
//            // Create habit rows
//            List<HabitRowDto> habitRows = habits.stream()
//                    .filter(Objects::nonNull)
//                    .map(habit -> {
//                        try {
//                            return createHabitRow(habit, logsByHabit.getOrDefault(habit.getId(), Collections.emptyList()), start, end);
//                        } catch (Exception e) {
//                            log.error("Error creating habit row for habit {}: {}", habit.getId(), e.getMessage());
//                            return null;
//                        }
//                    })
//                    .filter(Objects::nonNull)
//                    .collect(Collectors.toList());
//
//            ReportCardDto cardDto = reportMapper.mapToReportCard(
//                    metrics.totalCompleted,
//                    metrics.totalTarget,
//                    metrics.currentStreak,
//                    metrics.perfectDays,
//                    metrics.bestCategory != null ? metrics.bestCategory : "General",
//                    metrics.weeklyTrend != null ? metrics.weeklyTrend : Arrays.asList(false, false, false, false, false, false, false),
//                    metrics.consistencyScore,
//                    metrics.momentum != null ? metrics.momentum : "",
//                    metrics.totalTimeInvested,
//                    metrics.activeDaysCount,
//                    metrics.longestStreak
//            );
//
//            String title = (week != null) ? "Weekly Dashboard (Week " + week + ")" : "Monthly Dashboard (" + start.getMonth() + ")";
//            String motivation = generatePersonalizedMotivation(metrics);
//
//            log.info("Dashboard report generated successfully for user {}", userId);
//            return reportMapper.mapToFullReport(start, end, title, cardDto, habitRows, motivation);
//
//        } catch (BadRequestException e) {
//            log.error("Bad request for dashboard report: {}", e.getMessage());
//            throw e;
//        } catch (Exception e) {
//            log.error("Error generating dashboard report for user {}: {}", userId, e.getMessage(), e);
//            throw new RuntimeException("Failed to generate dashboard report", e);
//        }
//    }
//
//    // --- HELPER METHODS ---
//
//    private int calculateTarget(Habit habit, LocalDate reportStart, LocalDate reportEnd) {
//        try {
//            if (habit == null || habit.getCadence() == null || reportStart == null || reportEnd == null) {
//                return 0;
//            }
//
//            LocalDate effectiveStart = reportStart;
//
//            // If habit started mid-period, calculate target from start date
//            if (habit.getStartDate() != null && habit.getStartDate().isAfter(reportStart)) {
//                effectiveStart = habit.getStartDate();
//            }
//
//            if (effectiveStart.isAfter(reportEnd)) return 0;
//
//            return calculateExpectedDays(habit, effectiveStart, reportEnd);
//        } catch (Exception e) {
//            log.error("Error calculating target for habit {}: {}", habit != null ? habit.getId() : "null", e.getMessage());
//            return 0;
//        }
//    }
//
//    private DashboardMetrics calculateDashboardMetrics(List<Habit> habits, Map<Long, List<HabitLog>> logsByHabit,
//                                                       LocalDate start, LocalDate end, LocalDate today) {
//        DashboardMetrics metrics = new DashboardMetrics();
//
//        try {
//            if (habits == null || habits.isEmpty()) {
//                return createEmptyMetrics();
//            }
//
//            int totalCompleted = 0;
//            int totalTarget = 0;
//            int longestCurrentStreak = 0;
//            int totalLongestStreak = 0;
//            Map<String, CategoryStats> categoryStats = new HashMap<>();
//
//            for (Habit habit : habits) {
//                if (habit == null) continue;
//
//                List<HabitLog> habitLogs = logsByHabit.getOrDefault(habit.getId(), Collections.emptyList());
//
//                // Count unique completion days instead of total logs
//                Set<LocalDate> uniqueCompletionDays = habitLogs.stream()
//                        .map(HabitLog::getLogDate)
//                        .filter(Objects::nonNull)
//                        .collect(Collectors.toSet());
//
//                int completed = uniqueCompletionDays.size();
//                int target = calculateTarget(habit, start, end);
//
//                totalCompleted += completed;
//                totalTarget += target;
//
//                // Calculate current streak
//                int currentStreak = calculateCurrentStreak(habit, today);
//                longestCurrentStreak = Math.max(longestCurrentStreak, currentStreak);
//
//                // Track longest streak across all habits
//                Integer habitLongestStreak = habit.getLongestStreak();
//                if (habitLongestStreak != null) {
//                    totalLongestStreak = Math.max(totalLongestStreak, habitLongestStreak);
//                }
//
//                // Category performance tracking
//                String category = habit.getCategory() != null ? habit.getCategory().name() : "General";
//                categoryStats.computeIfAbsent(category, k -> new CategoryStats())
//                        .addHabit(completed, target);
//            }
//
//            metrics.totalCompleted = totalCompleted;
//            metrics.totalTarget = totalTarget;
//            metrics.currentStreak = longestCurrentStreak;
//            metrics.longestStreak = totalLongestStreak;
//            metrics.bestCategory = findBestCategory(categoryStats);
//            metrics.perfectDays = calculatePerfectDays(habits, logsByHabit, start, end);
//            metrics.weeklyTrend = calculateWeeklyTrend(habits, logsByHabit, end);
//            metrics.activeDaysCount = calculateActiveDays(logsByHabit, start, end);
//
//            return metrics;
//        } catch (Exception e) {
//            log.error("Error calculating dashboard metrics: {}", e.getMessage(), e);
//            return createEmptyMetrics();
//        }
//    }
//
//    private DashboardMetrics createEmptyMetrics() {
//        DashboardMetrics metrics = new DashboardMetrics();
//        metrics.totalCompleted = 0;
//        metrics.totalTarget = 0;
//        metrics.currentStreak = 0;
//        metrics.longestStreak = 0;
//        metrics.perfectDays = 0;
//        metrics.bestCategory = "General";
//        metrics.weeklyTrend = Arrays.asList(false, false, false, false, false, false, false);
//        metrics.activeDaysCount = 0;
//        return metrics;
//    }
//
//    private int calculateActiveDays(Map<Long, List<HabitLog>> logsByHabit, LocalDate start, LocalDate end) {
//        Set<LocalDate> allActiveDays = new HashSet<>();
//
//        for (List<HabitLog> logs : logsByHabit.values()) {
//            logs.stream()
//                    .map(HabitLog::getLogDate)
//                    .filter(Objects::nonNull)
//                    .filter(date -> !date.isBefore(start) && !date.isAfter(end))
//                    .forEach(allActiveDays::add);
//        }
//
//        return allActiveDays.size();
//    }
//
//    private int calculateCurrentStreak(Habit habit, LocalDate today) {
//        try {
//            List<HabitLog> logs = habitLogDao.findByHabitId(habit.getId());
//            if (logs == null || logs.isEmpty()) return 0;
//
//            Set<LocalDate> completedDates = logs.stream()
//                    .map(HabitLog::getLogDate)
//                    .filter(Objects::nonNull)
//                    .collect(Collectors.toSet());
//
//            if (completedDates.isEmpty()) return 0;
//
//            int streak = 0;
//            LocalDate checkDate = today;
//
//            // For daily habits, check consecutive days
//            if (habit.getCadence() == Cadence.DAILY) {
//                while (completedDates.contains(checkDate) && !checkDate.isBefore(habit.getStartDate())) {
//                    streak++;
//                    checkDate = checkDate.minusDays(1);
//                }
//            } else {
//                // For weekly/monthly habits, use different logic
//                streak = calculateNonDailyStreak(habit, completedDates, today);
//            }
//
//            return streak;
//        } catch (Exception e) {
//            log.error("Error calculating current streak for habit {}: {}", habit.getId(), e.getMessage());
//            return 0;
//        }
//    }
//
//    private int calculateNonDailyStreak(Habit habit, Set<LocalDate> completedDates, LocalDate today) {
//        List<LocalDate> sortedDates = completedDates.stream()
//                .sorted(Comparator.reverseOrder())
//                .collect(Collectors.toList());
//
//        if (sortedDates.isEmpty()) return 0;
//
//        int streak = 1;
//        for (int i = 1; i < sortedDates.size(); i++) {
//            if (isConsecutiveForCadence(sortedDates.get(i-1), sortedDates.get(i), habit)) {
//                streak++;
//            } else {
//                break;
//            }
//        }
//
//        return streak;
//    }
//
//    private boolean isConsecutiveForCadence(LocalDate newer, LocalDate older, Habit habit) {
//        long daysBetween = ChronoUnit.DAYS.between(older, newer);
//        int sessionCount = habit.getSessionCount() != null ? habit.getSessionCount() : 1;
//
//        switch (habit.getCadence()) {
//            case DAILY:
//                return daysBetween == 1;
//            case WEEKLY:
//                return daysBetween <= (7 / sessionCount) + 1; // Allow some flexibility
//            case MONTHLY:
//                return daysBetween <= (30 / sessionCount) + 2; // Allow some flexibility
//            default:
//                return false;
//        }
//    }
//
//    private String findBestCategory(Map<String, CategoryStats> categoryStats) {
//        return categoryStats.entrySet().stream()
//                .max(Comparator.comparing(entry -> entry.getValue().getSuccessRate()))
//                .map(Map.Entry::getKey)
//                .orElse("General");
//    }
//
//    private int calculatePerfectDays(List<Habit> habits, Map<Long, List<HabitLog>> logsByHabit, LocalDate start, LocalDate end) {
//        try {
//            if (habits == null || habits.isEmpty()) return 0;
//
//            int perfectDays = 0;
//            for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
//                final LocalDate currentDate = date;
//
//                // Get habits that should be active on this date
//                List<Habit> activeHabits = habits.stream()
//                        .filter(habit -> habit.getStartDate() != null && !habit.getStartDate().isAfter(currentDate))
//                        .collect(Collectors.toList());
//
//                if (activeHabits.isEmpty()) {
//                    continue; // No habits active on this day
//                }
//
//                boolean isPerfectDay = activeHabits.stream()
//                        .allMatch(habit -> {
//                            List<HabitLog> habitLogs = logsByHabit.getOrDefault(habit.getId(), Collections.emptyList());
//                            return habitLogs.stream()
//                                    .anyMatch(log -> log.getLogDate() != null && log.getLogDate().equals(currentDate));
//                        });
//
//                if (isPerfectDay) perfectDays++;
//            }
//            return perfectDays;
//        } catch (Exception e) {
//            log.error("Error calculating perfect days: {}", e.getMessage());
//            return 0;
//        }
//    }
//
//    private HabitRowDto createHabitRow(Habit habit, List<HabitLog> logs, LocalDate start, LocalDate end) {
//        int completed = logs.size();
//        int target = calculateTarget(habit, start, end);
//        return reportMapper.mapToHabitRow(habit, completed, target);
//    }
//
//    private FullReportResponse createEmptyDashboard(LocalDate start, LocalDate end, Integer week) {
//        ReportCardDto emptyCard = reportMapper.mapToReportCard(0, 0, 0, 0, "General",
//                Arrays.asList(false, false, false, false, false, false, false),0,"",0,0,0);
//        String title = (week != null) ? "Weekly Dashboard (Week " + week + ")" : "Monthly Dashboard";
//        return reportMapper.mapToFullReport(start, end, title, emptyCard, Collections.emptyList(),
//                "Start building habits to see your progress!");
//    }
//
//    private String generatePersonalizedMotivation(DashboardMetrics metrics) {
//        int completionRate = metrics.totalTarget > 0 ? (metrics.totalCompleted * 100) / metrics.totalTarget : 0;
//
//        if (metrics.currentStreak >= 7) {
//            return "🔥 Amazing " + metrics.currentStreak + "-day streak! You're building unstoppable momentum.";
//        } else if (completionRate >= 80) {
//            return "⭐ Excellent consistency! You're " + completionRate + "% on track to your goals.";
//        } else if (completionRate >= 60) {
//            return "💪 Good progress! Keep pushing - you're " + completionRate + "% there.";
//        } else if (metrics.perfectDays > 0) {
//            return "🎯 You had " + metrics.perfectDays + " perfect days! Build on that success.";
//        } else {
//            return "🌱 Every expert was once a beginner. Start small, stay consistent!";
//        }
//    }
//
//    private static class DashboardMetrics {
//        int totalCompleted;
//        int totalTarget;
//        int currentStreak;
//        int perfectDays;
//        String bestCategory;
//        List<Boolean> weeklyTrend;
//        int consistencyScore;
//        String momentum;
//        String difficultyBalance;
//        int totalTimeInvested;
//        double recoveryRate;
//        int longestStreak;
//        int activeDaysCount;
//    }
//
//    private static class CategoryStats {
//        private int totalCompleted = 0;
//        private int totalTarget = 0;
//
//        void addHabit(int completed, int target) {
//            this.totalCompleted += completed;
//            this.totalTarget += target;
//        }
//
//        double getSuccessRate() {
//            return totalTarget > 0 ? (double) totalCompleted / totalTarget : 0;
//        }
//    }
//
//    private List<Boolean> calculateWeeklyTrend(List<Habit> habits, Map<Long, List<HabitLog>> logsByHabit, LocalDate endDate) {
//        List<Boolean> trend = new ArrayList<>();
//
//        try {
//            if (habits == null || habits.isEmpty() || endDate == null) {
//                return Arrays.asList(false, false, false, false, false, false, false);
//            }
//
//            for (int i = 6; i >= 0; i--) {
//                LocalDate checkDate = endDate.minusDays(i);
//
//                long activeHabitsForDay = habits.stream()
//                        .filter(habit -> habit.getStartDate() != null && !habit.getStartDate().isAfter(checkDate))
//                        .count();
//
//                if (activeHabitsForDay == 0) {
//                    trend.add(false);
//                    continue;
//                }
//
//                long completedHabitsForDay = habits.stream()
//                        .filter(habit -> habit.getStartDate() != null && !habit.getStartDate().isAfter(checkDate))
//                        .filter(habit -> {
//                            List<HabitLog> habitLogs = logsByHabit.getOrDefault(habit.getId(), Collections.emptyList());
//                            return habitLogs.stream()
//                                    .anyMatch(log -> log.getLogDate() != null && log.getLogDate().equals(checkDate));
//                        })
//                        .count();
//
//                boolean goodDay = (double) completedHabitsForDay / activeHabitsForDay >= 0.5;
//                trend.add(goodDay);
//            }
//            return trend;
//        } catch (Exception e) {
//            log.error("Error calculating weekly trend: {}", e.getMessage());
//            return Arrays.asList(false, false, false, false, false, false, false);
//        }
//    }
//
//    private String generateMotivation(int score) {
//        if (score >= 90) return "Incredible! You are creating a new version of yourself.";
//        if (score >= 75) return "Great job! Keep this momentum going.";
//        if (score >= 50) return "Good effort. Consistency is key!";
//        return "Don't give up! Small steps lead to big changes.";
//    }
//
//    private LocalDate[] resolveDateRange(int year, int month, Integer week) {
//        if (year <= 0) throw new BadRequestException("Invalid year");
//        LocalDate today = LocalDate.now();
//
//        if (year > today.getYear() + 1) throw new BadRequestException("Year cannot be in far future");
//
//        LocalDate start;
//        LocalDate end;
//
//        if (week != null) {
//            if (week < 1 || week > 53) throw new BadRequestException("Invalid week number");
//            try {
//                LocalDate firstDay = LocalDate.of(year, month, 1);
//                int offset = firstDay.getDayOfWeek().getValue() - DayOfWeek.MONDAY.getValue();
//                LocalDate firstMonday = firstDay.minusDays(offset);
//                start = firstMonday.plusWeeks(week - 1);
//                end = start.plusDays(6);
//            } catch (Exception ex) {
//                throw new BadRequestException("Invalid week/year combination");
//            }
//        } else {
//            if (month < 1 || month > 12) throw new BadRequestException("Invalid month");
//            try {
//                start = LocalDate.of(year, month, 1);
//                end = start.withDayOfMonth(start.lengthOfMonth());
//            } catch (Exception ex) {
//                throw new BadRequestException("Invalid month/year combination");
//            }
//        }
//
//        // Cap end date at today if report range extends into future
//        if (end.isAfter(today) && !start.isAfter(today)) {
//            end = today;
//        }
//
//        return new LocalDate[]{start, end};
//    }
//}
