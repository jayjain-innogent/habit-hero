package com.habit.hero.controller;

import com.habit.hero.dto.report.FullReportResponse;
import com.habit.hero.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Slf4j
//@CrossOrigin("*")
public class ReportController {

    private final ReportService reportService;

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