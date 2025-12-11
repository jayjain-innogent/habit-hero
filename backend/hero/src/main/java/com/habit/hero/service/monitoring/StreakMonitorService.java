package com.habit.hero.service.monitoring;

import com.habit.hero.dao.HabitDAO;
import com.habit.hero.entity.Habit;
import com.habit.hero.entity.User;
import com.habit.hero.enums.NotificationType;
import com.habit.hero.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StreakMonitorService {

    private final HabitDAO habitDAO;
    private final NotificationService notificationService;

    // 1. STREAK BREAK CHECK (12:05 AM)
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void monitorMissedHabits() {
        log.info("Running daily streak monitor job (Break Check).");

        LocalDate yesterday = LocalDate.now().minusDays(1);
        List<Habit> missedHabits = habitDAO.findActiveHabitsNotLoggedSince(yesterday);

        if (missedHabits.isEmpty()) return;

        // Group habits by User
        Map<User, List<Habit>> habitsByUser = missedHabits.stream()
                .collect(Collectors.groupingBy(Habit::getUser));

        habitsByUser.forEach((user, habits) -> {
            String message;
            if (habits.size() == 1) {
                message = "💔 Streak Broken: '" + habits.get(0).getTitle() + "' was missed yesterday.";
            } else {
                message = "💔 Streak Broken: You missed habits yesterday. Start fresh today!";
            }

            notificationService.createNotification(
                    user.getUserId(),
                    null,
                    NotificationType.STREAK_BREAK,
                    message,
                    habits.get(0).getId() // Link to the first habit
            );
        });
    }

    @Scheduled(cron = "0 0 23 * * *")
    @Transactional
    public void triggerStreakRescue() {
        log.info("Running Streak Rescue job.");

        LocalDate today = LocalDate.now();
        List<Habit> pendingHabits = habitDAO.findActiveHabitsNotLoggedSince(today);

        if (pendingHabits.isEmpty()) return;

        // Group habits by User
        Map<User, List<Habit>> habitsByUser = pendingHabits.stream()
                .collect(Collectors.groupingBy(Habit::getUser));
        
        habitsByUser.forEach((user, habits) -> {
            String message;
            if (habits.size() == 1) {
                message = "🔥 Streak Rescue! 1 hour left to complete '" + habits.get(0).getTitle() + "'.";
            } else {
                message = "🔥 Streak Rescue! You have habits pending for today. Keep the streak alive!";
            }

            notificationService.createNotification(
                    user.getUserId(),
                    null,
                    NotificationType.STREAK_REACTION,
                    message,
                    habits.get(0).getId()
            );
        });

        log.info("Streak Rescue notifications sent to {} users.", habitsByUser.size());
    }
}