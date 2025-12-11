package com.habit.hero.dao;

import com.habit.hero.entity.Habit;
import com.habit.hero.entity.HabitLog;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitLogDAO {

    // Save or update a habit log
    HabitLog save(HabitLog log);

    // Find today's log for a specific habit
    Optional<HabitLog> findTodayLog(Long habitId, LocalDate logDate);

    // Get all logs for a specific habit
    List<HabitLog> findByHabitId(Long habitId);

    // Find a log by logId and userId (ensures user owns the habit)
    Optional<HabitLog> findByIdAndUserId(Long logId, Long userId);

    // Delete a specific habit log
    void delete(HabitLog log);

    // Find all active habits not logged since a specific date
    List<Habit> findActiveHabitsNotLoggedSince(LocalDate date);

    // Get logs for a habit within a date range
    List<HabitLog> findByHabitIdAndDateRange(Long habitId, LocalDate startDate, LocalDate endDate);

    // Get all logs for a user within a date range
    List<HabitLog> findLogsForUserInDateRange(Long userId, LocalDate startDate, LocalDate endDate);
}