package com.habit.hero.service;

import com.habit.hero.dto.user.UserResponse;
import com.habit.hero.dto.user.UserUpdateRequest;

import java.util.List;

public interface UserService {

    // Get a user profile by their ID
    UserResponse getUserById(Long userId);

    // Update the logged in user profile
    UserResponse updateUserProfile(Long userId, UserUpdateRequest request);

    // Search for users by name or bio
    List<UserResponse> searchUsers(String query);
}