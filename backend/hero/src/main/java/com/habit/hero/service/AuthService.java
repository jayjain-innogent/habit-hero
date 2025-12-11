package com.habit.hero.service;

import com.habit.hero.dto.authDto.AuthResponse;
import com.habit.hero.dto.authDto.LoginRequest;
import com.habit.hero.dto.authDto.RegisterRequest;
import com.habit.hero.dto.authDto.ResetPasswordRequest;
import com.habit.hero.dto.authDto.VerifyOtpRequest;

public interface    AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse verifyOtp(VerifyOtpRequest request);

    void forgotPassword(String email);

    void resetPassword(ResetPasswordRequest request);

    String verifyEmail(String token);
}