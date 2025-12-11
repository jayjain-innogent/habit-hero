package com.habit.hero.service.impl;

import com.habit.hero.entity.User;
import com.habit.hero.entity.VerificationToken;
import com.habit.hero.enums.TokenType;
import com.habit.hero.repository.VerificationTokenRepository;
import com.habit.hero.service.VerificationTokenService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationTokenServiceImpl implements VerificationTokenService {

    private final VerificationTokenRepository tokenRepository;

    @Override
    public String createToken(User user, TokenType tokenType, int validityMinutes) {

        // Generate raw token
        String rawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID();

        // Hash using Apache Commons Codec
        String hashedToken = DigestUtils.sha256Hex(rawToken);

        // Save unified token entity
        VerificationToken token = VerificationToken.builder()
                .tokenHash(hashedToken)
                .tokenType(tokenType)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(validityMinutes))
                .used(false)
                .build();

        tokenRepository.save(token);

        // Return raw token for email link
        return rawToken;
    }

    @Override
    public User validateToken(String rawToken, TokenType tokenType) {

        String hashedToken = DigestUtils.sha256Hex(rawToken);

        VerificationToken token = tokenRepository
                .findByTokenHashAndTokenTypeAndUsedFalse(hashedToken, tokenType)
                .orElseThrow(() -> new RuntimeException("Invalid or used token"));

        if (token.isExpired()) {
            throw new RuntimeException("Token expired");
        }

        // Mark token as used
        token.setUsed(true);
        tokenRepository.save(token);

        return token.getUser();
    }
}