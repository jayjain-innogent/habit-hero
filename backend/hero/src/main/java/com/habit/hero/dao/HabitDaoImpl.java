package com.habit.hero.dao;

import com.habit.hero.entity.Habit;
import com.habit.hero.repository.report.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class HabitDaoImpl implements HabitDao {

    @Autowired
    private HabitRepository habitRepository;

    @Override
    public Optional<Habit> findByIdAndUserId(Long habitId, Long userId) {
        return habitRepository.findByIdAndUser_UserId(habitId, userId);
    }
}
