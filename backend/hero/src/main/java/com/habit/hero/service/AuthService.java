package com.habit.hero.service;

import com.habit.hero.dto.authDto.AuthResponse;
import com.habit.hero.dto.authDto.LoginRequest;
import com.habit.hero.dto.authDto.RegisterRequest;
import com.habit.hero.dto.authDto.ResetPasswordRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    String verifyEmail(String token);

    AuthResponse login(LoginRequest request);

    void forgotPassword(String email);

    void resetPassword(ResetPasswordRequest request);

}