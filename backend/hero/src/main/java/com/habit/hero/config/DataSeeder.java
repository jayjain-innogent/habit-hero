package com.habit.hero.config;

import com.habit.hero.entity.User;
import com.habit.hero.repository.UserRepository;
import com.habit.hero.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FriendService friendService;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedUsers();
            seedFriendRequests();
        }
    }

    private void seedUsers() {

        List<User> users = List.of(
                User.builder()
                        .name("Alex Brown")
                        .email("alex@example.com")
                        .username("alexa_brown")
                        .passwordHash("$2a$10$dummy")
                        .userBio("Tech enthusiast and gamer")
                        .profileImageUrl("https://img.favpng.com/3/11/24/3d-woman-avatar-stylized-cartoon-woman-avatar-with-glasses-g0FutwYY_t.jpg")
                        .createdAt(LocalDateTime.now())
                        .verified(true)
                        .build(),

                User.builder()
                        .name("Jane Smith")
                        .email("jane@example.com")
                        .username("jane_smith")
                        .passwordHash("$2a$10$dummy")
                        .userBio("Coffee enthusiast and book lover")
                        .profileImageUrl("https://img.favpng.com/13/25/8/3d-male-avatar-3d-animated-man-in-casual-outfit-22yTbsdc_t.jpg")
                        .createdAt(LocalDateTime.now())
                        .verified(true)
                        .build(),

                User.builder()
                        .name("Mike Wilson")
                        .email("mike@example.com")
                        .username("mike_wilson")
                        .passwordHash("$2a$10$dummy")
                        .userBio("Fitness trainer and nutrition coach")
                        .profileImageUrl("https://img.favpng.com/12/7/2/3d-male-avatar-cartoon-man-with-beard-and-glasses-jC7ZTh8k_t.jpg")
                        .createdAt(LocalDateTime.now())
                        .verified(true)
                        .build(),

                User.builder()
                        .name("Sarah Jones")
                        .email("sarah@example.com")
                        .username("sarah_jones")
                        .passwordHash("$2a$10$dummy")
                        .userBio("Artist and creative designer")
                        .profileImageUrl("https://thumbnail.imgbin.com/10/9/12/3d-girl-avatar-animated-girl-kg9C2FUv_t.jpg")
                        .createdAt(LocalDateTime.now())
                        .verified(true)
                        .build(),

                User.builder()
                        .name("John Doe")
                        .email("john@example.com")
                        .username("john_doe")
                        .passwordHash("$2a$10$dummy")
                        .userBio("Love hiking and photography")
                        .profileImageUrl("https://img.favpng.com/22/12/17/3d-male-avatar-animated-3d-boy-character-with-big-eyes-AvQdnr82_t.jpg")
                        .createdAt(LocalDateTime.now())
                        .verified(true)
                        .build(),

                User.builder()
                        .name("Emma Davis")
                        .email("emma@example.com")
                        .username("emma_davis")
                        .passwordHash("$2a$10$dummy")
                        .userBio("Travel blogger and photographer")
                        .profileImageUrl("https://img.favpng.com/23/6/22/kylie-jenner-3d-illustration-of-a-woman-avatar-H2w4cxnh_t.jpg")
                        .createdAt(LocalDateTime.now())
                        .verified(true)
                        .build(),

                User.builder()
                        .name("David Miller")
                        .email("david@example.com")
                        .username("david_miller")
                        .passwordHash("$2a$10$dummy")
                        .userBio("Chef and food lover")
                        .profileImageUrl("https://img.favpng.com/6/24/1/pizza-chef-happy-chef-holding-fresh-pizza-RtAPXq6U_t.jpg")
                        .createdAt(LocalDateTime.now())
                        .verified(true)
                        .build(),

                User.builder()
                        .name("Lisa Garcia")
                        .email("lisa@example.com")
                        .username("lisa_garcia")
                        .passwordHash("$2a$10$dummy")
                        .userBio("Yoga instructor and wellness coach")
                        .profileImageUrl("https://img.favpng.com/6/21/10/3d-woman-avatar-3d-cartoon-girl-with-brown-hair-M7DPxRTU_t.jpg")
                        .createdAt(LocalDateTime.now())
                        .verified(true)
                        .build(),

                User.builder()
                        .name("Tom Anderson")
                        .email("tom@example.com")
                        .username("tom_anderson")
                        .passwordHash("$2a$10$dummy")
                        .userBio("Software developer and music producer")
                        .profileImageUrl("https://img.favpng.com/18/18/13/3d-man-avatar-cartoon-man-with-beard-and-glasses-Sdhcwhih_t.jpg")
                        .createdAt(LocalDateTime.now())
                        .verified(true)
                        .build(),

                User.builder()
                        .name("Harry Styles")
                        .email("harry@example.com")
                        .username("harry")
                        .passwordHash("$2a$10$dummy")
                        .userBio("Singer and loves riding bikes")
                        .profileImageUrl("https://img.favpng.com/22/12/17/3d-male-avatar-animated-3d-boy-character-with-big-eyes-AvQdnr82_t.jpg")
                        .createdAt(LocalDateTime.now())
                        .verified(true)
                        .build()
        );

        userRepository.saveAll(users);
        System.out.println("✅ Seeded " + users.size() + " users");
    }

    private void seedFriendRequests() {
        try {
            for (long i = 2; i <= 10; i++) {
                friendService.sendFriendRequest(i, 1L);
            }
            System.out.println("✅ Seeded 9 friend requests to user 1");
        } catch (Exception e) {
            System.out.println("⚠️ Friend requests already exist or error: " + e.getMessage());
        }
    }
}
