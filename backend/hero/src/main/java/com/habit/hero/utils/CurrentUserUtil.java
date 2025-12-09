package com.habit.hero.util;

import org.springframework.stereotype.Component;

@Component
public class CurrentUserUtil {
    public Long getCurrentUserId() {
        return 1L;

        // FUTURE CODE (With Spring Security):
        // Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        // if (principal instanceof UserDetailsImpl) {
        //     return ((UserDetailsImpl) principal).getId();
        // }
        // return null;
    }
}