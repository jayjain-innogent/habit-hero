package com.habit.hero.dao;

import com.habit.hero.entity.HabitLog;

import java.time.LocalDate;
import java.util.List;


public interface HabitLogDao {
    List<HabitLog> findByHabitId(Long habitId);
    List<HabitLog> findByHabitIdAndLogDateBetweenOrderByLogDate(Long habitId, LocalDate startDate, LocalDate endDate);
}