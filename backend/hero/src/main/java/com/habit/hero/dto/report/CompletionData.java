package com.habit.hero.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CompletionData {
    private List<LocalDateTime> completaionDate;
    private List<BigDecimal> completionValue;
}