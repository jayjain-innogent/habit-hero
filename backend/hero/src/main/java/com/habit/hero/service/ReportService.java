//package com.habit.hero.service;
//
//import com.habit.hero.dto.report.FullReportResponse;
//import com.habit.hero.dto.report.HabitRowDto;
//import com.habit.hero.dto.report.WeekComparison;
//import com.habit.hero.dto.report.WeekStats;
//import com.habit.hero.entity.Habit;
//import com.habit.hero.entity.HabitLog;
//import com.habit.hero.service.impl.ReportServiceImpl;
//import org.springframework.http.HttpStatusCode;
//import org.springframework.http.ResponseEntity;
//
//import java.time.LocalDate;
//import java.util.List;
//import java.util.Map;
//import java.util.Set;
//
//public interface ReportService {
//
//    FullReportResponse getDashboardReport(Long userId, int year, int month, Integer week);
//
//    ResponseEntity<HttpStatusCode> calculateStreak(long habitId, long userId);
//     int calculateTarget(Habit habit, LocalDate reportStart, LocalDate reportEnd);
//
//     Double calculateExpectedValueForPeriod(Habit habit, LocalDate startDate, LocalDate endDate);
//     Double calculateCompletionValueForPeriod(Habit habit, List<HabitLog> completions);
//    WeekComparison createWeekComparison(WeekStats thisWeek, WeekStats prevWeek,
//                                        int thisWeekUniqueDays, int prevWeekUniqueDays);
//
//    DashboardMetrics calculateDashboardMetrics(List<Habit> habits, Map<Long, List<HabitLog>> logsByHabit,
//                                                                 LocalDate start, LocalDate end, LocalDate today)
//    DashboardMetrics createEmptyMetrics();
//    int calculateActiveDays(Map<Long, List<HabitLog>> logsByHabit, LocalDate start, LocalDate end);
//    int calculateCurrentStreak(Habit habit, LocalDate today);
//    int calculateNonDailyStreak(Habit habit, Set<LocalDate> completedDates, LocalDate today);
//
//    boolean isConsecutiveForCadence(LocalDate newer, LocalDate older, Habit habit);
//
//    String findBestCategory(Map<String, ReportServiceImpl.CategoryStats> categoryStats);
//    int calculatePerfectDays(List<Habit> habits, Map<Long, List<HabitLog>> logsByHabit, LocalDate start, LocalDate end);
//
//    HabitRowDto createHabitRow(Habit habit, List<HabitLog> logs, LocalDate start, LocalDate end);
//
//    FullReportResponse createEmptyDashboard(LocalDate start, LocalDate end, Integer week);
//
//    String generatePersonalizedMotivation(ReportServiceImpl.DashboardMetrics metrics);
//
//    List<Boolean> calculateWeeklyTrend(List<Habit> habits, Map<Long, List<HabitLog>> logsByHabit, LocalDate endDate);
//
//    String generateMotivation(int score);
//
//    LocalDate[] resolveDateRange(int year, int month, Integer week);
//}