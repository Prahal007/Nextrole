package ai.pdfzen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeUploadResponse {

    private UUID resumeId;
    private String originalFilename;
    private Long fileSizeBytes;
    private String status;
}
