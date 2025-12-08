package com.habit.hero.dto.activity;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSummary {
    private Long userId;
    private String name;
    private String username;
    private String profileImage;
}