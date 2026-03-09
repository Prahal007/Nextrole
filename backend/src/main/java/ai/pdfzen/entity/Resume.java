package ai.pdfzen.entity;

import jakarta.persistence.*;
import jakarta.persistence.Lob;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    // Kept for backward compatibility — stores a logical name, not a filesystem path
    @Column(name = "stored_path", nullable = false)
    private String storedPath;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    // PDF bytes stored directly in PostgreSQL — no filesystem needed
    @Lob
    @Column(name = "file_content", columnDefinition = "bytea")
    private byte[] fileContent;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ResumeStatus status = ResumeStatus.UPLOADED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OptimizationJob> optimizationJobs = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;

    public enum ResumeStatus {
        UPLOADED,
        PROCESSING,
        EXTRACTED,
        OPTIMIZED,
        FAILED
    }
}
