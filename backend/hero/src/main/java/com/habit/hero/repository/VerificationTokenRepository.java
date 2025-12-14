package com.habit.hero.repository;

import com.habit.hero.entity.VerificationToken;
import com.habit.hero.enums.TokenType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    // SAFEST LOOKUP: tokenHash must match AND must not be used already
    Optional<VerificationToken> findByTokenHashAndTokenTypeAndUsedFalse(
            String tokenHash,
            TokenType tokenType
    );

//    // Optional: cleanup support
//    void deleteByExpiresAtBefore(LocalDateTime time);
}
