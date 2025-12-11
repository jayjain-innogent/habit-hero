package com.habit.hero.dao;

import com.habit.hero.entity.Habit;
import com.habit.hero.entity.HabitLog;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitLogDAO {

    // Save or update a log
    HabitLog save(HabitLog log);

    //find today's log for a habit
    Optional<HabitLog> findTodayLog(Long habitId, LocalDate logDate);

    // All logs of a specific habit
    List<HabitLog> findByHabitId(Long habitId);
    List<HabitLog> findByHabitIdAndLogDateBetweenOrderByLogDate(Long habitId, LocalDate startDate, LocalDate endDate);

    // Find log ensuring habit belongs to user
    Optional<HabitLog> findByIdAndUserId(Long logId, Long userId);

    // Delete specific log
    void delete(HabitLog log);

    // Find all active habits not logged since a specific date
    List<Habit> findActiveHabitsNotLoggedSince(LocalDate date);

    // Get logs for a habit within a date range
    List<HabitLog> findByHabitIdAndDateRange(Long habitId, LocalDate startDate, LocalDate endDate);

    //Fetch all logs belonging to user
    List<HabitLog> findLogsForUserInDateRange(Long userId, LocalDate startDate, LocalDate endDate);
}
