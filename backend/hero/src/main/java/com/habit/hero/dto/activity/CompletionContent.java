package com.habit.hero.dto.activity;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompletionContent {
    private int completedCount;
    private int totalCount;
    private String note;
}