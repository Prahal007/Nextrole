package ai.pdfzen.service;

import ai.pdfzen.entity.Resume;
import ai.pdfzen.entity.User;
import ai.pdfzen.repository.ResumeRepository;
import ai.pdfzen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeStorageService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    @Transactional
    public Resume store(UUID userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "resume.pdf";
        }
        if (!originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        // Store file bytes directly in PostgreSQL — no filesystem dependency
        String storedName = UUID.randomUUID() + "_" + sanitize(originalFilename);
        byte[] fileBytes = file.getBytes();

        Resume resume = Resume.builder()
                .originalFilename(originalFilename)
                .storedPath(storedName)
                .fileContent(fileBytes)
                .fileSizeBytes(file.getSize())
                .status(Resume.ResumeStatus.UPLOADED)
                .user(user)
                .build();
        return resumeRepository.save(resume);
    }

    private static String sanitize(String name) {
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
