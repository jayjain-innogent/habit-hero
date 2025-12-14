package com.habit.hero.service.impl;

import com.habit.hero.dto.user.UserResponse;
import com.habit.hero.dto.user.UserUpdateRequest;
import com.habit.hero.entity.User;
import com.habit.hero.repository.UserRepository;
import com.habit.hero.service.CloudinaryService;
import com.habit.hero.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public UserResponse getUserById(Long userId) {
        // Find user in database or throw error
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Map entity to response dto
        return mapToResponse(user);
    }

    @Override
    public UserResponse updateUserProfile(Long userId, UserUpdateRequest request) {
        // Find existing user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Update name if provided
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        // Update username if provided
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            // Check if new username is already taken by someone else
            user.setUsername(request.getUsername());
        }

        // Update bio if provided
        if (request.getUserBio() != null) {
            user.setUserBio(request.getUserBio());
        }

        // Handle profile image upload
        MultipartFile imageFile = request.getProfileImage();
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(imageFile);
            user.setProfileImageUrl(imageUrl);
        }

        // Save updated user to database
        User savedUser = userRepository.save(user);

        // Return updated profile
        return mapToResponse(savedUser);
    }

    @Override
    public List<UserResponse> searchUsers(String query) {
        // Search users in database using the custom query
        List<User> users = userRepository.searchUsers(query);

        // Convert list of entities to list of response dtos
        return users.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Helper method to convert User entity to DTO manually
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .userBio(user.getUserBio())
                .profileImageUrl(user.getProfileImageUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }
}