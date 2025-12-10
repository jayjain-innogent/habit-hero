package com.habit.hero.dao;

import com.habit.hero.entity.Habit;

import java.util.List;
import java.util.Optional;

public interface HabitDAO {
    // Save or update a habit
    Habit save(Habit habit);

    // Find a specific habit for a specific user (ownership check)
    Optional<Habit> findByIdAndUserId(Long habitId, Long userId);

    // Get all habits for a user
    List<Habit> findByUserId(Long userId);

    // Get only active habits of a user
    List<Habit> findActiveHabitsSorted(Long userId);

    List<Habit> findActiveHabits(Long userId);

    // Delete a habit
    void delete(Habit habit);

    //Save All
    List<Habit> saveAll(List<Habit> habits);
}
