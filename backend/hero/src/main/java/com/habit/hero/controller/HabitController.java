package com.habit.hero.controller;


import com.habit.hero.dto.habit.HabitBulkCreateRequest;
import com.habit.hero.dto.habit.HabitCreateRequest;
import com.habit.hero.dto.habit.HabitResponse;
import com.habit.hero.dto.habit.HabitUpdateRequest;
import com.habit.hero.service.HabitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/habits")
@RequiredArgsConstructor
@Slf4j
public class HabitController {

    private final HabitService habitService;

    //Create a new habit
    @PostMapping
    public ResponseEntity<HabitResponse> createHabit(
            @RequestHeader("userId") Long userId,
            @Valid @RequestBody HabitCreateRequest request
            ){
        log.info("API: Creating habit for user {}", userId);
        HabitResponse response = habitService.createHabit(userId, request);
        return ResponseEntity.ok(response);
    }

    // Get all habits for the user
    @GetMapping
    public ResponseEntity<List<HabitResponse>> getAllHabits(
            @RequestHeader("userId") Long userId
    ) {
        log.info("API: Fetching all habits for user {}", userId);
        List<HabitResponse> habits = habitService.getAllHabits(userId);
        return ResponseEntity.ok(habits);
    }

    //Get a Specific Habit
    @GetMapping("/{habitId}")
    public ResponseEntity<HabitResponse> getHabit(
            @RequestHeader("userId") Long userId,
            @PathVariable Long habitId
    ) {
        log.info("API: Fetching habit {} for user {}", habitId, userId);
        HabitResponse response = habitService.getHabit(userId, habitId);
        return ResponseEntity.ok(response);
    }

    //Update habit
    @PatchMapping("/{habitId}")
    public ResponseEntity<HabitResponse> updateHabit(
            @RequestHeader("userId") Long userId,
            @PathVariable Long habitId,
            @Valid @RequestBody HabitUpdateRequest request
    ) {
        log.info("API: Updating habit {} for user {}", habitId, userId);
        HabitResponse response = habitService.updateHabit(userId, habitId, request);
        return ResponseEntity.ok(response);
    }

    //Delete Habit
    @DeleteMapping("/{habitId}")
    public ResponseEntity<Void> deleteHabit(
            @RequestHeader("userId") Long userId,
            @PathVariable Long habitId
    ) {
        log.info("API: Deleting habit {} for user {}", habitId, userId);
        habitService.deleteHabit(userId, habitId);
        return ResponseEntity.noContent().build();
    }

    //Bulk Insert
    @PostMapping("/bulk")
    public ResponseEntity<List<HabitResponse>> bulkCreateHabits(
            @RequestHeader("userId") Long userId,
            @Valid @RequestBody HabitBulkCreateRequest request
    ) {
        log.info("API: Bulk creating {} habits for user {}",
                request.getHabits().size(), userId);

        List<HabitResponse> responses = habitService.bulkCreateHabits(userId, request);
        return ResponseEntity.ok(responses);
    }
}
