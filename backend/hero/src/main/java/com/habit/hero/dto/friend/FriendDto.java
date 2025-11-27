package com.habit.hero.dto.friend;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class FriendDto {
    private Long friendId;
    private String friendUsername;
}
