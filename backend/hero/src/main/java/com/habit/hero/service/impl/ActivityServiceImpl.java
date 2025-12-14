package com.habit.hero.service.impl;

import com.habit.hero.dto.activity.*;
import com.habit.hero.entity.*;
import com.habit.hero.enums.Visibility;
import com.habit.hero.enums.ActivityType;
import com.habit.hero.enums.NotificationType;
import com.habit.hero.repository.*;
import com.habit.hero.service.ActivityService;
import com.habit.hero.service.NotificationService;

import com.habit.hero.util.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final ReactionRepository reactionRepository;
    private final CommentRepository commentRepository;
    private final FriendListRepository friendListRepository;
    private final HabitRepository habitRepository;
    private final CurrentUserUtil currentUserUtil;
    private final NotificationService notificationService;

    // Create a new activity post for a user
    @Override
    @Transactional
    public Activity createActivity(ActivityCreateRequest request) {
        // SECURITY: Validate userId from token matches request userId
        Long tokenUserId = currentUserUtil.getCurrentUserId();
        if (!tokenUserId.equals(request.getUserId())) {
            throw new RuntimeException("Unauthorized: User ID mismatch");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Habit habit = null;
        if (request.getHabitId() != null) {
            habit = habitRepository.findById(request.getHabitId())
                    .orElseThrow(() -> new RuntimeException("Habit not found"));
        }

        Activity activity = Activity.builder()
                .user(user)
                .habit(habit)
                .activityType(request.getActivityType())
                .title(request.getTitle())
                .description(request.getDescription())
                .caption(request.getCaption())
                .visibility(
                        request.getVisibility() != null
                                ? request.getVisibility()
                                : Visibility.PUBLIC
                )
                .likesCount(0)
                .commentsCount(0)
                .build();

        return activityRepository.save(activity);
    }

    // get user feed isme we have two options either we will only show friends or we will show all (friends + public)
    @Transactional(readOnly = true)
    @Override
    public List<ActivityResponse> getFeed(Long userId, String filter, int page, int size) {

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<User> friends = friendListRepository.findUserFriends(currentUser);
        Pageable pageable = PageRequest.of(page, size);

        List<Activity> activities;

        if ("FRIENDS".equalsIgnoreCase(filter)) {
            activities = activityRepository.fetchFriendsOnlyFeed(friends, pageable);

        } else {
            activities = activityRepository.fetchFeed(currentUser, friends, pageable);
        }

        return activities.stream().map(this::mapToResponse).toList();
    }

    private ActivityResponse mapToResponse(Activity activity) {
        Long currentUserId = currentUserUtil.getCurrentUserId();
        boolean isLikedByCurrentUser = false;

        if (currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId).orElse(null);
            if (currentUser != null) {
                isLikedByCurrentUser = reactionRepository.existsByActivityAndReactor(activity, currentUser);
            }
        }

        return ActivityResponse.builder()
                .id(activity.getActivityId())
                .title(activity.getTitle())
                .activityType(activity.getActivityType().name())
                .visibility(activity.getVisibility())
                .userId(activity.getUser().getUserId())
                .username(activity.getUser().getUsername())
                .description(activity.getDescription())
                .caption(activity.getCaption())
                .profileImageUrl(activity.getUser().getProfileImageUrl())
                .habitId(activity.getHabit() != null ? activity.getHabit().getId() : null)
                .likesCount(activity.getLikesCount())
                .commentsCount(activity.getCommentsCount())
                .likedByCurrentUser(isLikedByCurrentUser)  // Add this line
                .createdAt(activity.getCreatedAt())
                .build();
    }


    @Transactional
    @Override
    public LikeResponse toggleLike(Long userId, Long activityId) {
        // SECURITY: Validate userId from token matches request userId
        Long tokenUserId = currentUserUtil.getCurrentUserId();
        if (!tokenUserId.equals(userId)) {
            throw new RuntimeException("Unauthorized: User ID mismatch");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        boolean alreadyLiked = reactionRepository.existsByActivityAndReactor(activity, user);

        if (alreadyLiked) {
            reactionRepository.deleteByActivityAndReactor(activity, user);
            activity.setLikesCount(activity.getLikesCount() - 1);

            // Delete like notification when unliked
            try {
                notificationService.deleteSocialNotification(
                        activity.getUser().getUserId(),
                        userId,
                        NotificationType.LIKE,
                        activityId
                );
            } catch (Exception e) {
                // Ignore if notification deletion fails
            }
        } else {
            Reaction reaction = Reaction.builder()
                    .activity(activity)
                    .reactor(user)
                    .build();
            reactionRepository.save(reaction);
            activity.setLikesCount(activity.getLikesCount() + 1);

            // Send like notification (only if not liking own post)
            if (!activity.getUser().getUserId().equals(userId)) {
                notificationService.createNotification(
                        activity.getUser().getUserId(),
                        userId,
                        NotificationType.LIKE,
                        "liked your post",
                        activityId
                );
            }
        }

        activityRepository.save(activity);

        return LikeResponse.builder()
                .activityId(activityId)
                .isLiked(!alreadyLiked)
                .likesCount(activity.getLikesCount())
                .build();
    }


    @Transactional
    @Override
    public CommentResponse addComment(CommentCreateRequest request) {

        // SECURITY: Validate userId from token matches request userId
        Long tokenUserId = currentUserUtil.getCurrentUserId();
        if (!tokenUserId.equals(request.getAuthorUserId())) {
            throw new RuntimeException("Unauthorized: User ID mismatch");
        }

        Activity activity = activityRepository.findById(request.getActivityId())
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        User author = userRepository.findById(request.getAuthorUserId())
                .orElseThrow(() -> new RuntimeException("Author user not found"));

        Comment comment = Comment.builder()
                .activity(activity)
                .author(author)
                .commentText(request.getText())
                .build();

        activity.setCommentsCount(activity.getCommentsCount() + 1);
        activityRepository.save(activity);

        comment = commentRepository.save(comment);

        // Send comment notification (only if not commenting on own post)
        if (!activity.getUser().getUserId().equals(request.getAuthorUserId())) {
            notificationService.createNotification(
                    activity.getUser().getUserId(),
                    request.getAuthorUserId(),
                    NotificationType.COMMENT,
                    "commented on your post",
                    request.getActivityId()
            );
        }

        return mapToResponse(comment);
    }




    @Transactional(readOnly = true)
    @Override
    public List<CommentResponse> getCommentsByActivity(Long activityId) {

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        List<Comment> comments = commentRepository.findByActivityOrderByCreatedAtDesc(activity);

        return comments.stream()
                .map(this::mapToResponse)
                .toList();
    }


    private CommentResponse mapToResponse(Comment c) {
        return CommentResponse.builder()
                .commentId(c.getCommentId())
                .text(c.getCommentText())
                .createdAt(c.getCreatedAt())
                .author(UserSummary.builder()
                        .userId(c.getAuthor().getUserId())
                        .username(c.getAuthor().getUsername())
                        .profileImage(c.getAuthor().getProfileImageUrl()) // Use profileImage, not profileImageUrl
                        .build())
                .build();
    }

    @Override
    public List<ActivityResponse> getUserActivities(Long userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        List<Activity> activities = activityRepository.findByUserOrderByCreatedAtDesc(user, pageable);

        return activities.stream().map(this::mapToResponse).toList();
    }

    @Override
    public void deleteActivity(Long activityId, Long userId) {
        // SECURITY: Validate userId from token matches request userId
        Long tokenUserId = currentUserUtil.getCurrentUserId();
        if (!tokenUserId.equals(userId)) {
            throw new RuntimeException("Unauthorized: User ID mismatch");
        }

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        if (!activity.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this activity");
        }

        activityRepository.delete(activity);
    }

}