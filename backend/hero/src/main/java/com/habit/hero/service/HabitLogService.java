package com.habit.hero.service;

import com.habit.hero.dto.habit.HabitResponse;
import com.habit.hero.dto.habitlog.HabitLogCreateRequest;
import com.habit.hero.dto.habitlog.HabitLogResponse;
import com.habit.hero.dto.habitlog.TodayStatusResponse;

import java.time.LocalDate;
import java.util.List;

public interface HabitLogService {

    // Create a new log entry manually
    HabitLogResponse createLog(Long userId, Long habitId, HabitLogCreateRequest request);

    // Get all logs for a specific habit
    List<HabitLogResponse> getLogsForHabit(Long userId, Long habitId);

    // Delete a specific log entry
    void deleteLog(Long userId, Long logId);

    // Get logs within a specific date range
    List<HabitLogResponse> getLogsInRange(Long userId, Long habitId, LocalDate start, LocalDate end);

    // Get completion status for today for all habits (Dashboard)
    TodayStatusResponse getTodayStatus(Long userId);

    // Get note for a specific log
    HabitLogResponse getNote(Long userId, Long logId);

    // Update note for a specific log
    HabitLogResponse updateNote(Long userId, Long logId, String note);

    // Delete note from a specific log
    void deleteNote(Long userId, Long logId);
}
