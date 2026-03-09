package ai.pdfzen.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationRequest {

    @NotBlank(message = "Job type is required")
    private String jobType;

    private String targetRole;
    private String targetIndustry;
}
