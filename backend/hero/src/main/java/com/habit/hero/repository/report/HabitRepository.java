package com.habit.hero.repository.report;

import com.habit.hero.entity.Habit;
import com.habit.hero.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long>{

    Optional<Habit> findByIdAndUser_UserId(Long habitId, Long userId);
}
