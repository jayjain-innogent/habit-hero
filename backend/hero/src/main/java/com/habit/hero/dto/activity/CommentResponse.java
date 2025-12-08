package com.habit.hero.dto.activity;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {
    private Long commentId;
    private String text;
    private LocalDateTime createdAt;
    private UserSummary author;
}