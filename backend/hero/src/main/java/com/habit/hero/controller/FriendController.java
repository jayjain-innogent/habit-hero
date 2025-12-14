package com.habit.hero.controller;

import com.habit.hero.dto.friend.*;
import com.habit.hero.service.FriendService;
import com.habit.hero.util.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;
    private final CurrentUserUtil currentUserUtil;


    @PostMapping("/request")
    public ResponseEntity<ApiResponse> sendFriendRequest(
            @RequestParam Long senderId,
            @RequestParam Long receiverId) {

        // SECURITY: Validate senderId matches token
        Long tokenUserId = currentUserUtil.getCurrentUserId();
        if (!tokenUserId.equals(senderId)) {
            throw new RuntimeException("Unauthorized: User ID mismatch");
        }

        friendService.sendFriendRequest(senderId, receiverId);
        return ResponseEntity.ok(new ApiResponse("Friend request sent successfully", true));
    }

    @PostMapping("/accept")
    public ResponseEntity<ApiResponse> acceptFriendRequest(
            @RequestBody RespondToRequestDto dto) {

        friendService.acceptFriendRequest(dto);
        return ResponseEntity.ok(new ApiResponse("Friend request accepted", true));
    }

    @PostMapping("/reject")
    public ResponseEntity<ApiResponse> rejectFriendRequest(
            @RequestBody RespondToRequestDto dto) {

        friendService.rejectFriendRequest(dto);
        return ResponseEntity.ok(new ApiResponse("Friend request rejected", true));
    }

    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse> cancelFriendRequest(
            @RequestBody RespondToRequestDto dto) {

        friendService.cancelFriendRequest(dto);
        return ResponseEntity.ok(new ApiResponse("Friend request cancelled", true));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse> removeFriend(
            @RequestParam Long userId,
            @RequestParam Long friendId) {

        Long tokenUserId = currentUserUtil.getCurrentUserId();
        if (!tokenUserId.equals(userId)) {
            throw new RuntimeException("Unauthorized: User ID mismatch");
        }
        friendService.removeFriend(userId, friendId);
        return ResponseEntity.ok(new ApiResponse("Friend removed successfully", true));
    }

    @GetMapping
    public ResponseEntity<List<FriendDto>> getFriends(@RequestParam Long userId) {
        List<FriendDto> friends = friendService.getFriendList(userId);
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<FriendRequestResponseDto>> getPendingRequests(
            @RequestParam Long userId) {

        Long tokenUserId = currentUserUtil.getCurrentUserId();
        if (!tokenUserId.equals(userId)) {
            throw new RuntimeException("Unauthorized: User ID mismatch");
        }
        List<FriendRequestResponseDto> list = friendService.getPendingRequests(userId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<List<FriendRequestResponseDto>> getSentRequests(
            @RequestParam Long userId) {
        Long tokenUserId = currentUserUtil.getCurrentUserId();
        if (!tokenUserId.equals(userId)) {
            throw new RuntimeException("Unauthorized: User ID mismatch");
        }
        List<FriendRequestResponseDto> list = friendService.getSentRequests(userId);
        return ResponseEntity.ok(list);
    }

}