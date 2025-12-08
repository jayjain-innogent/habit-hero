package com.habit.hero.controller;

import com.habit.hero.dto.activity.*;
import com.habit.hero.dto.friend.ApiResponse;
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

    @PostMapping("/create")
    public ResponseEntity<FeedItemResponse> createActivity(
            @RequestBody ActivityCreateRequest request) {

        FeedItemResponse response = activityService.createActivity(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/feed")
    public ResponseEntity<List<FeedItemResponse>> getUserFeed(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<FeedItemResponse> feed = activityService.getFeedForUser(userId, page, size);
        return ResponseEntity.ok(feed);
    }

    @PostMapping("/{activityId}/like")
    public ResponseEntity<String> likeActivity(
            @PathVariable Long activityId,
            @RequestParam Long userId) {

        activityService.likeActivity(userId, activityId);
        return ResponseEntity.ok("Liked successfully");
    }

    @PostMapping("/{activityId}/unlike")
    public ResponseEntity<String> unlikeActivity(
            @PathVariable Long activityId,
            @RequestParam Long userId) {

        activityService.unlikeActivity(userId, activityId);
        return ResponseEntity.ok("Unliked successfully");
    }


    @PostMapping("/comment")
    public ResponseEntity<CommentResponse> addComment(
            @RequestBody CommentCreateRequest request) {

        CommentResponse response = activityService.addComment(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{activityId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long activityId) {

        List<CommentResponse> comments = activityService.getComments(activityId);
        return ResponseEntity.ok(comments);
    }
}
