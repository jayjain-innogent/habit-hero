package com.habit.hero.dao;

import com.habit.hero.entity.HabitLog;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitLogDAO {

    // Save or update a log
    HabitLog save(HabitLog log);

    // Find log by habit and date (unique per day)
    Optional<HabitLog> findByHabitIdAndLogDate(Long habitId, LocalDate logDate);

    // All logs of a specific habit
    List<HabitLog> findByHabitId(Long habitId);

    // Find log ensuring habit belongs to user
    Optional<HabitLog> findByIdAndUserId(Long logId, Long userId);

    // Delete specific log
    void delete(HabitLog log);

    //Fetch log by HabitId and logDate range
    List<HabitLog> findByHabitIdAndDateRange(Long habitId, LocalDate startDate, LocalDate endDate);
}
