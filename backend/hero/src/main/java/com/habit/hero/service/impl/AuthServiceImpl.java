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
import com.habit.hero.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final JwtUtil jwtUtil;

    // Inject expiry time from application.properties (Default: 10 mins)
    @Value("${habit.hero.otp.expiration-minutes:10}")
    private int otpExpirationMinutes;

    @Override
    @Transactional
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

        // Generate and save OTP with dynamic expiry
        String otp = generateOTP();
        saveVerificationToken(user, otp, TokenType.VERIFICATION);

        // Send OTP via email
        mailService.sendVerificationEmail(user.getEmail(), otp);

        return new AuthResponse("Registration successful! OTP sent to your email.", null);
    }

    @Override
    @Transactional
    public void resendVerificationOtp(String email) {

        // Check if user exists
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email."));

        // Check if user is already verified
        if (Boolean.TRUE.equals(user.getVerified())) {
            throw new RuntimeException("User is already verified. Please login.");
        }

        // Invalidate ALL previous unused tokens for this user
        // This ensures old OTPs stop working immediately
        List<VerificationToken> activeTokens = tokenRepository.findAllByUserAndTokenTypeAndUsedFalse(
                user, TokenType.VERIFICATION);

        if (!activeTokens.isEmpty()) {
            activeTokens.forEach(token -> {
                token.setUsed(true); // Mark as used/invalid
            });
            tokenRepository.saveAll(activeTokens);
        }

        // Generate a new OTP
        String otp = generateOTP();

        // Save new token with dynamic expiry time
        saveVerificationToken(user, otp, TokenType.VERIFICATION);

        // Send the new OTP via email
        mailService.sendVerificationEmail(user.getEmail(), otp);
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with that email."));

        if (!Boolean.TRUE.equals(user.getVerified())) {
            throw new IllegalStateException("Please verify your account before resetting password.");
        }

        // Invalidate old password reset tokens
        List<VerificationToken> oldTokens = tokenRepository.findAllByUserAndTokenTypeAndUsedFalse(
                user, TokenType.PASSWORD_RESET);

        if (!oldTokens.isEmpty()) {
            oldTokens.forEach(t -> t.setUsed(true));
            tokenRepository.saveAll(oldTokens);
        }

        // Generate and save OTP with dynamic expiry
        String otp = generateOTP();
        saveVerificationToken(user, otp, TokenType.PASSWORD_RESET);

        // Send OTP via email
        mailService.sendPasswordResetEmail(user.getEmail(), otp);
    }

    // Helper method to save token and avoid code duplication
    private void saveVerificationToken(User user, String otp, TokenType type) {
        VerificationToken tokenEntity = VerificationToken.builder()
                .tokenHash(otp)
                .tokenType(type)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .used(false)
                .build();

        tokenRepository.save(tokenEntity);
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
    @Transactional
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
                        request.getOtp(), TokenType.VERIFICATION)
                .orElseThrow(() -> new RuntimeException("Invalid or used OTP"));

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
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        // Find valid, unused token (OTP)
        VerificationToken token = tokenRepository.findByTokenHashAndTokenTypeAndUsedFalse(
                        request.getOtp(), TokenType.PASSWORD_RESET)
                .orElseThrow(() -> new RuntimeException("Invalid or expired OTP"));

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
        SecureRandom secureRandom = new SecureRandom();
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }

    @Override
    public String verifyEmail(String token) {
        return null;
    }
}