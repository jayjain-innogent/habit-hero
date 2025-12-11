package com.habit.hero.controller;

import com.habit.hero.dto.authDto.AuthResponse;
import com.habit.hero.dto.authDto.LoginRequest;
import com.habit.hero.dto.authDto.RegisterRequest;
import com.habit.hero.dto.authDto.ResetPasswordRequest;
import com.habit.hero.service.AuthService;        // <- IMPORTANT: import AuthService
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/verify")
    public void verifyEmail(@RequestParam String token, HttpServletResponse response) throws IOException {

        String jwt = authService.verifyEmail(token);

        // Redirect user to frontend auto-login
        response.sendRedirect("http://localhost:5173/habits?token=" + jwt);
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(e.getMessage()); // unverified
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // bad credentials
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            authService.forgotPassword(email);
            return ResponseEntity.ok("Password reset link sent to email.");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok("Password reset successful!");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }



}

