package com.habit.hero.dao.impl;

import com.habit.hero.dao.HabitLogDAO;
import com.habit.hero.entity.Habit;
import com.habit.hero.entity.HabitLog;
import com.habit.hero.enums.HabitStatus;
import com.habit.hero.repository.HabitLogRepository;
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
public class HabitLogDAOImpl implements HabitLogDAO {

    private final HabitLogRepository habitLogRepository;
    private final HabitRepository habitRepository;

    // Save a habit log to the database
    @Override
    public HabitLog save(HabitLog logData) {
        log.info("Saving habit log for habit {}", logData.getHabit().getId());
        return habitLogRepository.save(logData);
    }

    // Find a habit log by habitId and date
    @Override
    public Optional<HabitLog> findTodayLog(Long habitId, LocalDate logDate) {
        log.info("Finding habit log by habitId {} and date {}", habitId, logDate);
        return habitLogRepository.findByHabit_IdAndLogDate(habitId, logDate);
    }

    // Get all logs for a habit, ordered by date (latest first)
    @Override
    public List<HabitLog> findByHabitId(Long habitId) {
        log.info("Finding habit log by habitId {}", habitId);
        return habitLogRepository.findByHabit_IdOrderByLogDateDesc(habitId);
    }

    // Find a habit log by logId and userId
    @Override
    public Optional<HabitLog> findByIdAndUserId(Long logId, Long userId) {
        log.info("Finding habit log by logId {} and userId {}", logId, userId);
        return habitLogRepository.findByLogIdAndHabit_User_UserId(logId, userId);
    }

    // Delete a habit log from the database
    @Override
    public void delete(HabitLog logData) {
        log.info("Delete the log");
        habitLogRepository.delete(logData);
    }

    // Get logs for a habit within a specific date range
    @Override
    public List<HabitLog> findByHabitIdAndDateRange(Long habitId, LocalDate startDate, LocalDate endDate) {
        log.info("Finding habit log by HabitId {} and DateRange starDate {} endDate {}", habitId, startDate, endDate);
        return habitLogRepository.findByHabit_IdAndLogDateBetweenOrderByLogDate(
                habitId,
                startDate,
                endDate);
    }

    // Get all habit logs for a user within a date range
    @Override
    public List<HabitLog> findLogsForUserInDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        log.info("Finding all habit logs for user {} between {} and {}", userId, startDate, endDate);
        return habitLogRepository.findByHabit_User_UserIdAndLogDateBetweenOrderByLogDate(
                userId,
                startDate,
                endDate
        );
    }

    // Find all active habits not logged since a specific date
    @Override
    public List<Habit> findActiveHabitsNotLoggedSince(LocalDate date) {
        return habitRepository.findByStatusEqualsAndLastActivityDateBeforeOrLastActivityDateIsNull(
                HabitStatus.ACTIVE,
                date
        );
    }
}