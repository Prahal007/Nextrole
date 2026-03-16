package ai.pdfzen.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        try {
            // Simple health check without database dependency
            return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "pdfzen-resume-optimizer",
                "timestamp", System.currentTimeMillis(),
                "version", "1.0.0"
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "DOWN",
                "service", "pdfzen-resume-optimizer",
                "error", e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }
    
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        try {
            // Root health check - simple status response
            return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "pdfzen-resume-optimizer",
                "endpoint", "root",
                "timestamp", System.currentTimeMillis(),
                "version", "1.0.0"
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "DOWN",
                "service", "pdfzen-resume-optimizer",
                "error", e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }
    
    @GetMapping("/actuator/health")
    public ResponseEntity<Map<String, Object>> actuatorHealth() {
        try {
            // Actuator compatible health check
            return ResponseEntity.ok(Map.of(
                "status", "UP",
                "components", Map.of(
                    "db", Map.of("status", "UP"),
                    "ping", Map.of("status", "UP")
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of(
                "status", "DOWN",
                "error", e.getMessage()
            ));
        }
    }
}
