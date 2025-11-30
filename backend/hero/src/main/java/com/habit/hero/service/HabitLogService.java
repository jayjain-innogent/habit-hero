package com.habit.hero.service;

import com.habit.hero.dto.habitlog.HabitLogCreateRequest;
import com.habit.hero.dto.habitlog.HabitLogResponse;
import com.habit.hero.dto.habitlog.TodayStatusResponse;

import java.time.LocalDate;
import java.util.List;

public interface HabitLogService {

    //create
    HabitLogResponse createLog(Long userId, Long habitId, HabitLogCreateRequest request);

    //get all logs for habit
    List<HabitLogResponse> getLogsForHabit(Long userId, Long habitId);

    //delete
    void deleteLog(Long userId, Long logId);

    //range logs (weekly/monthly)
    List<HabitLogResponse> getLogsInRange(Long userId, Long habitId, LocalDate start, LocalDate end);

    //today-status for all habits
    TodayStatusResponse getTodayStatus(Long userId);

}
