package com.roadsafety.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "up", "service", "spring-boot-backend"));
    }
    
    // Stub endpoints for later phases
    @GetMapping("/events")
    public ResponseEntity<Map<String, String>> getEvents() {
        return ResponseEntity.ok(Map.of("message", "Simulated events list"));
    }

    @GetMapping("/violations")
    public ResponseEntity<Map<String, String>> getViolations() {
        return ResponseEntity.ok(Map.of("message", "Simulated violations list"));
    }
}
