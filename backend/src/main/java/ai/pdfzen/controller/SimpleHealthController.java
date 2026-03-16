package ai.pdfzen.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("")
public class SimpleHealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "pdfzen-resume-optimizer",
            "timestamp", System.currentTimeMillis()
        ));
    }
    
    @GetMapping("/")
    public ResponseEntity<Map<String, String>> root() {
        return ResponseEntity.ok(Map.of(
            "message", "PDFZen Resume Optimizer API",
            "status", "running",
            "health", "/health"
        ));
    }
}
