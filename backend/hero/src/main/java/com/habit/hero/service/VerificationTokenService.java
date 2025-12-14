package com.habit.hero.service;

import com.habit.hero.entity.User;
import com.habit.hero.enums.TokenType;

public interface VerificationTokenService {

    // Create raw token & save hashed version
    String createToken(User user, TokenType tokenType, int validityMinutes);

    // Validate token and return related user
    User validateToken(String rawToken, TokenType tokenType);
}