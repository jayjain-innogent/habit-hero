package com.habit.hero.dao.impl;

import com.habit.hero.dao.HabitDAO;
import com.habit.hero.entity.Habit;
import com.habit.hero.enums.HabitStatus;
import com.habit.hero.repository.HabitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
@Slf4j
public class HabitDAOImpl implements HabitDAO {

    private final HabitRepository habitRepository;

    @Override
    public Habit save(Habit habit) {
        // Save or update habit
        log.info("Saving habit for user {}", habit.getUser());
        return habitRepository.save(habit);
    }

    @Override
    public Optional<Habit> findByIdAndUserId(Long habitId, Long userId) {
        // Ensure user owns this habit
        log.info("Finding habit {} for user {}", habitId, userId);
        return habitRepository.findByIdAndUser_UserId(habitId, userId);
    }

    @Override
    public List<Habit> findByUserId(Long userId) {
        // Return all habits for given user
        log.info("Fetching all habits for user {}", userId);
        return habitRepository.findByUser_UserId(userId);
    }

    @Override
    public void delete(Habit habit) {
        // Delete a habit
        log.info("Deleting habit {} for user {}", habit.getId(), habit.getUser());
        habitRepository.delete(habit);
    }

    @Override
    public List<Habit> saveAll(List<Habit> habits) {
        log.info("Bulk saving {} habits", habits.size());
        return habitRepository.saveAll(habits);
    }

    @Override
    public List<Habit> findActiveHabitsSorted(Long userId) {
        // Return only active habits
        log.info("Fetching active habits for user {}", userId);
        return habitRepository.findByUser_UserIdAndStatusOrderByCreatedAtAsc(userId, HabitStatus.ACTIVE);
    }

}