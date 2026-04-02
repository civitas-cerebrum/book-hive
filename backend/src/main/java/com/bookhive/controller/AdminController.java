package com.bookhive.controller;

import com.bookhive.service.SeedService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Admin", description = "Test helper endpoints")
public class AdminController {
    private final SeedService seedService;
    private final MongoTemplate mongoTemplate;

    public AdminController(SeedService seedService, MongoTemplate mongoTemplate) {
        this.seedService = seedService;
        this.mongoTemplate = mongoTemplate;
    }

    @PostMapping("/seed")
    @Operation(summary = "Seed database with test data")
    public ResponseEntity<?> seed() {
        seedService.seed();
        return ResponseEntity.ok(Map.of("status", "seeded"));
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset database and re-seed")
    public ResponseEntity<?> reset() {
        seedService.reset();
        return ResponseEntity.ok(Map.of("status", "reset"));
    }

    @GetMapping("/health")
    @Operation(summary = "Health check")
    public ResponseEntity<?> health() {
        try {
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            return ResponseEntity.ok(Map.of("status", "healthy", "db", "connected"));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("status", "unhealthy", "db", "disconnected"));
        }
    }
}
