package com.roomreservation.backend.config;

import com.roomreservation.backend.entity.Role;
import com.roomreservation.backend.entity.User;
import com.roomreservation.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Create Admin
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("User")
                    .email("admin@test.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);

            // Create User
            User user = User.builder()
                    .firstName("John")
                    .lastName("Doe")
                    .email("user@test.com")
                    .password(passwordEncoder.encode("user123"))
                    .role(Role.USER)
                    .build();
            userRepository.save(user);

            System.out.println("Sample users created: admin@test.com / admin123, user@test.com / user123");
        }
    }
}
