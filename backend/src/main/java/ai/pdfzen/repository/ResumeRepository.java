package ai.pdfzen.repository;

import ai.pdfzen.entity.Resume;
import ai.pdfzen.entity.Resume.ResumeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, String> {

    List<Resume> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Resume> findByUserIdAndStatus(String userId, ResumeStatus status);
}
