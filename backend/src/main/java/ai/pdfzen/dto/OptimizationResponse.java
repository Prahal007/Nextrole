package ai.pdfzen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationResponse {

    private UUID jobId;
    private UUID resumeId;
    private String status;
    private String extractedText;
    private String optimizedText;
    private Map<String, Object> suggestions;
    private Instant createdAt;
    private Instant completedAt;
}
