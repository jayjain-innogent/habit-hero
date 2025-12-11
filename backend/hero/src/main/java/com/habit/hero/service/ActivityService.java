package com.habit.hero.service;

import com.habit.hero.dto.activity.*;
import com.habit.hero.entity.Activity;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ActivityService {

    @Transactional
    Activity createActivity(ActivityCreateRequest request);

    @Transactional(readOnly = true)
    List<ActivityResponse> getFeed(Long userId, String filter, int page, int size);

    @Transactional
    LikeResponse toggleLike(Long userId, Long activityId);

    @Transactional
    CommentResponse addComment(CommentCreateRequest request);

    @Transactional(readOnly = true)
    List<CommentResponse> getCommentsByActivity(Long activityId);
}