package ai.pdfzen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeSummaryDto {

    private String id;
    private String originalFilename;
    private Long fileSizeBytes;
    private String status;
    private Instant createdAt;
}
