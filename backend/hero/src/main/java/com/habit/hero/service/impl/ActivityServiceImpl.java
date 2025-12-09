package com.habit.hero.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.habit.hero.dto.activity.*;
import com.habit.hero.entity.*;
import com.habit.hero.enums.ActivityType;
import com.habit.hero.repository.*;
import com.habit.hero.service.ActivityService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final ReactionRepository reactionRepository;
    private final CommentRepository commentRepository;
    private final FriendListRepository friendListRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public FeedItemResponse createActivity(ActivityCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Activity activity = Activity.builder()
                .user(user)
                .habit(null)
                .activityType(request.getActivityType())
                .title(request.getTitle())
                .content(request.getContentJson())
                .visibility(request.getVisibility())
                .build();

        Activity saved = activityRepository.save(activity);

        return mapToFeedResponse(saved, user.getUserId());
    }

    @Override
    public List<FeedItemResponse> getFeedForUser(Long userId, int page, int size) {

        // 1) load current user (throws if not found)
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2) fetch friend relationships (returns List<FriendList>)
        List<FriendList> relations = friendListRepository.findFriendsOfUser(currentUser);

        // 3) map each FriendList row -> the "other" user (the actual friend)
        List<User> friends = relations.stream()
                .map(fl -> {
                    // if fl.user equals currentUser -> friend is fl.friend
                    // otherwise friend is fl.user
                    return fl.getUser().equals(currentUser) ? fl.getFriend() : fl.getUser();
                })
                .collect(Collectors.toList());

        // 4) fetch feed items using activityRepository.fetchFeed(currentUser, friends, pageable)
        List<Activity> activities =
                activityRepository.fetchFeed(currentUser, friends, PageRequest.of(page, size));

        // 5) map activities -> FeedItemResponse DTOs
        return activities.stream()
                .map(a -> mapToFeedResponse(a, userId))
                .collect(Collectors.toList());
    }


    @Override
    public void likeActivity(Long userId, Long activityId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        boolean alreadyLiked = reactionRepository.existsByActivityAndReactor(activity, user);

        if (alreadyLiked) return;

        Reaction reaction = Reaction.builder()
                .activity(activity)
                .reactor(user)
                .build();

        reactionRepository.save(reaction);

        activity.setLikesCount(activity.getLikesCount() + 1);
        activityRepository.save(activity);
    }

    @Override
    @Transactional
    public void unlikeActivity(Long userId, Long activityId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        if (!reactionRepository.existsByActivityAndReactor(activity, user)) return;

        reactionRepository.deleteByActivityAndReactor(activity, user);

        activity.setLikesCount(activity.getLikesCount() - 1);
        activityRepository.save(activity);
    }


    @Override
    public CommentResponse addComment(CommentCreateRequest request) {

        User user = userRepository.findById(request.getAuthorUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Activity activity = activityRepository.findById(request.getActivityId())
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        Comment comment = Comment.builder()
                .activity(activity)
                .author(user)
                .commentText(request.getText())
                .build();

        Comment saved = commentRepository.save(comment);

        activity.setCommentsCount(activity.getCommentsCount() + 1);
        activityRepository.save(activity);

        return CommentResponse.builder()
                .commentId(saved.getCommentId())
                .text(saved.getCommentText())
                .createdAt(saved.getCreatedAt())
                .author(
                        UserSummary.builder()
                                .userId(user.getUserId())
                                .name(user.getName())
                                .username(user.getUsername())
                                .profileImage(user.getProfileImageUrl())
                                .build()
                )
                .build();
    }

    @Override
    public List<CommentResponse> getComments(Long activityId) {

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        return commentRepository.findByActivityAndIsDeletedFalseOrderByCreatedAtAsc(activity)
                .stream()
                .map(c -> CommentResponse.builder()
                        .commentId(c.getCommentId())
                        .text(c.getCommentText())
                        .createdAt(c.getCreatedAt())
                        .author(UserSummary.builder()
                                .userId(c.getAuthor().getUserId())
                                .name(c.getAuthor().getName())
                                .username(c.getAuthor().getUsername())
                                .profileImage(c.getAuthor().getProfileImageUrl())
                                .build())
                        .build())
                .collect(Collectors.toList());
    }

    private FeedItemResponse mapToFeedResponse(Activity a, Long currentUserId) {

        boolean likedByUser =
                reactionRepository.existsByActivityAndReactor(a, userRepository.getReferenceById(currentUserId));

        Object contentObject = null;

        try {
            contentObject = parseContent(a);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Invalid activity content");
        }

        return FeedItemResponse.builder()
                .activityId(a.getActivityId())
                .user(UserSummary.builder()
                        .userId(a.getUser().getUserId())
                        .name(a.getUser().getName())
                        .username(a.getUser().getUsername())
                        .profileImage(a.getUser().getProfileImageUrl())
                        .build())
                .activityType(a.getActivityType())
                .title(a.getTitle())
                .createdAt(a.getCreatedAt())
                .visibility(a.getVisibility())
                .likesCount(a.getLikesCount())
                .commentsCount(a.getCommentsCount())
                .likedByCurrentUser(likedByUser)
                .content(contentObject)
                .recentComments(
                        commentRepository.findTop2ByActivityAndIsDeletedFalseOrderByCreatedAtDesc(a)
                                .stream()
                                .map(c -> CommentResponse.builder()
                                        .commentId(c.getCommentId())
                                        .text(c.getCommentText())
                                        .createdAt(c.getCreatedAt())
                                        .author(UserSummary.builder()
                                                .userId(c.getAuthor().getUserId())
                                                .name(c.getAuthor().getName())
                                                .username(c.getAuthor().getUsername())
                                                .profileImage(c.getAuthor().getProfileImageUrl())
                                                .build())
                                        .build())
                                .collect(Collectors.toList())
                )
                .build();
    }

    private Object parseContent(Activity a) throws JsonProcessingException {
        if (a.getContent() == null) return null;

        try {
            return switch (a.getActivityType()) {
                case COMPLETION -> objectMapper.readValue(a.getContent(), CompletionContent.class);
                case STREAK -> objectMapper.readValue(a.getContent(), StreakContent.class);
                case MILESTONE -> objectMapper.readValue(a.getContent(), MilestoneContent.class);
                case SUMMARY -> objectMapper.readValue(a.getContent(), WeeklySummaryContent.class);
                case MISSED -> objectMapper.readValue(a.getContent(), MissedDaysContent.class);
            };
        } catch (Exception e) {
            return a.getContent();
        }
    }
}
