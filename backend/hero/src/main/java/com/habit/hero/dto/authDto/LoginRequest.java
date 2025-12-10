package com.habit.hero.dto.authDto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String emailOrUsername;
    private String password;
}