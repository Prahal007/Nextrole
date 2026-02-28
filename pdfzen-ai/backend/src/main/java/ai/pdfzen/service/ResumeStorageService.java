package ai.pdfzen.service;

import ai.pdfzen.entity.Resume;
import ai.pdfzen.entity.User;
import ai.pdfzen.repository.ResumeRepository;
import ai.pdfzen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeStorageService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    @Transactional
    public Resume store(String userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "resume.pdf";
        }
        if (!originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        Path basePath = Path.of(uploadDir);
        Files.createDirectories(basePath);
        String storedName = UUID.randomUUID() + "_" + sanitize(originalFilename);
        Path targetPath = basePath.resolve(storedName);
        file.transferTo(targetPath.toFile());

        Resume resume = Resume.builder()
                .originalFilename(originalFilename)
                .storedPath(storedName)
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
