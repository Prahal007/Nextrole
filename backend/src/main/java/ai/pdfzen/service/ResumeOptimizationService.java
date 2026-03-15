package ai.pdfzen.service;

import ai.pdfzen.dto.OptimizationRequest;
import ai.pdfzen.entity.OptimizationJob;
import ai.pdfzen.entity.Resume;
import ai.pdfzen.repository.OptimizationJobRepository;
import ai.pdfzen.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeOptimizationService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ResumeOptimizationService.class);

    private final ResumeRepository resumeRepository;
    private final OptimizationJobRepository jobRepository;
    private final PdfExtractionService pdfExtractionService;
    private final AiOptimizationService aiOptimizationService;

    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    @Transactional
    public OptimizationJob createAndRunJob(String resumeId, String userId, OptimizationRequest request) {
        Resume resume = resumeRepository.findById(UUID.fromString(resumeId))
                .orElseThrow(() -> new IllegalArgumentException("Resume not found: " + resumeId));
        if (!resume.getUser().getId().toString().equals(userId)) {
            throw new IllegalArgumentException("Resume does not belong to user");
        }

        OptimizationJob job = OptimizationJob.builder()
                .resume(resume)
                .jobType(request.getJobType())
                .status(OptimizationJob.JobStatus.PENDING)
                .build();
        job = jobRepository.save(job);

        try {
            job.setStatus(OptimizationJob.JobStatus.EXTRACTING);
            jobRepository.save(job);

            String extractedText = pdfExtractionService.extractText(
                    java.nio.file.Paths.get(uploadDir, resume.getStoredPath()));
            job.setExtractedText(extractedText);
            job.setStatus(OptimizationJob.JobStatus.OPTIMIZING);
            jobRepository.save(job);

            Map<String, Object> context = new HashMap<>();
            if (request.getTargetRole() != null) context.put("targetRole", request.getTargetRole());
            if (request.getTargetIndustry() != null) context.put("targetIndustry", request.getTargetIndustry());

            String optimized = aiOptimizationService.optimizeResumeText(extractedText, request.getJobType(), context);
            Map<String, Object> suggestions = aiOptimizationService.getSuggestions(extractedText, request.getJobType(), context);

            job.setOptimizedText(optimized);
            job.setSuggestions(suggestions);
            job.setStatus(OptimizationJob.JobStatus.COMPLETED);
            job.setCompletedAt(Instant.now());
        } catch (Exception e) {
            log.error("Optimization failed for job {}", job.getId(), e);
            job.setStatus(OptimizationJob.JobStatus.FAILED);
            job.setErrorMessage(e.getMessage());
        }
        return jobRepository.save(job);
    }
}
