package com.habit.hero.controller.report;

import com.habit.hero.dto.report.FullReportResponse;
import com.habit.hero.dto.report.WeeklyReportResponse;
import com.habit.hero.service.report.ReportService;
import com.habit.hero.util.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping("/weekly")
    public ResponseEntity<WeeklyReportResponse> getWeeklyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = true) Long habitId
    ){
        Long userId = currentUserUtil.getCurrentUserId();
        log.info("Generating weekly report for user: {}, habitId: {}", userId, habitId);

        try {
            // FIXED: Now passing the authenticated userId instead of hardcoded 1L
            WeeklyReportResponse report = reportService.generateWeeklyReport(
                    userId, startDate, endDate, habitId
            );
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Error generating weekly report: {}", e.getMessage(), e);
            throw e;
        }
    }

//    @GetMapping("/dashboard")
//    public ResponseEntity<FullReportResponse> getDashboardReport(
//            // FIXED: Removed @RequestHeader("userId"), getting ID from token instead
//            @RequestParam int year,
//            @RequestParam(defaultValue = "0") int month,
//            @RequestParam(required = false) Integer week
//    ) {
//        Long userId = currentUserUtil.getCurrentUserId();
//        log.info("API: Fetching Dashboard report for user={}, year={}, month={}, week={}", userId, year, month, week);
//
//        FullReportResponse response = reportService.getDashboardReport(userId, year, month, week);
//
//        return ResponseEntity.ok(response);
//    }

    @GetMapping("/dashboard")
    public ResponseEntity<FullReportResponse> getDashboardReport(
            @RequestParam int year,
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(required = false) Integer week
    ) {
        Long userId = currentUserUtil.getCurrentUserId();
        log.info("API: Fetching Dashboard report for user={}, year={}, month={}, week={}", userId, year, month, week);

        FullReportResponse response = reportService.getDashboardReport(userId, year, month, week);
        return ResponseEntity.ok(response);
    }
}