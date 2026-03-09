-- PDFZen AI Resume Optimizer - PostgreSQL schema
-- Run this before first backend startup if not using JPA ddl-auto

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(512) NOT NULL,
    stored_path VARCHAR(1024) NOT NULL,
    file_size_bytes BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'UPLOADED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);

CREATE TABLE IF NOT EXISTS optimization_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    job_type VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    extracted_text TEXT,
    optimized_text TEXT,
    suggestions JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT fk_jobs_resume FOREIGN KEY (resume_id) REFERENCES resumes(id)
);

CREATE INDEX IF NOT EXISTS idx_optimization_jobs_resume_id ON optimization_jobs(resume_id);
CREATE INDEX IF NOT EXISTS idx_optimization_jobs_created_at ON optimization_jobs(created_at DESC);

COMMENT ON TABLE users IS 'App users (demo: use user@pdfzen.ai)';
COMMENT ON TABLE resumes IS 'Uploaded PDF resumes';
COMMENT ON TABLE optimization_jobs IS 'AI optimization job runs per resume';
