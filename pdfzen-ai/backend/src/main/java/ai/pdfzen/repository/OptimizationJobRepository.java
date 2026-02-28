package ai.pdfzen.repository;

import ai.pdfzen.entity.OptimizationJob;
import ai.pdfzen.entity.OptimizationJob.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptimizationJobRepository extends JpaRepository<OptimizationJob, String> {

    List<OptimizationJob> findByResumeIdOrderByCreatedAtDesc(String resumeId);

    List<OptimizationJob> findByResumeIdAndStatus(String resumeId, JobStatus status);
}
