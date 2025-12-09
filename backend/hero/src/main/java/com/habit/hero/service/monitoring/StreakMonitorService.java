package com.habit.hero.service.monitoring;

import com.habit.hero.dao.HabitDAO;
import com.habit.hero.entity.Habit;
import com.habit.hero.enums.NotificationType;
import com.habit.hero.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StreakMonitorService {

    private final HabitDAO habitDAO;
    private final NotificationService notificationService;

    // Run this job every day at 12:05 AM (after midnight)
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void monitorMissedHabits() {
        log.info("Running daily streak monitor job.");

        LocalDate yesterday = LocalDate.now().minusDays(1);

        // Fetch all habits that were expected to be completed yesterday but weren't
        // Assumption: HabitDAO has a method to fetch habits needing check
        List<Habit> missedHabits = habitDAO.findActiveHabitsNotLoggedSince(yesterday);

        if (missedHabits.isEmpty()) {
            log.info("No streak breaks detected today.");
            return;
        }

        for (Habit habit : missedHabits) {
            log.warn("Streak broken for Habit ID: {}", habit.getId());

            // 1. Notify the user about the streak break
            String message = "Your streak for '" + habit.getTitle() + "' was broken! Don't worry, start again today.";

            notificationService.createNotification(
                    habit.getUser().getUserId(),
                    null, // System notification
                    NotificationType.STREAK_BREAK, // Assuming you have STREAK_BREAK enum type
                    message,
                    habit.getId()
            );

            // 2. Optionally: Reset the streak count in the Habit entity here
            // habit.setCurrentStreak(0);
            // habitDAO.save(habit);
        }
        log.info("Streak monitor job finished.");
    }
}