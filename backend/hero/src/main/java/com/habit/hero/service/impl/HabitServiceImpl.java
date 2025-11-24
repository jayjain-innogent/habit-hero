package com.habit.hero.service.impl;

import com.habit.hero.dao.HabitDAO;
import com.habit.hero.dto.habit.HabitCreateRequest;
import com.habit.hero.dto.habit.HabitResponse;
import com.habit.hero.dto.habit.HabitUpdateRequest;
import com.habit.hero.dto.habit.HabitBulkCreateRequest;
import com.habit.hero.entity.Habit;
import com.habit.hero.exception.BadRequestException;
import com.habit.hero.exception.ResourceNotFoundException;
import com.habit.hero.mapper.HabitMapper;
import com.habit.hero.service.HabitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.prefs.BackingStoreException;

@Service
@RequiredArgsConstructor
@Slf4j
public class HabitServiceImpl implements HabitService {

    private final HabitDAO habitDAO;
    private HabitMapper habitMapper;

    @Override
    public HabitResponse createHabit(Long userId, HabitCreateRequest request) {
        log.info("Creating habit for user {}", userId);
        if (userId == null || request == null) throw new BadRequestException("UserId and Request body requires");

        Habit habit = HabitMapper.toEntity(request, userId);

        Habit saved = habitDAO.save(habit);

        return HabitMapper.toResponse(saved);
    }

    @Override
    public HabitResponse getHabit(Long userId, Long habitId) {
        log.info("Creating habit for user {} and habitId {}", userId, habitId);
        if (userId == null || habitId == null) throw new BadRequestException("UserId and HabitId requires");

        Habit habit = habitDAO.findByIdAndUserId(habitId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Habit not found"));

        return HabitMapper.toResponse(habit);
    }

    @Override
    public List<HabitResponse> getAllHabits(Long userId) {
        log.info("Fetching all habits for user {}", userId);
        if (userId == null) throw new BadRequestException("UserID requires");
        return habitDAO.findByUserId(userId)
                .stream()
                .map(HabitMapper::toResponse)
                .toList();
    }

    @Override
    public HabitResponse updateHabit(Long userId, Long habitId, HabitUpdateRequest request) {
        log.info("Updating habit {} for user {}", habitId, userId);
        if (userId == null || request == null || habitId == null) throw new BadRequestException("UserId, HabitId, and Request body requires");

        Habit habit = habitDAO.findByIdAndUserId(habitId, userId).orElseThrow(
                () -> new ResourceNotFoundException("Habit not found")
        );

        HabitMapper.updateEntity(habit, request);

        Habit updated = habitDAO.save(habit);

        return HabitMapper.toResponse(updated);
    }

    @Override
    public void deleteHabit(Long userId, Long habitId) {
        if (userId == null || habitId == null) throw new BadRequestException("UserId and HabitId body requires");

        Habit habit = habitDAO.findByIdAndUserId(habitId, userId).orElseThrow(
                () -> new ResourceNotFoundException("Habit not found")
        );

        habitDAO.delete(habit);
    }

    @Override
    public List<HabitResponse> bulkCreateHabits(Long userId, HabitBulkCreateRequest request) {
        log.info("Service: Bulk creating habits for user {}", userId);

        // Convert each request DTO → Entity
        List<Habit> habitEntities = request.getHabits()
                .stream()
                .map(h -> HabitMapper.toEntity(h, userId))
                .toList();

        // Save all
        List<Habit> savedHabits = habitDAO.saveAll(habitEntities);

        // Convert entity list to response list
        return savedHabits.stream()
                .map(HabitMapper::toResponse)
                .toList();
    }
}
