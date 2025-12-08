package com.habit.hero.dto.activity;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StreakContent {
    private String habitName;
    private int streakLength;
}