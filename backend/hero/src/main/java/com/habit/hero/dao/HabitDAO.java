package com.habit.hero.dao;

import com.habit.hero.entity.Habit;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitDAO {

    // Save or update a habit
    Habit save(Habit habit);

    // Find a habit by its ID and user ID
    Optional<Habit> findByIdAndUserId(Long habitId, Long userId);

    // Get all habits for a specific user
    List<Habit> findByUserId(Long userId);

    // Get all active habits for a user, sorted by creation date
    List<Habit> findActiveHabitsSorted(Long userId);

    // Delete a habit
    void delete(Habit habit);

    // Save or update a list of habits in bulk
    List<Habit> saveAll(List<Habit> habits);

    // Find all active habits not logged since a specific date
    List<Habit> findActiveHabitsNotLoggedSince(LocalDate date);
}