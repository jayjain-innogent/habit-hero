package com.habit.hero.dto.activity;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReactionResponse {
    private Long reactionId;
    private Long userId;
}