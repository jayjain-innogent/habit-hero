package com.habit.hero.service;

public interface MailService {
    void sendVerificationEmail(String to, String verificationLink);
    void sendPasswordResetEmail(String to, String resetLink);
}