package com.habit.hero.service.impl;

import com.habit.hero.dao.HabitDAO;
import com.habit.hero.dao.HabitLogDAO;
import com.habit.hero.dto.habitlog.HabitLogCreateRequest;
import com.habit.hero.dto.habitlog.HabitLogResponse;
import com.habit.hero.dto.habitlog.HabitStatusItem;
import com.habit.hero.dto.habitlog.TodayStatusResponse;
import com.habit.hero.entity.Habit;
import com.habit.hero.entity.HabitLog;
import com.habit.hero.entity.User;
import com.habit.hero.exception.BadRequestException;
import com.habit.hero.exception.ResourceNotFoundException;
import com.habit.hero.mapper.HabitLogMapper;
import com.habit.hero.repository.UserRepository;
import com.habit.hero.service.HabitLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class HabitLogServiceImpl implements HabitLogService {

    private final HabitLogDAO habitLogDAO;
    private final HabitDAO habitDAO;
    private final UserRepository userRepository;

    @Override
    public HabitLogResponse createLog(Long userId, Long habitId, HabitLogCreateRequest request){
        if (userId == null || habitId == null || request == null)
            throw new BadRequestException("userId, habitId, and request body required");

        log.info("Creating log for user {} habit {}", userId, habitId);

        //user check
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        //Habit check
        Habit habit = habitDAO.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));

        //setting the date
        LocalDate logDate = request.getLogDate() == null ? LocalDate.now() : request.getLogDate();

        //unique check
        habitLogDAO.findTodayLog(habitId, logDate)
                .ifPresent(l -> { throw new BadRequestException("Log already exists for this date"); });

        //map to entity
        HabitLog logEntity = HabitLogMapper.toEntity(request, habit);
        logEntity.setCreatedAt(LocalDateTime.now());
        logEntity.setLogDate(logDate);

        //save
        HabitLog saved = habitLogDAO.save(logEntity);

        return HabitLogMapper.toResponse(saved);
    }

    @Override
    public List<HabitLogResponse> getLogsForHabit(Long userId, Long habitId) {
        if (userId == null || habitId == null)
            throw new BadRequestException("userId and habitId required");

        log.info("Fetching logs for user {} habit {}", userId, habitId);

        //check access
        habitDAO.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found or access denied"));

        return habitLogDAO.findByHabitId(habitId)
                .stream()
                .map(HabitLogMapper::toResponse)
                .toList();

    }

    @Override
    public void deleteLog(Long userId, Long logId) {
        if (userId == null || logId == null)
            throw new BadRequestException("userId and logId required");

        log.info("Deleting log {} for user {}", logId, userId);

        HabitLog logEntity = habitLogDAO.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Log not found or access denied"));

        habitLogDAO.delete(logEntity);
    }

    @Override
    public List<HabitLogResponse> getLogsInRange(Long userId, Long habitId, LocalDate start, LocalDate end) {
        if (userId == null || habitId == null || start == null || end == null)
            throw new BadRequestException("userId, habitId, start and end required");

        log.info("Fetching logs in range {} to {} for user {} habit {}", start, end, userId, habitId);

        habitDAO.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found or access denied"));

        return habitLogDAO.findByHabitIdAndDateRange(habitId, start, end)
                .stream()
                .map(HabitLogMapper::toResponse)
                .toList();
    }

    public TodayStatusResponse getTodayStatus(Long userId) {

        if (userId == null)
            throw new BadRequestException("userId required");

        log.info("Fetching today-status for user {}", userId);

        List<Habit> habits = habitDAO.findByUserId(userId);
        LocalDate today = LocalDate.now();

        Map<Long, HabitStatusItem> responseMap = new HashMap<>();

        for (Habit habit : habits) {

            Optional<HabitLog> todayLog =
                    habitLogDAO.findTodayLog(habit.getId(), today);

            HabitStatusItem item = todayLog
                    .map(HabitLogMapper::toTodayStatus)
                    .orElse(HabitStatusItem.builder()
                            .completedToday(false)
                            .actualValue(null)
                            .build());

            responseMap.put(habit.getId(), item);
        }

        return new TodayStatusResponse(responseMap);
    }


}
