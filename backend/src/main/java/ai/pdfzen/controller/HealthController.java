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
}
