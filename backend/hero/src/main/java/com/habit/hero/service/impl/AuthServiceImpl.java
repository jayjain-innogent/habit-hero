package com.habit.hero.service.impl;

import com.habit.hero.dto.authDto.LoginRequest;
import com.habit.hero.dto.authDto.RegisterRequest;
import com.habit.hero.dto.authDto.AuthResponse;
import com.habit.hero.dto.authDto.ResetPasswordRequest;
import com.habit.hero.entity.User;
import com.habit.hero.enums.TokenType;
import com.habit.hero.repository.UserRepository;
import com.habit.hero.service.AuthService;
import com.habit.hero.service.MailService;
import com.habit.hero.service.VerificationTokenService;
import com.habit.hero.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VerificationTokenService verificationTokenService;
    private final MailService mailService;
    private final JwtUtil jwtUtil;   // <-- IMPORTANT

    @Value("${app.backend.url}")
    private String backendUrl;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered.");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .verified(false)
                .build();

        userRepository.save(user);

        String rawToken = verificationTokenService.createToken(
                user,
                TokenType.VERIFICATION,
                1440
        );

        String verificationLink = backendUrl + "/auth/verify?token=" + rawToken;
        mailService.sendVerificationEmail(user.getEmail(), verificationLink);

        return new AuthResponse("Registration successful! Check your email to verify.", null);
    }

    @Override
    public String verifyEmail(String rawToken) {

        // validateToken() already:
        //  - hashes token
        //  - checks expiry
        //  - checks used=false
        //  - marks used=true
        //  - returns user
        User user = verificationTokenService.validateToken(rawToken, TokenType.VERIFICATION);

        user.setVerified(true);
        userRepository.save(user);

        // Generate JWT for auto-login
        return jwtUtil.generateToken(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        // find user
        User user = userRepository.findByEmail(request.getEmailOrUsername())
                .or(() -> userRepository.findByUsername(request.getEmailOrUsername()))
                .orElseThrow(() -> new RuntimeException("Invalid email/username or password"));

        // check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email/username or password");
        }

        // BLOCK LOGIN IF NOT VERIFIED
        if (!Boolean.TRUE.equals(user.getVerified())) {
            throw new IllegalStateException("Please verify your email before logging in.");
        }

        // generate token
        String token = jwtUtil.generateToken(user);

        return new AuthResponse("Login successful!", token);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {

        // Validate token — returns user if valid
        User user = verificationTokenService.validateToken(
                request.getToken(),
                TokenType.PASSWORD_RESET
        );

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void forgotPassword(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with that email."));

        // Block if not verified
        if (!Boolean.TRUE.equals(user.getVerified())) {
            throw new IllegalStateException("Please verify your account before resetting password.");
        }

        // Create reset token valid for 30 min
        String rawToken = verificationTokenService.createToken(
                user,
                TokenType.PASSWORD_RESET,
                30 // minutes
        );

        String resetLink = backendUrl + "/auth/reset-password-page?token=" + rawToken;

        mailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

}