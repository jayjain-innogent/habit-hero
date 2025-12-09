package com.habit.hero.service;

import com.habit.hero.dto.report.FullReportResponse;

public interface ReportService {

    FullReportResponse getDashboardReport(Long userId, int year, int month, Integer week);
}