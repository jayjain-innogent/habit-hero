package com.habit.hero.service.impl;

import com.habit.hero.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationEmail(String to, String verificationLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Verify your Habit Hero account");
        message.setText(
                "Welcome to Habit Hero!\n\n" +
                        "Click the link below to verify your account and continue:\n" +
                        verificationLink + "\n\n" +
                        "If you didn’t request this, you can ignore this email."
        );
        mailSender.send(message);
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Reset your Habit Hero password");
        message.setText(
                "You requested a password reset.\n\n" +
                        "Use the link below to set a new password:\n" +
                        resetLink + "\n\n" +
                        "If you didn’t request this, you can ignore this email."
        );
        mailSender.send(message);
    }
}
