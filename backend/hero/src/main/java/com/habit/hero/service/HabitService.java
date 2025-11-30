package com.habit.hero.service;

import com.habit.hero.dto.habit.HabitBulkCreateRequest;
import com.habit.hero.dto.habit.HabitCreateRequest;
import com.habit.hero.dto.habit.HabitUpdateRequest;
import com.habit.hero.dto.habit.HabitResponse;

import java.util.List;

public interface HabitService {

    // Create new habit
    HabitResponse createHabit(Long userId, HabitCreateRequest request);

    // Get single habit
    HabitResponse getHabit(Long userId, Long habitId);

    // Get all habits for user
    List<HabitResponse> getAllHabits(Long userId);

    // Update habit
    HabitResponse updateHabit(Long userId, Long habitId, HabitUpdateRequest request);

    // Delete habit
    void deleteHabit(Long userId, Long habitId);

    List<HabitResponse> bulkCreateHabits(Long userId, HabitBulkCreateRequest request);

}