package com.habit.hero.dto.friend;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class FriendRequestResponseDto {
    private Long requestId;
    private Long senderId;
    private String senderUsername;
    private String senderProfileImage;
    private String senderBio;
    private String status;
}
