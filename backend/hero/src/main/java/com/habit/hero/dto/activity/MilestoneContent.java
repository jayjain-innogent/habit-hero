package com.habit.hero.dto.activity;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MilestoneContent {
    private String habitName;
    private String milestone;
}