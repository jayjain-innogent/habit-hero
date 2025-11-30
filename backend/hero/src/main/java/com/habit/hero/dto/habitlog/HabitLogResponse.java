package com.habit.hero.dto.habitlog;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitLogResponse {

    private Long logId;
    private Long habitId;
    private LocalDate logDate;
    private BigDecimal actualValue;
    private String note;
    private LocalDateTime createdAt;
}
