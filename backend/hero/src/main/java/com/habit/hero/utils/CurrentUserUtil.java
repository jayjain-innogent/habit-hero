package com.habit.hero.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserUtil {

    public Long getCurrentUserId() {
        // get the authentication object from spring security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // check if authentication exists and is not anonymous
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("User is not authenticated");
        }

        // extract the user id which we set as the subject (name) in the jwt filter
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid user id in security context");
        }
    }
}