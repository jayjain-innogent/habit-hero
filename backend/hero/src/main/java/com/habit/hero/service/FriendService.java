package com.habit.hero.service;

import com.habit.hero.dto.friend.FriendDto;
import com.habit.hero.dto.friend.FriendRequestResponseDto;
import com.habit.hero.dto.friend.RespondToRequestDto;
import com.habit.hero.dto.friend.SendFriendRequestDto;

import java.util.List;

public interface FriendService {
    void sendFriendRequest(Long senderId, SendFriendRequestDto dto);

    void acceptFriendRequest(RespondToRequestDto dto);

    void rejectFriendRequest(RespondToRequestDto dto);

    void cancelFriendRequest(RespondToRequestDto dto);

    void removeFriend(Long userId, Long friendId);

    List<FriendRequestResponseDto> getPendingRequests(Long userId);

    List<FriendDto> getFriendList(Long userId);
}
