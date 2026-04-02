// AuthServiceTest.java
package com.bookhive.service;

import com.bookhive.dto.LoginRequest;
import com.bookhive.dto.SignupRequest;
import com.bookhive.model.User;
import com.bookhive.repository.UserRepository;
import com.bookhive.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AuthServiceTest {
    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void signup_createsUser() {
        var request = new SignupRequest("testuser", "test@example.com", "password123");
        var response = authService.signup(request);
        assertNotNull(response.token());
        assertEquals("testuser", response.username());
        assertEquals("test@example.com", response.email());
    }

    @Test
    void signup_duplicateEmail_throws() {
        var request = new SignupRequest("user1", "test@example.com", "password123");
        authService.signup(request);
        assertThrows(IllegalArgumentException.class, () ->
            authService.signup(new SignupRequest("user2", "test@example.com", "password456")));
    }

    @Test
    void login_validCredentials_returnsToken() {
        authService.signup(new SignupRequest("testuser", "test@example.com", "password123"));
        var response = authService.login(new LoginRequest("test@example.com", "password123"));
        assertNotNull(response.token());
        assertEquals("testuser", response.username());
    }

    @Test
    void login_wrongPassword_throws() {
        authService.signup(new SignupRequest("testuser", "test@example.com", "password123"));
        assertThrows(IllegalArgumentException.class, () ->
            authService.login(new LoginRequest("test@example.com", "wrongpassword")));
    }
}
