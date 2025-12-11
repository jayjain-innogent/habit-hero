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
    public void sendVerificationEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Verify your Habit Hero account");
        message.setText(
                "Welcome to Habit Hero!\n\n" +
                        "Your verification OTP is: " + otp + "\n\n" +
                        "This code is valid for 15 minutes.\n" +
                        "If you didn’t request this, you can ignore this email."
        );
        mailSender.send(message);
    }

    @Override
    public void sendPasswordResetEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Reset your Habit Hero password");
        message.setText(
                "You requested a password reset.\n\n" +
                        "Your OTP for resetting the password is: " + otp + "\n\n" +
                        "This code is valid for 30 minutes.\n" +
                        "If you didn’t request this, you can ignore this email."
        );
        mailSender.send(message);
    }
}