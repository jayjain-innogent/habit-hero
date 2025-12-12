package com.habit.hero.dto.user;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UserUpdateRequest {
    private String name;
    private String username;
    private String userBio;
    private MultipartFile profileImage;
}