package com.habit.hero.controller.report;


import com.habit.hero.dto.report.FullReportResponse;
import com.habit.hero.dto.report.WeeklyReportResponse;
import com.habit.hero.service.report.ReportService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/weekly")
    public ResponseEntity<WeeklyReportResponse> getWeeklyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = true) Long habitId
    ){
        log.info("Generating weekly report for startDate: {}, endDate: {}, habitId: {}",
                startDate, endDate, habitId);
        try {
            WeeklyReportResponse report = reportService.generateWeeklyReport(
                    1L, startDate, endDate, habitId
            );
            log.info("Weekly report generated successfully");
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Error generating weekly report: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<FullReportResponse> getDashboardReport(
            @RequestHeader("userId") Long userId,
            @RequestParam int year,
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(required = false) Integer week
    ) {
        log.info("API: Fetching Dashboard report for user={}, year={}, month={}, week={}", userId, year, month, week);

        FullReportResponse response = reportService.getDashboardReport(userId, year, month, week);

        return ResponseEntity.ok(response);
    }
}
