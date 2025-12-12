package com.habit.hero.dto.report;



import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WeeklyReportResponse {
    private WeekRange weekRange;
    private HabitReportData habit;
    private HabitSummary summary;
}
