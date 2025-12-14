package com.habit.hero.controller;

import com.habit.hero.dto.user.UserResponse;
import com.habit.hero.dto.user.UserUpdateRequest;
import com.habit.hero.entity.User;
import com.habit.hero.repository.UserRepository;
import com.habit.hero.service.UserService;
import com.habit.hero.util.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUserUtil currentUserUtil;
    private final UserRepository userRepository;

    // get any user profile by their id
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    // get the profile of the currently logged in user
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile() {
        Long currentUserId = currentUserUtil.getCurrentUserId();
        return ResponseEntity.ok(userService.getUserById(currentUserId));
    }

    // update user profile
    // uses model attribute to handle form data with image file
    @PutMapping(value = "/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> updateUserProfile(
            @PathVariable Long userId,
            @ModelAttribute UserUpdateRequest request) throws IOException {

        // security check to prevent updating someone else profile
        Long currentUserId = currentUserUtil.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new RuntimeException("You are not authorized to update this profile");
        }

        UserResponse updatedUser = userService.updateUserProfile(userId, request);
        return ResponseEntity.ok(updatedUser);
    }

    // update user profile (JSON support for text-only updates/edits)
    @PatchMapping(value = "/{userId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserResponse> updateUserProfileJson(
            @PathVariable Long userId,
            @RequestBody UserUpdateRequest request) {

        // security check
        Long currentUserId = currentUserUtil.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new RuntimeException("You are not authorized to update this profile");
        }

        // Reuse service logic (image will be null, which is handled safey)
        UserResponse updatedUser = userService.updateUserProfile(userId, request);
        return ResponseEntity.ok(updatedUser);
    }

    // search users by name or bio
    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String query) {
        List<UserResponse> users = userService.searchUsers(query);
        return ResponseEntity.ok(users);
    }

    // get all users (for suggestions)
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }


}