package ai.pdfzen.repository;

import ai.pdfzen.entity.OptimizationJob;
import ai.pdfzen.entity.OptimizationJob.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OptimizationJobRepository extends JpaRepository<OptimizationJob, UUID> {

    List<OptimizationJob> findByResumeIdOrderByCreatedAtDesc(UUID resumeId);

    List<OptimizationJob> findByResumeIdAndStatus(UUID resumeId, JobStatus status);
}
