package com.habit.hero.service.impl;

import com.habit.hero.dao.HabitDAO;
import com.habit.hero.dto.habit.*;
import com.habit.hero.entity.Habit;
import com.habit.hero.entity.User;
import com.habit.hero.enums.Cadence;
import com.habit.hero.mapper.HabitMapper;
import com.habit.hero.repository.UserRepository;
import com.habit.hero.service.HabitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class HabitServiceImpl implements HabitService {

    private final HabitDAO habitDAO;
    private final UserRepository userRepository;

    @Override
    public HabitResponse createHabit(Long userId, HabitCreateRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Habit habit = HabitMapper.toEntity(request, user);
        if (request.getCadence() == Cadence.DAILY) {
            request.setSessionCount(null); // No sessions required
        }
        Habit saved = habitDAO.save(habit);

        return HabitMapper.toResponse(saved);
    }

    @Override
    public HabitResponse updateHabit(Long userId, Long habitId, HabitUpdateRequest request) {

        Habit habit = habitDAO.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new RuntimeException("Habit not found or access denied"));

        HabitMapper.updateEntity(habit, request);

        Habit updatedHabit = habitDAO.save(habit);

        return HabitMapper.toResponse(updatedHabit);
    }

    @Override
    public HabitResponse getHabit(Long userId, Long habitId) {

        Habit habit = habitDAO.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new RuntimeException("Habit not found or access denied"));

        return HabitMapper.toResponse(habit);
    }

    @Override
    public List<HabitResponse> getAllHabits(Long userId) {

        List<Habit> habits = habitDAO.findByUserId(userId);

        return habits.stream()
                .map(HabitMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteHabit(Long userId, Long habitId) {

        Habit habit = habitDAO.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new RuntimeException("Habit not found or access denied"));

        habitDAO.delete(habit);
    }

    @Override
    public List<HabitResponse> bulkCreateHabits(Long userId, HabitBulkCreateRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Habit> entities = request.getHabits()
                .stream()
                .map(h -> HabitMapper.toEntity(h, user))
                .toList();

        List<Habit> saved = habitDAO.saveAll(entities);

        return saved.stream()
                .map(HabitMapper::toResponse)
                .toList();
    }
}
