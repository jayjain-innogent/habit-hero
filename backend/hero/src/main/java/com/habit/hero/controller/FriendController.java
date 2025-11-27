package com.habit.hero.controller;

import com.habit.hero.dto.friend.*;
import com.habit.hero.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @PostMapping("/request")
    public ResponseEntity<ApiResponse> sendFriendRequest(
            @RequestParam Long senderId,
            @RequestBody SendFriendRequestDto dto) {

        friendService.sendFriendRequest(senderId, dto);
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

        List<FriendRequestResponseDto> list = friendService.getPendingRequests(userId);
        return ResponseEntity.ok(list);
    }
}