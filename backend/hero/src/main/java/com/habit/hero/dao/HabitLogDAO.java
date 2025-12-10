package com.habit.hero.dao;

import com.habit.hero.entity.HabitLog;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


public interface HabitLogDAO {
    //save
    HabitLog save(HabitLog logData);

    //find habit log with habitId and date
    Optional<HabitLog> findTodayLog(Long habitId, LocalDate logDate);

    List<HabitLog> findByHabitId(Long habitId);
    List<HabitLog> findByHabitIdAndLogDateBetweenOrderByLogDate(Long habitId, LocalDate startDate, LocalDate endDate);

    //finds logs using logId and UserId
    Optional<HabitLog> findByIdAndUserId(Long logId, Long userId);

    //delete log
    void delete(HabitLog logData);

    List<HabitLog> findByHabitIdAndDateRange(Long habitId, LocalDate startDate, LocalDate endDate);

    //Fetch all logs belonging to user
    List<HabitLog> findLogsForUserInDateRange(Long userId, LocalDate startDate, LocalDate endDate);
}