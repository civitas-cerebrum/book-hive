package com.bookhive.controller;

import com.bookhive.dto.AuthResponse;
import com.bookhive.dto.ErrorResponse;
import com.bookhive.dto.LoginRequest;
import com.bookhive.dto.SignupRequest;
import com.bookhive.model.User;
import com.bookhive.repository.UserRepository;
import com.bookhive.security.UserPrincipal;
import com.bookhive.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Authentication endpoints")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/signup")
    @Operation(summary = "Register a new user")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request,
                                    HttpServletResponse response) {
        try {
            AuthResponse auth = authService.signup(request);
            addTokenCookie(response, auth.token());
            return ResponseEntity.ok(auth);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("signup_failed", e.getMessage()));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletResponse response) {
        try {
            AuthResponse auth = authService.login(request);
            addTokenCookie(response, auth.token());
            return ResponseEntity.ok(auth);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(new ErrorResponse("login_failed", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout (clears session cookie)")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("bookhive_token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserPrincipal principal) {
        return userRepository.findById(principal.getId())
            .map(user -> ResponseEntity.ok(new AuthResponse(null, user.getId(),
                user.getUsername(), user.getEmail(), user.getBalance())))
            .orElse(ResponseEntity.notFound().build());
    }

    private void addTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("bookhive_token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(86400);
        response.addCookie(cookie);
    }
}
