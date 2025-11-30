package com.habit.hero.dto.habit;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitBulkCreateRequest {
    private List<HabitCreateRequest> habits; // list of habits to create
}