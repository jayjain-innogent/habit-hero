package com.habit.hero.controller;


import com.habit.hero.service.ReportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/overall")
    public void downloadOverallReport(
            @RequestHeader Long userId,
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) Integer week,
            HttpServletResponse response
    ) {
        log.info("Request: OVERALL report for user={}, year={}, month={}, week={}", userId, year, month, week);
        reportService.downloadOverallReport(userId, year, month, week, response);
    }

    @GetMapping("/habit")
    public void downloadSingleHabitReport(
            @RequestHeader Long userId,
            @RequestParam Long habitId,
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) Integer week,
            HttpServletResponse response
    ) {
        log.info("Request: SINGLE HABIT report user={}, habitId={}, year={}, month={}, week={}",
                userId, habitId, year, month, week);

        reportService.downloadSingleHabitReport(userId, habitId, year, month, week, response);

    }
}
