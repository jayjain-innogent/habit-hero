package com.habit.hero.dao;

import com.habit.hero.entity.HabitLog;
import com.habit.hero.repository.report.HabitCompletionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public class HabitLogDaoImpl implements HabitLogDao {

    @Autowired
    private HabitCompletionRepository completionRepository;

    @Override
    public List<HabitLog> findByHabitId(Long habitId) {
        return completionRepository.findByHabit_Id(habitId);
    }

    @Override
    public List<HabitLog> findByHabitIdAndLogDateBetweenOrderByLogDate(Long habitId, LocalDate startDate, LocalDate endDate) {
        return completionRepository.findByHabit_IdAndLogDateBetweenOrderByLogDate(habitId, startDate, endDate);
    }
}