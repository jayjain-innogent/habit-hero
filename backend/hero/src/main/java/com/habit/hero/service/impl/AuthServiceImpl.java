package com.habit.hero.service.impl;

import com.habit.hero.dto.authDto.AuthResponse;
import com.habit.hero.dto.authDto.LoginRequest;
import com.habit.hero.dto.authDto.RegisterRequest;
import com.habit.hero.dto.authDto.ResetPasswordRequest;
import com.habit.hero.dto.authDto.VerifyOtpRequest;
import com.habit.hero.entity.User;
import com.habit.hero.entity.VerificationToken;
import com.habit.hero.enums.TokenType;
import com.habit.hero.repository.UserRepository;
import com.habit.hero.repository.VerificationTokenRepository;
import com.habit.hero.service.AuthService;
import com.habit.hero.service.MailService;
import com.habit.hero.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final JwtUtil jwtUtil;

    @Value("${app.backend.url}")
    private String backendUrl;

    @Override
    public AuthResponse register(RegisterRequest request) {

        // Check if email already registered
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered.");
        }

        // Check if username is taken
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken.");
        }

        // Create new User entity
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .verified(false)
                .build();

        userRepository.save(user);

        // Generate 6-digit OTP
        String otp = generateOTP();

        // Save OTP to database
        VerificationToken tokenEntity = VerificationToken.builder()
                .tokenHash(otp)
                .tokenType(TokenType.VERIFICATION)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();

        tokenRepository.save(tokenEntity);

        // Send OTP via email
        mailService.sendVerificationEmail(user.getEmail(), otp);

        return new AuthResponse("Registration successful! OTP sent to your email.", null);
    }

    @Override
    public AuthResponse verifyOtp(VerifyOtpRequest request) {

        // Find User by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if already verified
        if (Boolean.TRUE.equals(user.getVerified())) {
            return new AuthResponse("User already verified. Please login.", null);
        }

        // Find Token in DB matching OTP and Type
        VerificationToken verificationToken = tokenRepository.findByTokenHashAndTokenTypeAndUsedFalse(
                request.getOtp(), TokenType.VERIFICATION
        ).orElseThrow(() -> new RuntimeException("Invalid or used OTP"));

        // Validate Token ownership
        if (!verificationToken.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Invalid OTP for this email");
        }

        // Check for expiry
        if (verificationToken.isExpired()) {
            throw new RuntimeException("OTP has expired");
        }

        // Mark User as Verified
        user.setVerified(true);
        userRepository.save(user);

        // Mark OTP as used
        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);

        // Generate JWT for auto-login
        String jwt = jwtUtil.generateToken(user);

        return new AuthResponse("Email verified successfully!", jwt);
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        // Find user by email ONLY
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Block login if account is not verified
        if (!Boolean.TRUE.equals(user.getVerified())) {
            throw new IllegalStateException("Please verify your email before logging in.");
        }

        // Generate and return JWT
        String token = jwtUtil.generateToken(user);

        return new AuthResponse("Login successful!", token);
    }

    @Override
    public void forgotPassword(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with that email."));

        // Ensure account is verified before sending reset code
        if (!Boolean.TRUE.equals(user.getVerified())) {
            throw new IllegalStateException("Please verify your account before resetting password.");
        }

        // Generate 6-digit OTP
        String otp = generateOTP();

        VerificationToken tokenEntity = VerificationToken.builder()
                .tokenHash(otp)
                .tokenType(TokenType.PASSWORD_RESET)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .used(false)
                .build();

        tokenRepository.save(tokenEntity);

        // Send OTP via email
        mailService.sendPasswordResetEmail(user.getEmail(), otp);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {

        // Find valid, unused token (OTP)
        VerificationToken token = tokenRepository.findByTokenHashAndTokenTypeAndUsedFalse(
                request.getOtp(), TokenType.PASSWORD_RESET
        ).orElseThrow(() -> new RuntimeException("Invalid or expired OTP"));

        // Check expiry manually if not handled by query
        if (token.isExpired()) {
            throw new RuntimeException("Token expired");
        }

        User user = token.getUser();

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token used
        token.setUsed(true);
        tokenRepository.save(token);
    }

    // Helper method to generate numeric OTP
    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    // Deprecated method required by interface
    @Override
    public String verifyEmail(String token) {
        return null;
    }
}