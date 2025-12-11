package com.habit.hero.service.impl;

import com.habit.hero.dto.activity.*;
import com.habit.hero.entity.*;
import com.habit.hero.enums.Visibility;
import com.habit.hero.enums.ActivityType;
import com.habit.hero.enums.NotificationType;
import com.habit.hero.repository.*;
import com.habit.hero.service.ActivityService;
import com.habit.hero.service.NotificationService;

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
    private final NotificationService notificationService;

    // Create a new activity post for a user
    @Override
    @Transactional
    public Activity createActivity(ActivityCreateRequest request) {

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
        return ActivityResponse.builder()
                .id(activity.getActivityId())
                .title(activity.getTitle())
                .activityType(activity.getActivityType().name())
                .visibility(activity.getVisibility())
                .userId(activity.getUser().getUserId())
                .username(activity.getUser().getUsername())
                .profileImageUrl(activity.getUser().getProfileImageUrl()) // Add this line
                .habitId(activity.getHabit() != null ? activity.getHabit().getId() : null)
                .likesCount(activity.getLikesCount())
                .commentsCount(activity.getCommentsCount())
                .createdAt(activity.getCreatedAt())
                .build();
}

    @Transactional
    @Override
    public LikeResponse toggleLike(Long userId, Long activityId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        boolean alreadyLiked = reactionRepository.existsByActivityAndReactor(activity, user);

        if (alreadyLiked) {
            reactionRepository.deleteByActivityAndReactor(activity, user);
            activity.setLikesCount(activity.getLikesCount() - 1);
        } else {
            Reaction reaction = Reaction.builder()
                    .activity(activity)
                    .reactor(user)
                    .build();
            reactionRepository.save(reaction);
            activity.setLikesCount(activity.getLikesCount() + 1);
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

        return mapToResponse(comment);
    }

    @Transactional(readOnly = true)
    @Override
    public List<CommentResponse> getCommentsByActivity(Long activityId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        List<Comment> comments = commentRepository.findAll()
                .stream()
                .filter(c -> c.getActivity().equals(activity))
                .toList();

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
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        if (!activity.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this activity");
        }

        activityRepository.delete(activity);
    }

}
