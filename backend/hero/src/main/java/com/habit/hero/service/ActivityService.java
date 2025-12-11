package com.habit.hero.service;

import com.habit.hero.dto.activity.*;
import java.util.List;

public interface ActivityService {

    FeedItemResponse createActivity(ActivityCreateRequest request);

    List<FeedItemResponse> getFeedForUser(Long userId, int page, int size);

    void likeActivity(Long userId, Long activityId);

    void unlikeActivity(Long userId, Long activityId);

    CommentResponse addComment(CommentCreateRequest request);

    List<CommentResponse> getComments(Long activityId);
}