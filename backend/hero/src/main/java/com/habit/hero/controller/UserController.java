package com.habit.hero.controller;

import com.habit.hero.entity.User;
import com.habit.hero.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody User updatedUserData) {

        User existing = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        existing.setUsername(updatedUserData.getUsername());
        existing.setUserBio(updatedUserData.getUserBio());
        existing.setProfileImageUrl(updatedUserData.getProfileImageUrl());

        User saved = userRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        List<User> users = userRepository.searchUsers(query);
        return ResponseEntity.ok(users);
    }
}