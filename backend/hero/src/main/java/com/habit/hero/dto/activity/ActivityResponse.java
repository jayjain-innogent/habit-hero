package com.habit.hero.dto.activity;

import com.habit.hero.enums.Visibility;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {

    private Long id;
    private String title;
    private String activityType;
    private Visibility visibility;
    private Long userId;
    private String username;
    private String profileImageUrl;
    private Long habitId;
    private int likesCount;
    private int commentsCount;
    private LocalDateTime createdAt;
    private String description;
    private String caption;
    private boolean likedByCurrentUser;
}
