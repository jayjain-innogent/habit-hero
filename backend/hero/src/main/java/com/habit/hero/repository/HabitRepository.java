package com.habit.hero.repository;

import com.habit.hero.entity.Habit;
import com.habit.hero.enums.HabitStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {

    // Get all habits for user
    List<Habit> findByUser_UserId(Long userId);

    // Get all active habits Sorted by CreatedAt
    List<Habit> findByUser_UserIdAndStatusOrderByCreatedAtAsc(Long userId, HabitStatus status);

    // verify ownership
    Optional<Habit> findByIdAndUser_UserId(Long habitId, Long userId);

    List<Habit> findByStatusEqualsAndLastActivityDateBeforeOrLastActivityDateIsNull(
            HabitStatus status, LocalDate date
    );
}