package com.habit.hero.controller;

import com.habit.hero.dto.activity.*;
import com.habit.hero.dto.friend.ApiResponse;
import com.habit.hero.entity.Activity;
import com.habit.hero.service.ActivityService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/activity")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping
    public ResponseEntity<ApiResponse> createActivity(@RequestBody ActivityCreateRequest request) {

        activityService.createActivity(request);

        ApiResponse response = new ApiResponse(
                "Activity created successfully",
                true
        );
        return ResponseEntity.ok(response);
    }

    // same api for adding and deleting likes :D
    @PostMapping("/{activityId}/like")
    public LikeResponse toggleLike(
            @PathVariable Long activityId,
            @RequestParam Long userId
    ) {
        return activityService.toggleLike(userId, activityId);
    }

    // api to get all feed for a specific user (PUBLIC + FRIENDS | ALL)
    @GetMapping("/feed")
    public List<ActivityResponse> getFeed(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "ALL") String filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return activityService.getFeed(userId, filter, page, size);
    }

    @PostMapping("/comments/add")
    public CommentResponse addComment(@RequestBody CommentCreateRequest request) {
        return activityService.addComment(request);
    }

    @GetMapping("/comments/{activityId}")
    public List<CommentResponse> getCommentsByActivity(@PathVariable Long activityId) {
        return activityService.getCommentsByActivity(activityId);
    }

}
