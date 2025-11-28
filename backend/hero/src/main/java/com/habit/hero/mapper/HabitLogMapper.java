package com.habit.hero.mapper;

import com.habit.hero.dto.habitlog.HabitLogCreateRequest;
import com.habit.hero.dto.habitlog.HabitLogResponse;
import com.habit.hero.dto.habitlog.HabitStatusItem;
import com.habit.hero.dto.habitlog.TodayStatusResponse;
import com.habit.hero.entity.Habit;
import com.habit.hero.entity.HabitLog;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class HabitLogMapper {

    public static HabitLog toEntity(HabitLogCreateRequest req, Habit habit) {
        return HabitLog.builder()
                .habit(habit)
                .logDate(req.getLogDate() == null ? LocalDate.now() : req.getLogDate())
                .actualValue(req.getActualValue())
                .note(req.getNote())
                .createdAt(LocalDateTime.now())
                .build();
    }

    public static HabitLogResponse toResponse(HabitLog log) {
        return HabitLogResponse.builder()
                .logId(log.getLogId())
                .habitId(log.getHabit().getId())
                .logDate(log.getLogDate())
                .actualValue(log.getActualValue())
                .note(log.getNote())
                .createdAt(log.getCreatedAt())
                .build();
    }

    public static HabitStatusItem toTodayStatus(HabitLog log) {
        if (log == null) {
            return HabitStatusItem.builder()
                    .completedToday(false)
                    .actualValue(null)
                    .build();
        }

        return HabitStatusItem.builder()
                .completedToday(true)
                .actualValue(log.getActualValue())
                .build();
    }

}
