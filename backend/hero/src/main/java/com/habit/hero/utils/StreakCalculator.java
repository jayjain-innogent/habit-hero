package com.habit.hero.utils;

import java.time.DayOfWeek;
import java.time.LocalDate;

public class StreakCalculator {

    public static int calculateDailyStreak(int currentStreak, LocalDate lastCompletionDate) {
        LocalDate today = LocalDate.now();

        if (lastCompletionDate == null) {
            return 1;
        }

        if (lastCompletionDate.equals(today)) {
            return currentStreak;
        }

        if (lastCompletionDate.equals(today.minusDays(1))) {
            return currentStreak + 1;
        }

        return 1;
    }

    public static int calculateWeeklyStreak(int currentStreak, int totalThisWeek, int weeklyTarget) {
        if (totalThisWeek == weeklyTarget) {
            return currentStreak + 1;
        }
        return currentStreak;
    }

    public static int calculateMonthlyStreak(int currentStreak, int totalThisMonth, int monthlyTarget) {
        if (totalThisMonth == monthlyTarget) {
            return currentStreak + 1;
        }
        return currentStreak;
    }

    public static int validateWeeklyStreakAtEnd(int currentStreak, int totalThisWeek, int weeklyTarget) {
        if (totalThisWeek < weeklyTarget) {
            return 0;
        }
        return currentStreak;
    }

    public static boolean isEndOfWeek(LocalDate date) {
        return date.getDayOfWeek() == DayOfWeek.SUNDAY;
    }

    public static boolean isEndOfMonth(LocalDate date) {
        return date.getDayOfMonth() == date.lengthOfMonth();
    }

    public static int updateLongest(int currentStreak, int longestStreak) {
        return Math.max(currentStreak, longestStreak);
    }
}