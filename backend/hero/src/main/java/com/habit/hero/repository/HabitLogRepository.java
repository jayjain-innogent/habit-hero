package com.habit.hero.repository;

import com.habit.hero.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {

    //check if habit completed today
    Optional<HabitLog> findByHabit_IdAndLogDate(Long habitId, LocalDate logDate);

    // Fetch all logs by habit id odr by date desc
    List<HabitLog> findByHabit_IdOrderByLogDateDesc(Long habitId);

    // Fetch log by id and userId
    Optional<HabitLog> findByLogIdAndHabit_User_UserId(Long logId, Long userId);

    //Fetch log by HabitId and logDate range
    List<HabitLog> findByHabit_IdAndLogDateBetweenOrderByLogDate(
            Long habitId,
            LocalDate startDate,
            LocalDate endDate
    );
}
