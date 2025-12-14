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
import com.habit.hero.enums.NotificationType;
import com.habit.hero.exception.BadRequestException;
import com.habit.hero.exception.ResourceNotFoundException;
import com.habit.hero.mapper.HabitLogMapper;
import com.habit.hero.repository.UserRepository;
import com.habit.hero.service.HabitLogService;
import com.habit.hero.service.NotificationService;
import com.habit.hero.service.report.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class HabitLogServiceImpl implements HabitLogService {

    private final HabitLogDAO habitLogDAO;
    private final HabitDAO habitDAO;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ReportService reportService;

    // Create a new habit log for a user and send notifications
    @Override
    @Transactional
    public HabitLogResponse createLog(Long userId, Long habitId, HabitLogCreateRequest request) {

        if (userId == null || habitId == null || request == null)
            throw new BadRequestException("userId, habitId, and request body required");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Habit habit = habitDAO.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found or access denied"));

        LocalDate logDate = request.getLogDate() == null ? LocalDate.now() : request.getLogDate();

        // Prevent duplicate log for the same date
        habitLogDAO.findTodayLog(habitId, logDate)
                .ifPresent(l -> {
                    throw new BadRequestException("Log already exists for this date");
                });

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
                habitId);

        // Calculate streak and update in database
        reportService.calculateStreak(habitId, userId);

        // Fetch fresh habit data to get updated streak
        Habit updatedHabit = habitDAO.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));

        // Check and notify for milestone achievements
        try {
            int currentStreak = updatedHabit.getCurrentStreak();
            if (currentStreak == 7 || currentStreak == 30) {
                String message = "Congratulations! You hit a " + currentStreak + "-day milestone on "
                        + updatedHabit.getTitle();
                notificationService.createNotification(
                        userId,
                        null,
                        NotificationType.MILESTONE,
                        message,
                        habitId);
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

        HabitLog logEntity = habitLogDAO.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Log not found or access denied"));

        Long habitId = logEntity.getHabit().getId();

        habitLogDAO.delete(logEntity);

        reportService.calculateStreak(habitId, userId);

        // Delete the associated notification
        try {
            notificationService.deleteNotificationByReference(
                    userId,
                    NotificationType.STREAK_REACTION,
                    habitId);
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

        habitDAO.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found or access denied"));

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

        for (Habit habit : habits) {

            Optional<HabitLog> todayLog = habitLogDAO.findTodayLog(habit.getId(), today);

            HabitStatusItem item = todayLog
                    .map(HabitLogMapper::toTodayStatus)
                    .orElse(HabitStatusItem.builder()
                            .completedToday(false)
                            .actualValue(null)
                            .logId(null)
                            .build());

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

        HabitLog logEntity = habitLogDAO.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Log not found or access denied"));

        return HabitLogMapper.toResponse(logEntity);
    }

    @Override
    @Transactional
    public HabitLogResponse updateNote(Long userId, Long logId, String note) {

        if (userId == null || logId == null || note == null || note.trim().isEmpty())
            throw new BadRequestException("userId, logId and note are required");

        log.info("Updating note for user {} log {}", userId, logId);

        HabitLog logEntity = habitLogDAO.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Log not found or access denied"));

        logEntity.setNote(note);

        HabitLog updated = habitLogDAO.save(logEntity);

        return HabitLogMapper.toResponse(updated);
    }

    // Delete the note from a specific habit log
    @Override
    @Transactional
    public void deleteNote(Long userId, Long logId) {

        if (userId == null || logId == null)
            throw new BadRequestException("userId and logId required");

        log.info("Deleting note for user {} log {}", userId, logId);

        HabitLog logEntity = habitLogDAO.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Log not found or access denied"));

        logEntity.setNote(null);

        habitLogDAO.save(logEntity);
    }
}