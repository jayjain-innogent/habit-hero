package com.habit.hero.dto.activity;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LikeResponse {
    private Long activityId;
    private boolean isLiked;
    private int likesCount;
}
