package com.habit.hero.dto.report;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WeekRange {
    private LocalDate startDate;
    private LocalDate endDate;
}
