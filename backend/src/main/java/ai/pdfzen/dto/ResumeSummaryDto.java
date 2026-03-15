package ai.pdfzen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeSummaryDto {

    private UUID id;
    private String originalFilename;
    private Long fileSizeBytes;
    private String status;
    private Instant createdAt;
}
