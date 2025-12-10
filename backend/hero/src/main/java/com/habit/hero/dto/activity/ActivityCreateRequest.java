package com.habit.hero.dto.activity;

import com.habit.hero.enums.ActivityType;
import com.habit.hero.enums.Visibility;
import lombok.Data;

@Data
public class ActivityCreateRequest {
    private Long userId;
    private Long habitId;
    private ActivityType activityType;
    private String title;
    private Visibility visibility;
}