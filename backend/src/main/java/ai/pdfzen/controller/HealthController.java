package ai.pdfzen.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.actuate.health.Status;
import javax.sql.DataSource;
import java.util.Map;

@RestController
@RequestMapping("")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        try {
            // Test database connection
            dataSource.getConnection().close();
            
            return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "pdfzen-resume-optimizer",
                "database", "UP",
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "DOWN",
                "service", "pdfzen-resume-optimizer",
                "database", "DOWN",
                "error", e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }
}
