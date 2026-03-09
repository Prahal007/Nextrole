package ai.pdfzen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationResponse {

    private String jobId;
    private String resumeId;
    private String status;
    private String extractedText;
    private String optimizedText;
    private Map<String, Object> suggestions;
    private Instant createdAt;
    private Instant completedAt;
}
