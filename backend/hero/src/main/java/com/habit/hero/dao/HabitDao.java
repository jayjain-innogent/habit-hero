package com.habit.hero.dao;

import com.habit.hero.entity.Habit;
import com.habit.hero.entity.HabitLog;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitDao {
    Optional<Habit> findByIdAndUserId(Long habitId, Long userId);
}
