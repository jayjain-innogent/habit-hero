package com.habit.hero.service;

import jakarta.servlet.http.HttpServletResponse;

public interface ReportService {
    void downloadOverallReport(Long userId, int year, int month, Integer week, HttpServletResponse response);

    void downloadSingleHabitReport(Long userId, Long habitId, int year, int month, Integer week, HttpServletResponse response);
}
