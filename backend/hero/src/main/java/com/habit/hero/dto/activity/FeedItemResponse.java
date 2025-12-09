package com.habit.hero.dto.activity;

import com.habit.hero.enums.ActivityType;
import com.habit.hero.enums.Visibility;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class FeedItemResponse {

    private Long activityId;

    private UserSummary user;

    private ActivityType activityType;
    private String title;
    private Visibility visibility;
    private LocalDateTime createdAt;

    private Object content;

    private boolean likedByCurrentUser;
    private int likesCount;
    private int commentsCount;

    //Comment preview ,might dlt later optional
    private List<CommentResponse> recentComments;
}
