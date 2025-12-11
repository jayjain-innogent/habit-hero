package com.habit.hero.repository;

import com.habit.hero.entity.Comment;
import com.habit.hero.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByActivityAndIsDeletedFalseOrderByCreatedAtAsc(Activity activity);

    int countByActivityAndIsDeletedFalse(Activity activity);

    List<Comment> findTop2ByActivityAndIsDeletedFalseOrderByCreatedAtDesc(Activity activity);
}
