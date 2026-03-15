package ai.pdfzen.repository;

import ai.pdfzen.entity.Resume;
import ai.pdfzen.entity.Resume.ResumeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {

    List<Resume> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Resume> findByUserIdAndStatus(UUID userId, ResumeStatus status);
}
