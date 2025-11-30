package com.habit.hero.mapper;

import com.habit.hero.dto.habit.HabitCreateRequest;
import com.habit.hero.dto.habit.HabitResponse;
import com.habit.hero.dto.habit.HabitUpdateRequest;
import com.habit.hero.entity.Habit;
import com.habit.hero.entity.User;
import com.habit.hero.enums.Cadence;
import com.habit.hero.enums.Categories;
import com.habit.hero.enums.GoalUnit;

import java.math.BigDecimal;

public class HabitMapper {

    // Convert Create Request to Entity
    public static Habit toEntity(HabitCreateRequest request, User user) {

        Integer sessionCount = null;

        // RULE: Daily habits do NOT use sessionCount
        if (request.getCadence() != Cadence.DAILY) {
            sessionCount = request.getSessionCount();
        }

        return Habit.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(Categories.valueOf(request.getCategory()))
                .cadence(request.getCadence())
                .sessionCount(sessionCount)
                .goalType(request.getGoalType())
                .goalUnit(request.getUnit() != null ? GoalUnit.valueOf(request.getUnit()) : null)
                .targetValue(parseDecimal(request.getTargetValue()))
                .visibility(request.getVisibility())
                .status(request.getStatus())
                .build();
    }

    // Convert Update Request to Entity (update existing entity)
    public static void updateEntity(Habit habit, HabitUpdateRequest request) {

        if (request.getTitle() != null) habit.setTitle(request.getTitle());
        if (request.getDescription() != null) habit.setDescription(request.getDescription());

        if (request.getCategory() != null) {
            habit.setCategory(Categories.valueOf(request.getCategory()));
        }

        // cadence first
        if (request.getCadence() != null) {
            habit.setCadence(request.getCadence());

            // RULE: If cadence becomes DAILY → clear sessionCount
            if (request.getCadence() == Cadence.DAILY) {
                habit.setSessionCount(null);
            }
        }

        // only apply sessionCount if not daily
        if (request.getSessionCount() != null) {
            if (habit.getCadence() != Cadence.DAILY) {
                habit.setSessionCount(request.getSessionCount());
            }
        }

        if (request.getGoalType() != null) habit.setGoalType(request.getGoalType());

        if (request.getUnit() != null) {
            habit.setGoalUnit(GoalUnit.valueOf(request.getUnit()));
        }

        if (request.getTargetValue() != null) {
            habit.setTargetValue(parseDecimal(request.getTargetValue()));
        }

        if (request.getVisibility() != null) habit.setVisibility(request.getVisibility());
        if (request.getStatus() != null) habit.setStatus(request.getStatus());
    }

    // Entity to Response
    public static HabitResponse toResponse(Habit habit) {
        return HabitResponse.builder()
                .id(habit.getId())
                .userId(habit.getUser().getUserId())
                .title(habit.getTitle())
                .description(habit.getDescription())
                .category(habit.getCategory().name())
                .startDate(habit.getStartDate())
                .cadence(habit.getCadence())
                .sessionCount(habit.getSessionCount())
                .goalType(habit.getGoalType())
                .targetValue(habit.getTargetValue())
                .unit(habit.getGoalUnit() != null ? habit.getGoalUnit().name() : null)
                .visibility(habit.getVisibility())
                .status(habit.getStatus())
                .build();
    }

    private static BigDecimal parseDecimal(String value) {
        if (value == null || value.isBlank()) return null;
        return new BigDecimal(value);
    }
}