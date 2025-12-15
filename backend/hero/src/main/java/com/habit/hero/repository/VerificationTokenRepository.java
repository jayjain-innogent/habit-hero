package com.habit.hero.repository;

import com.habit.hero.entity.User;
import com.habit.hero.entity.VerificationToken;
import com.habit.hero.enums.TokenType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    // SAFEST LOOKUP: tokenHash must match AND must not be used already
    Optional<VerificationToken> findByTokenHashAndTokenTypeAndUsedFalse(
            String tokenHash,
            TokenType tokenType
    );

    // Find all valid/unused tokens for a specific user and type
    List<VerificationToken> findAllByUserAndTokenTypeAndUsedFalse(User user, TokenType tokenType);

    // Optional: To find the latest token for rate limiting (checking creation time)
    Optional<VerificationToken> findFirstByUserAndTokenTypeOrderByCreatedAtDesc(User user, TokenType tokenType);

}
