package com.habit.hero.dao.impl;

import com.habit.hero.dao.HabitDAO;
import com.habit.hero.entity.Habit;
import com.habit.hero.enums.HabitStatus;
import com.habit.hero.repository.HabitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
@Slf4j
public class HabitDAOImpl implements HabitDAO {

    private final HabitRepository habitRepository;

    // Save or update a habit in the database
    @Override
    public Habit save(Habit habit) {
        log.info("Saving habit for user {}", habit.getUser());
        return habitRepository.save(habit);
    }

    // Find a habit by its ID and user ID
    @Override
    public Optional<Habit> findByIdAndUserId(Long habitId, Long userId) {
        log.info("Finding habit {} for user {}", habitId, userId);
        return habitRepository.findByIdAndUser_UserId(habitId, userId);
    }

    // Get all habits for a specific user
    @Override
    public List<Habit> findByUserId(Long userId) {
        log.info("Fetching all habits for user {}", userId);
        return habitRepository.findByUser_UserId(userId);
    }

    // Get all active habits for a user, sorted by creation date
    @Override
    public List<Habit> findActiveHabitsSorted(Long userId) {
        log.info("Fetching active habits for user {}", userId);
        return habitRepository.findByUser_UserIdAndStatusOrderByCreatedAtAsc(userId, HabitStatus.ACTIVE);
    }

    // Delete a habit from the database
    @Override
    public void delete(Habit habit) {
        log.info("Deleting habit {} for user {}", habit.getId(), habit.getUser());
        habitRepository.delete(habit);
    }

    // Save or update a list of habits in bulk
    @Override
    public List<Habit> saveAll(List<Habit> habits) {
        log.info("Bulk saving {} habits", habits.size());
        return habitRepository.saveAll(habits);
    }

    // Find all active habits not logged since a specific date
    @Override
    public List<Habit> findActiveHabitsNotLoggedSince(LocalDate date) {
        // Sirf ACTIVE habits ko uthao
        return habitRepository.findByStatusAndLastActivityDateBeforeOrLastActivityDateIsNull(
                HabitStatus.ACTIVE,
                date
        );
    }
}