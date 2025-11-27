package com.habit.hero.dto.habitlog;

import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitLogCreateRequest {
    private LocalDate logDate;

    @Positive
    private BigDecimal actualValue;

    private String note;
}
