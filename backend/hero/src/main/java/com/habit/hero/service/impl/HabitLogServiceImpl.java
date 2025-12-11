package com.habit.hero.service.impl;

import com.habit.hero.dao.HabitDAO;
import com.habit.hero.dao.HabitLogDAO;
import com.habit.hero.dto.habit.HabitResponse;
import com.habit.hero.dto.habitlog.HabitLogCreateRequest;
import com.habit.hero.dto.habitlog.HabitLogResponse;
import com.habit.hero.dto.habitlog.HabitStatusItem;
import com.habit.hero.dto.habitlog.TodayStatusResponse;
import com.habit.hero.entity.Habit;
import com.habit.hero.entity.HabitLog;
import com.habit.hero.entity.User;
import com.habit.hero.enums.Cadence;
import com.habit.hero.enums.NotificationType;
import com.habit.hero.exception.BadRequestException;
import com.habit.hero.exception.ResourceNotFoundException;
import com.habit.hero.mapper.HabitLogMapper;
import com.habit.hero.mapper.HabitMapper;
import com.habit.hero.repository.HabitLogRepository;
import com.habit.hero.repository.UserRepository;
import com.habit.hero.service.HabitLogService;
import com.habit.hero.service.NotificationService;
import com.habit.hero.utils.StreakCalculator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class HabitLogServiceImpl implements HabitLogService {

    private final HabitLogDAO habitLogDAO;
    private final HabitDAO habitDAO;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Direct repo needed for efficient counting queries for streak logic
    private final HabitLogRepository habitLogRepository;

    @Override
    @Transactional
    public HabitResponse markHabitComplete(Long userId, Long habitId) {

        if (userId == null || habitId == null)
            throw new BadRequestException("userId and habitId required");

        log.info("Marking habit {} complete for user {} inside HabitLogService", habitId, userId);

        // Fetch Habit using DAO
        Habit habit = habitDAO.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found or access denied"));

        LocalDate today = LocalDate.now();

        // Check duplicate (If already done today, just return existing state)
        boolean alreadyCompleted = habitLogDAO.findTodayLog(habitId, today).isPresent();
        if (alreadyCompleted) {
            return HabitMapper.toResponse(habit);
        }

        // Create Log Entity (History)
        HabitLog logEntity = HabitLog.builder()
                .habit(habit)
                .logDate(today)
                .createdAt(LocalDateTime.now())
                .build();

        // Save log via DAO
        habitLogDAO.save(logEntity);

        // --- Streak Calculation Logic ---
        int currentStreak = habit.getCurrentStreak() == null ? 0 : habit.getCurrentStreak();
        int newStreak = currentStreak;

        // Determine calculation based on Cadence
        if (habit.getCadence() == Cadence.DAILY) {
            newStreak = StreakCalculator.calculateDailyStreak(currentStreak, habit.getLastActivityDate());
        }
        else if (habit.getCadence() == Cadence.WEEKLY) {
            LocalDate start = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
            LocalDate end = today.with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));

            // Count logs for this week (inclusive of today's log)
            int count = habitLogRepository.countByHabit_IdAndLogDateBetween(habitId, start, end);
            int target = habit.getSessionCount() != null ? habit.getSessionCount() : 1;

            newStreak = StreakCalculator.calculateWeeklyStreak(currentStreak, count, target);
        }
        else if (habit.getCadence() == Cadence.MONTHLY) {
            LocalDate start = today.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate end = today.with(TemporalAdjusters.lastDayOfMonth());

            // Count logs for this month (inclusive of today's log)
            int count = habitLogRepository.countByHabit_IdAndLogDateBetween(habitId, start, end);
            int target = habit.getSessionCount() != null ? habit.getSessionCount() : 1;

            newStreak = StreakCalculator.calculateMonthlyStreak(currentStreak, count, target);
        }

        // Update Habit Entity with new stats
        habit.setCurrentStreak(newStreak);
        habit.setLongestStreak(StreakCalculator.updateLongest(newStreak, habit.getLongestStreak() == null ? 0 : habit.getLongestStreak()));
        habit.setLastActivityDate(today);

        // Save updated Habit using DAO
        Habit savedHabit = habitDAO.save(habit);

        // Return HabitResponse so frontend gets updated streak immediately
        return HabitMapper.toResponse(savedHabit);
    }

    // Create a new habit log for a user and send notifications
    @Override
    public HabitLogResponse createLog(Long userId, Long habitId, HabitLogCreateRequest request) {

        if (userId == null || habitId == null || request == null)
            throw new BadRequestException("userId, habitId, and request body required");

        log.info("Creating log for user {} habit {}", userId, habitId);

        // Check user existence
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check habit existence and ownership
        Habit habit = habitDAO.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found or access denied"));

        LocalDate logDate = request.getLogDate() == null ? LocalDate.now() : request.getLogDate();

        // Check if log already exists for this date
        habitLogDAO.findTodayLog(habitId, logDate)
                .ifPresent(l -> {
                    throw new BadRequestException("Log already exists for this date");
                });

        // Create and Save Log
        HabitLog logEntity = HabitLogMapper.toEntity(request, habit);
        logEntity.setCreatedAt(LocalDateTime.now());
        logEntity.setLogDate(logDate);

        HabitLog saved = habitLogDAO.save(logEntity);

        // Notify user about streak update
        notificationService.createNotification(
                userId,
                null,
                NotificationType.STREAK_REACTION,
                "Streak updated! You completed your habit.",
                habitId
        );

        // Check and notify for milestone achievements
        try {
            int currentStreak = habit.getCurrentStreak();
            if (currentStreak == 7 || currentStreak == 30) {
                String message = "Congratulations! You hit a " + currentStreak + "-day milestone on " + habit.getTitle();
                notificationService.createNotification(
                        userId,
                        null,
                        NotificationType.MILESTONE,
                        message,
                        habitId
                );
            }
        } catch (Exception e) {
            log.error("Failed to check or create milestone notification after saving log.", e);
        }

        return HabitLogMapper.toResponse(saved);
    }

    // Get all logs for a specific habit of a user
    @Override
    public List<HabitLogResponse> getLogsForHabit(Long userId, Long habitId) {

        if (userId == null || habitId == null)
            throw new BadRequestException("userId and habitId required");

        log.info("Fetching logs for user {} habit {}", userId, habitId);

        // Verify Habit ownership
        habitDAO.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found or access denied"));

        // Return list of logs
        return habitLogDAO.findByHabitId(habitId)
                .stream()
                .map(HabitLogMapper::toResponse)
                .toList();
    }

    // Delete a specific habit log and its notification
    @Override
    @Transactional
    public void deleteLog(Long userId, Long logId) {

        if (userId == null || logId == null)
            throw new BadRequestException("userId and logId required");

        log.info("Deleting log {} for user {}", logId, userId);

        // Find log ensuring user owns the habit
        HabitLog logEntity = habitLogDAO.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Log not found or access denied"));

        // Delete Log
        Long habitId = logEntity.getHabit().getId();

        habitLogDAO.delete(logEntity);

        // Delete the associated notification
        try {
            notificationService.deleteNotificationByReference(
                    userId,
                    NotificationType.STREAK_REACTION,
                    habitId
            );
        } catch (Exception e) {
            log.error("Failed to delete notification", e);
        }
    }

    // Get logs for a habit within a specific date range
    @Override
    public List<HabitLogResponse> getLogsInRange(Long userId, Long habitId, LocalDate start, LocalDate end) {

        if (userId == null || habitId == null || start == null || end == null)
            throw new BadRequestException("userId, habitId, start, and end required");

        log.info("Fetching logs in range {} to {} for user {} habit {}", start, end, userId, habitId);

        // Verify Habit ownership
        habitDAO.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found or access denied"));

        // Fetch logs in date range
        return habitLogDAO.findByHabitIdAndDateRange(habitId, start, end)
                .stream()
                .map(HabitLogMapper::toResponse)
                .toList();
    }

    // Get today's status for all habits of a user
    @Override
    public TodayStatusResponse getTodayStatus(Long userId) {

        if (userId == null)
            throw new BadRequestException("userId required");

        log.info("Fetching today-status for user {}", userId);

        List<Habit> habits = habitDAO.findByUserId(userId);
        LocalDate today = LocalDate.now();

        Map<Long, HabitStatusItem> responseMap = new HashMap<>();

        // Iterate through habits and check today's log status
        for (Habit habit : habits) {
            Optional<HabitLog> todayLog = habitLogDAO.findTodayLog(habit.getId(), today);

            HabitStatusItem item = todayLog
                    .map(HabitLogMapper::toTodayStatus)
                    .orElse(
                            HabitStatusItem.builder()
                                    .completedToday(false)
                                    .actualValue(null)
                                    .logId(null)
                                    .build()
                    );

            responseMap.put(habit.getId(), item);
        }

        return new TodayStatusResponse(responseMap);
    }

    // Get a specific note for a habit log
    @Override
    public HabitLogResponse getNote(Long userId, Long logId) {

        if (userId == null || logId == null)
            throw new BadRequestException("userId and logId required");

        log.info("Fetching note for user {} log {}", userId, logId);

        // Find log ensuring ownership
        HabitLog logEntity = habitLogDAO.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Log not found or access denied"));

        return HabitLogMapper.toResponse(logEntity);
    }

    // Update the note for a specific habit log
    @Override
    public HabitLogResponse updateNote(Long userId, Long logId, String note) {

        if (userId == null || logId == null || note == null || note.trim().isEmpty())
            throw new BadRequestException("userId, logId and note are required");

        log.info("Updating note for user {} log {}", userId, logId);

        // Find log
        HabitLog logEntity = habitLogDAO.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Log not found or access denied"));

        // Update Note
        logEntity.setNote(note);

        HabitLog updated = habitLogDAO.save(logEntity);

        return HabitLogMapper.toResponse(updated);
    }

    // Delete the note from a specific habit log
    @Override
    public void deleteNote(Long userId, Long logId) {

        if (userId == null || logId == null)
            throw new BadRequestException("userId and logId required");

        log.info("Deleting note for user {} log {}", userId, logId);

        // Find log
        HabitLog logEntity = habitLogDAO.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Log not found or access denied"));

        // Clear Note
        logEntity.setNote(null);

        habitLogDAO.save(logEntity);
    }
}