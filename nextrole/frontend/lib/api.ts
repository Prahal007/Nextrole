const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export type ResumeSummary = {
  id: string;
  originalFilename: string;
  fileSizeBytes: number;
  status: string;
  createdAt: string;
};

export type OptimizationResponse = {
  jobId: string;
  resumeId: string;
  status: string;
  extractedText?: string;
  optimizedText?: string;
  suggestions?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
};

export type OptimizationRequest = {
  jobType: string;
  targetRole?: string;
  targetIndustry?: string;
};

async function api<T>(
  path: string,
  options: RequestInit & { basicAuth?: { user: string; password: string } } = {}
): Promise<T> {
  const { basicAuth, ...fetchOptions } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };
  if (basicAuth) {
    headers['Authorization'] =
      'Basic ' + btoa(`${basicAuth.user}:${basicAuth.password}`);
  }
  const res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function uploadResume(
  file: File,
  basicAuth: { user: string; password: string }
): Promise<{ resumeId: string; originalFilename: string; fileSizeBytes: number; status: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/resumes/upload`, {
    method: 'POST',
    body: form,
    headers: {
      Authorization: 'Basic ' + btoa(`${basicAuth.user}:${basicAuth.password}`),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json();
}

export async function listResumes(
  basicAuth: { user: string; password: string }
): Promise<ResumeSummary[]> {
  return api<ResumeSummary[]>('/api/resumes', { basicAuth });
}

export async function optimizeResume(
  resumeId: string,
  body: OptimizationRequest,
  basicAuth: { user: string; password: string }
): Promise<OptimizationResponse> {
  return api<OptimizationResponse>(`/api/resumes/${resumeId}/optimize`, {
    method: 'POST',
    body: JSON.stringify(body),
    basicAuth,
  });
}

export async function listJobs(
  resumeId: string,
  basicAuth: { user: string; password: string }
): Promise<OptimizationResponse[]> {
  return api<OptimizationResponse[]>(`/api/resumes/${resumeId}/jobs`, {
    basicAuth,
  });
}

/**
 * Fetches the optimized resume as a PDF blob. Caller should trigger download.
 */
export async function downloadOptimizedPdf(
  resumeId: string,
  jobId: string,
  basicAuth: { user: string; password: string }
): Promise<Blob> {
  const res = await fetch(
    `${API_BASE}/api/resumes/${resumeId}/jobs/${jobId}/download-pdf`,
    {
      headers: {
        Authorization:
          'Basic ' + btoa(`${basicAuth.user}:${basicAuth.password}`),
      },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.blob();
}
