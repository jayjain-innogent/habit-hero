package com.habit.hero.controller;

import com.habit.hero.dto.habitlog.HabitLogCreateRequest;
import com.habit.hero.dto.habitlog.HabitLogResponse;
import com.habit.hero.dto.habitlog.TodayStatusResponse;
import com.habit.hero.service.HabitLogService;
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
@CrossOrigin("*")
public class HabitLogController {

    private final HabitLogService habitLogService;

    @PostMapping("/{habitId}/logs")
    public ResponseEntity<HabitLogResponse> createLog(
            @RequestHeader("userId") Long userId,
            @PathVariable Long habitId,
            @Valid @RequestBody HabitLogCreateRequest request
    ) {
        log.info("API: create log user {} habit {}", userId, habitId);
        HabitLogResponse resp = habitLogService.createLog(userId, habitId, request);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{habitId}/logs")
    public ResponseEntity<List<HabitLogResponse>> getLogs(
            @RequestHeader("userId") Long userId,
            @PathVariable Long habitId
    ) {
        log.info("API: get logs user {} habit {}", userId, habitId);
        List<HabitLogResponse> resp = habitLogService.getLogsForHabit(userId, habitId);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{habitId}/logs/range")
    public ResponseEntity<List<HabitLogResponse>> getLogsInRange(
            @RequestHeader("userId") Long userId,
            @PathVariable Long habitId,
            @RequestParam("start") LocalDate start,
            @RequestParam("end") LocalDate end
    ) {
        log.info("API: get logs in range user {} habit {} {} to {}", userId, habitId, start, end);
        List<HabitLogResponse> resp = habitLogService.getLogsInRange(userId, habitId, start, end);
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/logs/{logId}")
    public ResponseEntity<Void> deleteLog(
            @RequestHeader("userId") Long userId,
            @PathVariable Long logId
    ) {
        log.info("API: delete log {} user {}", logId, userId);
        habitLogService.deleteLog(userId, logId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/today-status")
    public ResponseEntity<TodayStatusResponse> getTodayStatus(
            @RequestHeader("userId") Long userId
    ) {
        log.info("API: get today-status for user {}", userId);
        TodayStatusResponse resp = habitLogService.getTodayStatus(userId);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/logs/{logId}/note")
    public ResponseEntity<HabitLogResponse> getNote(
            @RequestHeader("userId") Long userId,
            @PathVariable Long logId
    ) {
        log.info("API: get note for log {} user {}", logId, userId);
        HabitLogResponse resp = habitLogService.getNote(userId, logId);
        return ResponseEntity.ok(resp);
    }

    @PatchMapping("/logs/{logId}/note")
    public ResponseEntity<HabitLogResponse> updateNote(
            @RequestHeader("userId") Long userId,
            @PathVariable Long logId,
            @RequestBody String note
    ) {
        log.info("API: update note for log {} user {}", logId, userId);
        HabitLogResponse resp = habitLogService.updateNote(userId, logId, note);
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/logs/{logId}/note")
    public ResponseEntity<Void> deleteNote(
            @RequestHeader("userId") Long userId,
            @PathVariable Long logId
    ) {
        log.info("API: delete note for log {} user {}", logId, userId);
        habitLogService.deleteNote(userId, logId);
        return ResponseEntity.noContent().build();
    }
}
