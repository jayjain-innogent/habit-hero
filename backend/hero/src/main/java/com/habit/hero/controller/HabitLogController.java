package com.habit.hero.controller;

import com.habit.hero.dto.habitlog.HabitLogCreateRequest;
import com.habit.hero.dto.habitlog.HabitLogResponse;
import com.habit.hero.dto.habitlog.TodayStatusResponse;
import com.habit.hero.service.HabitLogService;
import com.habit.hero.util.CurrentUserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/habits")
@RequiredArgsConstructor
@Slf4j
public class HabitLogController {

    private final HabitLogService habitLogService;
    private final CurrentUserUtil currentUserUtil;

    // Create a log (Manual date entry)
    @PostMapping("/{habitId}/logs")
    public ResponseEntity<HabitLogResponse> createLog(
            @PathVariable Long habitId,
            @Valid @RequestBody HabitLogCreateRequest request
    ) {
        Long userId = currentUserUtil.getCurrentUserId();
        log.info("API: create log user {} habit {}", userId, habitId);
        HabitLogResponse resp = habitLogService.createLog(userId, habitId, request);
        return ResponseEntity.ok(resp);
    }

    // Get logs for a habit
    @GetMapping("/{habitId}/logs")
    public ResponseEntity<List<HabitLogResponse>> getLogs(@PathVariable Long habitId) {
        Long userId = currentUserUtil.getCurrentUserId();
        log.info("API: get logs user {} habit {}", userId, habitId);
        List<HabitLogResponse> resp = habitLogService.getLogsForHabit(userId, habitId);
        return ResponseEntity.ok(resp);
    }

    // Get logs in date range
    @GetMapping("/{habitId}/logs/range")
    public ResponseEntity<List<HabitLogResponse>> getLogsInRange(
            @PathVariable Long habitId,
            @RequestParam("start") LocalDate start,
            @RequestParam("end") LocalDate end
    ) {
        Long userId = currentUserUtil.getCurrentUserId();
        log.info("API: get logs in range user {} habit {} {} to {}", userId, habitId, start, end);
        List<HabitLogResponse> resp = habitLogService.getLogsInRange(userId, habitId, start, end);
        return ResponseEntity.ok(resp);
    }

    // Delete a log
    @DeleteMapping("/logs/{logId}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long logId) {
        Long userId = currentUserUtil.getCurrentUserId();
        log.info("API: delete log {} user {}", logId, userId);
        habitLogService.deleteLog(userId, logId);
        return ResponseEntity.noContent().build();
    }

    // Get today's status for dashboard
    @GetMapping("/today-status")
    public ResponseEntity<TodayStatusResponse> getTodayStatus() {
        Long userId = currentUserUtil.getCurrentUserId();
        log.info("API: get today-status for user {}", userId);
        TodayStatusResponse resp = habitLogService.getTodayStatus(userId);
        return ResponseEntity.ok(resp);
    }

    // Get note
    @GetMapping("/logs/{logId}/note")
    public ResponseEntity<HabitLogResponse> getNote(@PathVariable Long logId) {
        Long userId = currentUserUtil.getCurrentUserId();
        log.info("API: get note for log {} user {}", logId, userId);
        HabitLogResponse resp = habitLogService.getNote(userId, logId);
        return ResponseEntity.ok(resp);
    }

    // Update note
    @PatchMapping("/logs/{logId}/note")
    public ResponseEntity<HabitLogResponse> updateNote(
            @PathVariable Long logId,
            @RequestBody String note
    ) {
        Long userId = currentUserUtil.getCurrentUserId();
        log.info("API: update note for log {} user {}", logId, userId);
        HabitLogResponse resp = habitLogService.updateNote(userId, logId, note);
        return ResponseEntity.ok(resp);
    }

    // Delete note
    @DeleteMapping("/logs/{logId}/note")
    public ResponseEntity<Void> deleteNote(@PathVariable Long logId) {
        Long userId = currentUserUtil.getCurrentUserId();
        log.info("API: delete note for log {} user {}", logId, userId);
        habitLogService.deleteNote(userId, logId);
        return ResponseEntity.noContent().build();
    }
}