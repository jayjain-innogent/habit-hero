package com.habit.hero.dto.activity;

import lombok.Data;

@Data
public class CommentCreateRequest {
    private Long activityId;
    private Long authorUserId;
    private String text;
}