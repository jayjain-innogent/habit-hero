package com.habit.hero.mapper;

import com.habit.hero.dto.habit.HabitCreateRequest;
import com.habit.hero.dto.habit.HabitUpdateRequest;
import com.habit.hero.dto.habit.HabitResponse;
import com.habit.hero.entity.Habit;

import java.math.BigDecimal;

public class HabitMapper {

    // Convert Create Request to Entity
    public static Habit toEntity(HabitCreateRequest request, Long userId) {
        return Habit.builder()
                .userId(userId)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .color(request.getColor())
                .icon(request.getIcon())
                .frequency(request.getFrequency())
                .frequencyCount(request.getFrequencyCount())
                .goalType(request.getGoalType())
                .unit(request.getUnit())
                .targetValue(parseDecimal(request.getTargetValue()))
                .visibility(request.getVisibility())
                .status(request.getStatus())
                .build();
    }

    // Convert Update Request to Entity (existing entity updated)
    public static void updateEntity(Habit habit, HabitUpdateRequest request) {

        if (request.getTitle() != null) habit.setTitle(request.getTitle());
        if (request.getDescription() != null) habit.setDescription(request.getDescription());
        if (request.getCategory() != null) habit.setCategory(request.getCategory());
        if (request.getColor() != null) habit.setColor(request.getColor());
        if (request.getIcon() != null) habit.setIcon(request.getIcon());

        if (request.getFrequency() != null) habit.setFrequency(request.getFrequency());
        if (request.getFrequencyCount() != null) habit.setFrequencyCount(request.getFrequencyCount());


        if (request.getGoalType() != null) habit.setGoalType(request.getGoalType());
        if (request.getUnit() != null) habit.setUnit(request.getUnit());
        if (request.getTargetValue() != null) habit.setTargetValue(parseDecimal(request.getTargetValue()));

        if (request.getVisibility() != null) habit.setVisibility(request.getVisibility());
        if (request.getStatus() != null) habit.setStatus(request.getStatus());
    }

    // Convert Entity to Response
    public static HabitResponse toResponse(Habit habit) {
        return HabitResponse.builder()
                .id(habit.getId())
                .userId(habit.getUserId())
                .title(habit.getTitle())
                .description(habit.getDescription())
                .category(habit.getCategory())
                .color(habit.getColor())
                .icon(habit.getIcon())
                .startDate(habit.getStartDate())
                .frequency(habit.getFrequency())
                .frequencyCount(habit.getFrequencyCount())
                .goalType(habit.getGoalType())
                .targetValue(habit.getTargetValue())
                .unit(habit.getUnit())
                .visibility(habit.getVisibility())
                .status(habit.getStatus())
                .build();
    }

    private static BigDecimal parseDecimal(String value) {
        if (value == null || value.isBlank()) return null;
        return new BigDecimal(value);
    }
}
