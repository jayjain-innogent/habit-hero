package com.habit.hero.dto.authDto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String username;
    private String password;
}