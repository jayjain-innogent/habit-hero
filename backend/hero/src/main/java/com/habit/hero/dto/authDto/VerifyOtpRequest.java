package com.habit.hero.dto.authDto;

import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String email;
    private String otp;
}