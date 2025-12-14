package com.habit.hero.dto.report;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HabitRowDto {
    private String habitName;

    private String category;

    private int taskCompletedCount;

    private int totalTargetTask;

    private int efficiency;

    private String grade;
}