package com.habit.hero.dto.friend;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuggestedUserDto {
    private Long userId;
    private String username;
    private String userBio;
    private String profileImageUrl;
    private Integer streak;
    private Integer habits;
    private Integer mutualFriends;
}
