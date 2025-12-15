package com.habit.hero.service;

import com.habit.hero.entity.User;
import com.habit.hero.entity.VerificationToken;
import com.habit.hero.enums.TokenType;

import java.util.List;
import java.util.Optional;

public interface VerificationTokenService {

    // Create raw token & save hashed version
    String createToken(User user, TokenType tokenType, int validityMinutes);

    // Validate token and return related user
    User validateToken(String rawToken, TokenType tokenType);

    // Find all valid/unused tokens for a specific user and type
    List<VerificationToken> findAllByUserAndTokenTypeAndUsedFalse(User user, TokenType tokenType);

    // Optional: To find the latest token for rate limiting (checking creation time)
    Optional<VerificationToken> findFirstByUserAndTokenTypeOrderByCreatedAtDesc(User user, TokenType tokenType);
}
