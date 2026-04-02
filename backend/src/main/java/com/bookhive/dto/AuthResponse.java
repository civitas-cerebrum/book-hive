// AuthResponse.java
package com.bookhive.dto;

public record AuthResponse(String token, String userId, String username, String email, double balance) {}
