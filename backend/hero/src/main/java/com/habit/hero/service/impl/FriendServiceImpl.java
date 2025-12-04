package com.habit.hero.service.impl;

import com.habit.hero.dto.friend.FriendDto;
import com.habit.hero.dto.friend.FriendRequestResponseDto;
import com.habit.hero.dto.friend.RespondToRequestDto;
import com.habit.hero.entity.FriendList;
import com.habit.hero.entity.FriendRequest;
import com.habit.hero.entity.User;
import com.habit.hero.enums.FriendRequestStatus;
import com.habit.hero.repository.FriendListRepository;
import com.habit.hero.repository.FriendRequestRepository;
import com.habit.hero.repository.UserRepository;
import com.habit.hero.service.FriendService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendServiceImpl implements FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final FriendListRepository friendListRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void sendFriendRequest(Long senderId, Long receiverId) {

        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("You cannot send a request to yourself");
        }

        User sender = getUser(senderId);
        User receiver = getUser(receiverId);

        if (friendListRepository.existsFriendship(sender, receiver)) {
            return;
        }

        friendRequestRepository.deleteExistingBetween(sender, receiver);

        FriendRequest request = FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(FriendRequestStatus.PENDING)
                .build();

        friendRequestRepository.save(request);
    }



    @Override
    @Transactional
    public void acceptFriendRequest(RespondToRequestDto dto) {

        FriendRequest request = getFriendRequest(dto.getRequestId());

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new IllegalStateException("Request already handled.");
        }

        User sender = request.getSender();
        User receiver = request.getReceiver();

        request.setStatus(FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);

            addFriendship(sender, receiver);
    }


    @Override
    public void rejectFriendRequest(RespondToRequestDto dto) {
        FriendRequest request = getFriendRequest(dto.getRequestId());

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new IllegalStateException("Request already handled.");
        }

        request.setStatus(FriendRequestStatus.REJECTED);
        friendRequestRepository.save(request);
    }

    @Override
    public void cancelFriendRequest(RespondToRequestDto dto) {
        FriendRequest request = getFriendRequest(dto.getRequestId());

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new IllegalStateException("Request already handled.");
        }

        request.setStatus(FriendRequestStatus.CANCELLED);
        friendRequestRepository.save(request);
    }

    @Override
    @Transactional
    public void removeFriend(Long userId, Long friendId) {
        friendListRepository.removeFriend(userId, friendId);
    }


    @Override
    public List<FriendRequestResponseDto> getPendingRequests(Long userId) {

        User receiver = getUser(userId);

        return friendRequestRepository.findPendingRequests(receiver, FriendRequestStatus.PENDING)
                .stream()
                .map(fr -> FriendRequestResponseDto.builder()
                        .requestId(fr.getRequestId())
                        .senderId(fr.getSender().getUserId())
                        .senderUsername(fr.getSender().getUsername())
                        .senderProfileImage(fr.getSender().getProfileImageUrl())
                        .senderBio(fr.getSender().getUserBio())  // Add bio mapping
                        .status(fr.getStatus().name())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<FriendRequestResponseDto> getSentRequests(Long userId) {
        User sender = getUser(userId);

        return friendRequestRepository.findBySenderAndStatus(sender, FriendRequestStatus.PENDING)
                .stream()
                .map(fr -> FriendRequestResponseDto.builder()
                        .requestId(fr.getRequestId())
                        .senderId(fr.getReceiver().getUserId())  // For sent requests, we care about the receiver
                        .senderUsername(fr.getReceiver().getUsername())  // Receiver's username
                        .status(fr.getStatus().name())
                        .build())
                .collect(Collectors.toList());
    }


    @Override
    public List<FriendDto> getFriendList(Long userId) {

        User user = getUser(userId);

        return friendListRepository.findFriendsOfUser(user)
                .stream()
                .map(fl -> {
                    User friend = fl.getUser().equals(user) ? fl.getFriend() : fl.getUser();

                    return FriendDto.builder()
                            .friendId(friend.getUserId())
                            .friendUsername(friend.getUsername())
                            .friendProfileImage(friend.getProfileImageUrl())
                            .friendBio(friend.getUserBio())  // Add bio mapping
                            .build();
                })
                .collect(Collectors.toList());
    }


    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private FriendRequest getFriendRequest(Long id) {
        return friendRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Friend request not found"));
    }

    private void addFriendship(User user, User friend) {
        FriendList fl = FriendList.builder()
                .user(user)
                .friend(friend)
                .build();
        friendListRepository.save(fl);
    }
}