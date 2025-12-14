package com.habit.hero.dto.report;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class FullReportResponse {
    private LocalDate startDate;

    private LocalDate endDate;

    private String reportTitle;

    private com.habit.hero.dto.report.ReportCardDto cardData;

    private List<com.habit.hero.dto.report.HabitRowDto> tableData;

    private String motivationMessage;
}