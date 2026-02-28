package ai.pdfzen.controller;

import ai.pdfzen.dto.OptimizationRequest;
import ai.pdfzen.dto.OptimizationResponse;
import ai.pdfzen.dto.ResumeSummaryDto;
import ai.pdfzen.dto.ResumeUploadResponse;
import ai.pdfzen.entity.OptimizationJob;
import ai.pdfzen.entity.Resume;
import ai.pdfzen.service.PdfExportService;
import ai.pdfzen.service.ResumeOptimizationService;
import ai.pdfzen.service.ResumeStorageService;
import ai.pdfzen.repository.ResumeRepository;
import ai.pdfzen.repository.OptimizationJobRepository;
import ai.pdfzen.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeStorageService resumeStorageService;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeOptimizationService optimizationService;
    private final OptimizationJobRepository jobRepository;
    private final PdfExportService pdfExportService;

    @PostMapping("/upload")
    public ResponseEntity<ResumeUploadResponse> upload(
            @RequestParam("file") MultipartFile file) throws IOException {
        String userId = userRepository.findByEmail("user@pdfzen.ai")
                .orElseThrow(() -> new IllegalArgumentException("User not found")).getId();
        Resume resume = resumeStorageService.store(userId, file);
        return ResponseEntity.ok(ResumeUploadResponse.builder()
                .resumeId(resume.getId())
                .originalFilename(resume.getOriginalFilename())
                .fileSizeBytes(resume.getFileSizeBytes())
                .status(resume.getStatus().name())
                .build());
    }

    @GetMapping
    public ResponseEntity<List<ResumeSummaryDto>> list() {
        String userId = userRepository.findByEmail("user@pdfzen.ai")
                .orElseThrow(() -> new IllegalArgumentException("User not found")).getId();
        List<ResumeSummaryDto> list = resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{resumeId}")
    public ResponseEntity<ResumeSummaryDto> get(
            @PathVariable String resumeId) {
        String userId = userRepository.findByEmail("user@pdfzen.ai")
                .orElseThrow(() -> new IllegalArgumentException("User not found")).getId();
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("Resume not found"));
        if (!resume.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Forbidden");
        }
        return ResponseEntity.ok(toSummary(resume));
    }

    @PostMapping("/{resumeId}/optimize")
    public ResponseEntity<OptimizationResponse> optimize(
            @PathVariable String resumeId,
            @Valid @RequestBody OptimizationRequest request) {
        String userId = userRepository.findByEmail("user@pdfzen.ai")
                .orElseThrow(() -> new IllegalArgumentException("User not found")).getId();
        OptimizationJob job = optimizationService.createAndRunJob(resumeId, userId, request);
        return ResponseEntity.ok(toResponse(job));
    }

    @GetMapping("/{resumeId}/jobs")
    public ResponseEntity<List<OptimizationResponse>> listJobs(
            @PathVariable String resumeId) {
        String userId = userRepository.findByEmail("user@pdfzen.ai")
                .orElseThrow(() -> new IllegalArgumentException("User not found")).getId();
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("Resume not found"));
        if (!resume.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Forbidden");
        }
        List<OptimizationResponse> jobs = jobRepository.findByResumeIdOrderByCreatedAtDesc(resumeId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{resumeId}/jobs/{jobId}/download-pdf")
    public ResponseEntity<byte[]> downloadOptimizedPdf(
            @PathVariable String resumeId,
            @PathVariable String jobId) throws IOException {
        String userId = userRepository.findByEmail("user@pdfzen.ai")
                .orElseThrow(() -> new IllegalArgumentException("User not found")).getId();
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("Resume not found"));
        if (!resume.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Forbidden");
        }
        OptimizationJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));
        if (!job.getResume().getId().equals(resumeId)) {
            throw new IllegalArgumentException("Job does not belong to this resume");
        }
        String optimizedText = job.getOptimizedText();
        if (optimizedText == null || optimizedText.isBlank()) {
            throw new IllegalArgumentException("No optimized text available for this job");
        }
        byte[] pdfBytes = pdfExportService.textToPdf(optimizedText);
        String filename = "optimized_resume_" + resumeId.substring(0, Math.min(8, resumeId.length())) + ".pdf";
        String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + encodedFilename);
        headers.setContentLength(pdfBytes.length);
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    private ResumeSummaryDto toSummary(Resume r) {
        return ResumeSummaryDto.builder()
                .id(r.getId())
                .originalFilename(r.getOriginalFilename())
                .fileSizeBytes(r.getFileSizeBytes())
                .status(r.getStatus().name())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private OptimizationResponse toResponse(OptimizationJob j) {
        return OptimizationResponse.builder()
                .jobId(j.getId())
                .resumeId(j.getResume().getId())
                .status(j.getStatus().name())
                .extractedText(j.getExtractedText())
                .optimizedText(j.getOptimizedText())
                .suggestions(j.getSuggestions())
                .createdAt(j.getCreatedAt())
                .completedAt(j.getCompletedAt())
                .build();
    }
}
