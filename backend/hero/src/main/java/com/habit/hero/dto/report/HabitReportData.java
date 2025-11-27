package com.habit.hero.dto.report;

import com.habit.hero.enums.Cadence;
import com.habit.hero.enums.Categories;
import com.habit.hero.enums.HabitStatus;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HabitReportData {
    private Long habitId;
    private String habitName;
    private Categories category;
    private Cadence cadence;
    private Integer sessionCount;
    private BigDecimal targetValue;
    private LocalDate startDate;
    private WeekStats thisWeek;
    private WeekStats previousWeek;
    private WeekComparison weekOverWeekChange;
    private HabitStatus status;
}
