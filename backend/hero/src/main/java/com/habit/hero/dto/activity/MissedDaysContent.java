package com.habit.hero.dto.activity;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MissedDaysContent {
    private int missedDays;
    private String message;
}