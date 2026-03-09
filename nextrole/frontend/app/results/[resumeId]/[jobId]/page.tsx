'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { downloadOptimizedPdf, listJobs, type OptimizationResponse } from '@/lib/api';

const DEFAULT_AUTH = { user: 'user@nextrole.ai', password: 'password' };

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams<{ resumeId: string; jobId: string }>();

  const resumeId = typeof params?.resumeId === 'string' ? params.resumeId : '';
  const jobId = typeof params?.jobId === 'string' ? params.jobId : '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<OptimizationResponse | null>(null);

  useEffect(() => {
    if (!resumeId || !jobId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listJobs(resumeId, DEFAULT_AUTH)
      .then((jobs) => {
        if (cancelled) return;
        const found = jobs.find((j) => j.jobId === jobId) ?? null;
        setJob(found);
        if (!found) setError('Report not found for this resume.');
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load report');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resumeId, jobId]);

  const suggestions = (job?.suggestions ?? {}) as Record<string, unknown>;
  const keywords = useMemo(() => getStringArray(suggestions.keywords), [suggestions]);
  const improvements = useMemo(
    () => getStringArray(suggestions.improvements),
    [suggestions]
  );
  const summary =
    typeof suggestions.summary === 'string' && suggestions.summary.trim()
      ? suggestions.summary.trim()
      : 'Review the optimized version and apply the improvements below.';

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const onDownload = async () => {
    if (!job?.optimizedText) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await downloadOptimizedPdf(resumeId, jobId, DEFAULT_AUTH);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimized_resume_${resumeId.slice(0, 8)}_${jobId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <SparkIcon className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">NextRole</div>
              <div className="text-xs text-slate-500">Results report</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              Back to dashboard
            </Link>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              <RefreshIcon className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Optimization report
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Extracted vs optimized text, ATS keywords, and actionable improvements.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
            <div className="flex items-start gap-3">
              <AlertIcon className="mt-0.5 h-5 w-5 flex-none" />
              <div>
                <div className="font-semibold">Unable to load report</div>
                <div className="mt-1">{error}</div>
              </div>
            </div>
          </div>
        )}

        {!loading && job && (
          <div className="space-y-6">
            <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200">
                    <ReportIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Professional summary
                    </div>
                    <div className="mt-1 max-w-3xl text-sm text-slate-600">
                      {summary}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                        Status: {job.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                        Created: {new Date(job.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  {downloadError && (
                    <div className="text-sm text-rose-600">{downloadError}</div>
                  )}
                  <button
                    type="button"
                    onClick={onDownload}
                    disabled={!job.optimizedText || downloading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    {downloading ? 'Preparing PDF…' : 'Download optimized resume (PDF)'}
                  </button>
                  <div className="text-xs text-slate-500">
                    Downloads as <span className="font-mono">.pdf</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TextPanel
                title="Extracted text"
                subtitle="What we pulled from the uploaded PDF."
                text={job.extractedText ?? ''}
              />
              <TextPanel
                title="Optimized text"
                subtitle="Improved clarity, impact, and ATS alignment."
                text={job.optimizedText ?? ''}
                accent
              />
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        ATS keywords
                      </h2>
                      <p className="mt-1 text-xs text-slate-600">
                        High-signal skills and terms detected.
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                      {keywords.length}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {keywords.length === 0 ? (
                      <div className="text-sm text-slate-600">
                        No keywords returned.
                      </div>
                    ) : (
                      keywords.map((k, idx) => (
                        <KeywordBadge key={`${k}-${idx}`} label={k} idx={idx} />
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Improvement checklist
                      </h2>
                      <p className="mt-1 text-xs text-slate-600">
                        Concrete next steps to strengthen the resume.
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                      {improvements.length}
                    </span>
                  </div>

                  {improvements.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      No improvements returned.
                    </div>
                  ) : (
                    <ol className="mt-4 space-y-3">
                      {improvements.map((item, i) => (
                        <li
                          key={i}
                          className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
                            {i + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-900">
                              {item}
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                <CheckIcon className="h-3.5 w-3.5" />
                                Actionable
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                                Checklist item
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function TextPanel({
  title,
  subtitle,
  text,
  accent,
}: {
  title: string;
  subtitle: string;
  text: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-xs text-slate-600">{subtitle}</p>
          </div>
          {accent && (
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
              Recommended
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <pre className="max-h-[520px] whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-900">
            {text || '—'}
          </pre>
        </div>
      </div>
    </div>
  );
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean);
}

function KeywordBadge({ label, idx }: { label: string; idx: number }) {
  const styles = [
    'bg-indigo-50 text-indigo-700 ring-indigo-200',
    'bg-emerald-50 text-emerald-700 ring-emerald-200',
    'bg-sky-50 text-sky-700 ring-sky-200',
    'bg-amber-50 text-amber-800 ring-amber-200',
    'bg-violet-50 text-violet-700 ring-violet-200',
    'bg-rose-50 text-rose-700 ring-rose-200',
  ];
  const cls = styles[idx % styles.length];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${cls}`}
    >
      {label}
    </span>
  );
}

function SparkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2l1.2 4.2L17.4 7.4 13.2 8.6 12 12.8 10.8 8.6 6.6 7.4l4.2-1.2L12 2ZM19 12l.8 2.8 2.8.8-2.8.8L19 19l-.8-2.8-2.8-.8 2.8-.8L19 12ZM5 13l.9 3.1L9 17l-3.1.9L5 21l-.9-3.1L1 17l3.1-.9L5 13Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ReportIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9 12h6m-6 4h6M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3v10m0 0 4-4m-4 4-4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20 12a8 8 0 1 1-2.3-5.7M20 4v6h-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 9v4m0 4h.01M10.3 3.9a2 2 0 0 1 3.4 0l8.2 14.2A2 2 0 0 1 20.2 21H3.8a2 2 0 0 1-1.7-2.9l8.2-14.2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

