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

        LocalDate[] range = resolveDateRange(year, month, week);
        LocalDate start = range[0];
        LocalDate end = range[1];
        LocalDate today = LocalDate.now();

        log.info("Generating Dashboard Report. user={} start={} end={}", userId, start, end);

        // Fetch active habits only
        List<Habit> habits = habitDAO.findByUserId(userId).stream()
                .filter(h -> h.getStartDate() != null && !h.getStartDate().isAfter(end))
                .filter(h -> h.getStatus() == HabitStatus.ACTIVE)
                .collect(Collectors.toList());

        if (habits.isEmpty()) {
            return createEmptyDashboard(start, end, week);
        }

        // Fetch logs for the range
        List<HabitLog> allLogs = habitLogRepository.findByHabit_User_UserIdAndLogDateBetweenOrderByLogDate(userId, start, end);
        Map<Long, List<HabitLog>> logsByHabit = allLogs.stream()
                .collect(Collectors.groupingBy(log -> log.getHabit().getId()));

        // Calculate professional metrics
        DashboardMetrics metrics = calculateDashboardMetrics(habits, logsByHabit, start, end, today);
        
        // Create habit rows
        List<HabitRowDto> habitRows = habits.stream()
                .map(habit -> createHabitRow(habit, logsByHabit.getOrDefault(habit.getId(), Collections.emptyList()), start, end))
                .collect(Collectors.toList());

        ReportCardDto cardDto = reportMapper.mapToReportCard(
                metrics.totalCompleted,
                metrics.totalTarget,
                metrics.currentStreak,
                metrics.perfectDays,
                metrics.bestCategory,
                metrics.weeklyTrend,
                metrics.consistencyScore,
                metrics.momentum,
                metrics.totalTimeInvested,
                metrics.activeDaysCount,
                metrics.longestStreak
        );

        String title = (week != null) ? "Weekly Dashboard (Week " + week + ")" : "Monthly Dashboard (" + start.getMonth() + ")";
        String motivation = generatePersonalizedMotivation(metrics);

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

    private DashboardMetrics calculateDashboardMetrics(List<Habit> habits, Map<Long, List<HabitLog>> logsByHabit, 
                                                      LocalDate start, LocalDate end, LocalDate today) {
        DashboardMetrics metrics = new DashboardMetrics();
        
        int totalCompleted = 0;
        int totalTarget = 0;
        int longestCurrentStreak = 0;
        Map<String, CategoryStats> categoryStats = new HashMap<>();
        
        for (Habit habit : habits) {
            List<HabitLog> habitLogs = logsByHabit.getOrDefault(habit.getId(), Collections.emptyList());
            int completed = habitLogs.size();
            int target = calculateTarget(habit, start, end);
            
            totalCompleted += completed;
            totalTarget += target;
            
            // Calculate current streak
            int currentStreak = calculateCurrentStreak(habit, today);
            longestCurrentStreak = Math.max(longestCurrentStreak, currentStreak);
            
            // Category performance tracking
            String category = habit.getCategory() != null ? habit.getCategory().name() : "General";
            categoryStats.computeIfAbsent(category, k -> new CategoryStats())
                    .addHabit(completed, target);
        }
        
        metrics.totalCompleted = totalCompleted;
        metrics.totalTarget = totalTarget;
        metrics.currentStreak = longestCurrentStreak;
        metrics.bestCategory = findBestCategory(categoryStats);
        metrics.perfectDays = calculatePerfectDays(habits, logsByHabit, start, end);
        metrics.weeklyTrend = calculateWeeklyTrend(habits, logsByHabit, end);
        
        return metrics;
    }
    
    private int calculateCurrentStreak(Habit habit, LocalDate today) {
        List<HabitLog> logs = habitLogDao.findByHabitId(habit.getId());
        if (logs.isEmpty()) return 0;
        
        Set<LocalDate> completedDates = logs.stream()
                .map(HabitLog::getLogDate)
                .collect(Collectors.toSet());
        
        int streak = 0;
        LocalDate checkDate = today;
        
        while (completedDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }
        
        return streak;
    }
    
    private String findBestCategory(Map<String, CategoryStats> categoryStats) {
        return categoryStats.entrySet().stream()
                .max(Comparator.comparing(entry -> entry.getValue().getSuccessRate()))
                .map(Map.Entry::getKey)
                .orElse("General");
    }
    
    private int calculatePerfectDays(List<Habit> habits, Map<Long, List<HabitLog>> logsByHabit, LocalDate start, LocalDate end) {
        if (habits.isEmpty()) return 0;
        
        int perfectDays = 0;
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            final LocalDate currentDate = date;
            
            boolean isPerfectDay = habits.stream()
                    .filter(habit -> !habit.getStartDate().isAfter(currentDate))
                    .allMatch(habit -> logsByHabit.getOrDefault(habit.getId(), Collections.emptyList())
                            .stream().anyMatch(log -> log.getLogDate().equals(currentDate)));
            
            if (isPerfectDay) perfectDays++;
        }
        return perfectDays;
    }
    
    private HabitRowDto createHabitRow(Habit habit, List<HabitLog> logs, LocalDate start, LocalDate end) {
        int completed = logs.size();
        int target = calculateTarget(habit, start, end);
        return reportMapper.mapToHabitRow(habit, completed, target);
    }
    
    private FullReportResponse createEmptyDashboard(LocalDate start, LocalDate end, Integer week) {
        ReportCardDto emptyCard = reportMapper.mapToReportCard(0, 0, 0, 0, "General", 
                Arrays.asList(false, false, false, false, false, false, false),0,"",0,0,0);
        String title = (week != null) ? "Weekly Dashboard (Week " + week + ")" : "Monthly Dashboard";
        return reportMapper.mapToFullReport(start, end, title, emptyCard, Collections.emptyList(), 
                "Start building habits to see your progress!");
    }
    
    private String generatePersonalizedMotivation(DashboardMetrics metrics) {
        int completionRate = metrics.totalTarget > 0 ? (metrics.totalCompleted * 100) / metrics.totalTarget : 0;
        
        if (metrics.currentStreak >= 7) {
            return "🔥 Amazing " + metrics.currentStreak + "-day streak! You're building unstoppable momentum.";
        } else if (completionRate >= 80) {
            return "⭐ Excellent consistency! You're " + completionRate + "% on track to your goals.";
        } else if (completionRate >= 60) {
            return "💪 Good progress! Keep pushing - you're " + completionRate + "% there.";
        } else if (metrics.perfectDays > 0) {
            return "🎯 You had " + metrics.perfectDays + " perfect days! Build on that success.";
        } else {
            return "🌱 Every expert was once a beginner. Start small, stay consistent!";
        }
    }
    
    private static class DashboardMetrics {
        int totalCompleted;
        int totalTarget;
        int currentStreak;
        int perfectDays;
        String bestCategory;
        List<Boolean> weeklyTrend;
        int consistencyScore;
        String momentum;
        String difficultyBalance;
        int totalTimeInvested;
        double recoveryRate;
        int longestStreak;
        int activeDaysCount;
    }
    
    private static class CategoryStats {
        private int totalCompleted = 0;
        private int totalTarget = 0;
        
        void addHabit(int completed, int target) {
            this.totalCompleted += completed;
            this.totalTarget += target;
        }
        
        double getSuccessRate() {
            return totalTarget > 0 ? (double) totalCompleted / totalTarget : 0;
        }
    }

    private List<Boolean> calculateWeeklyTrend(List<Habit> habits, Map<Long, List<HabitLog>> logsByHabit, LocalDate endDate) {
        List<Boolean> trend = new ArrayList<>();
        
        for (int i = 6; i >= 0; i--) {
            LocalDate checkDate = endDate.minusDays(i);
            
            long activeHabitsForDay = habits.stream()
                    .filter(habit -> !habit.getStartDate().isAfter(checkDate))
                    .count();
            
            long completedHabitsForDay = habits.stream()
                    .filter(habit -> !habit.getStartDate().isAfter(checkDate))
                    .filter(habit -> logsByHabit.getOrDefault(habit.getId(), Collections.emptyList())
                            .stream().anyMatch(log -> log.getLogDate().equals(checkDate)))
                    .count();
            
            boolean goodDay = activeHabitsForDay > 0 && 
                    (double) completedHabitsForDay / activeHabitsForDay >= 0.5;
            trend.add(goodDay);
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
                LocalDate firstDay = LocalDate.of(year, month, 1);
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
