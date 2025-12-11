package com.habit.hero.filter;

import com.habit.hero.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Header se Authorization token nikalo
        final String authHeader = request.getHeader("Authorization");

        // 2. Check karo token exist karta hai ya nahi
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. "Bearer " hata ke actual JWT string nikalo
        String jwt = authHeader.substring(7);

        // 4. Token validate karo
        if (jwtUtil.validateJwtToken(jwt)) {

            // Token se UserID nikalo
            Long userId = jwtUtil.getUserIdFromJwt(jwt);

            // Spring Security ko batane ke liye ek dummy User object banao
            // (Authorities empty list hai kyunki abhi roles use nahi kar rahe)
            UserDetails userDetails = new User(userId.toString(), "", new ArrayList<>());

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
            );

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // 5. Security Context me set kar do (User is now logged in for this request)
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        // Request aage badhao
        filterChain.doFilter(request, response);
    }
}