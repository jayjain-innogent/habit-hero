package com.habit.hero.repository;

import com.habit.hero.entity.Reaction;
import com.habit.hero.entity.Activity;
import com.habit.hero.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    boolean existsByActivityAndReactor(Activity activity, User reactor);

    void deleteByActivityAndReactor(Activity activity, User reactor);
}
