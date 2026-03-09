package ai.pdfzen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeUploadResponse {

    private String resumeId;
    private String originalFilename;
    private Long fileSizeBytes;
    private String status;
}
