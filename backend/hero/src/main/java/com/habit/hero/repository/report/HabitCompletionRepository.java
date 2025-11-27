package com.habit.hero.repository.report;

import com.habit.hero.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HabitCompletionRepository extends JpaRepository<HabitLog, Long> {


//    List<HabitLog> findByIdAndDateBetween(
//            @Param("habitId") Long habitId,
//            @Param("startDate") LocalDate startDate,
//            @Param("endDate") LocalDate endDate
//    );
    List<HabitLog> findByHabit_IdAndLogDateBetweenOrderByLogDate(
            Long habitId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<HabitLog> findByHabit_Id(
            Long habitId
    );
}
