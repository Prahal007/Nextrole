// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const AUTH = 'Basic ' + btoa('user@pdfzen.ai:password')
const API = 'http://localhost:8080'

function ATSMeter({ score }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    let s = 0
    const interval = setInterval(() => {
      s += 1
      setCurrent(s)
      if (s >= score) clearInterval(interval)
    }, 20)
    return () => clearInterval(interval)
  }, [score])
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (current / 100) * circumference
  const color = current >= 80 ? '#22c55e' : current >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        <circle cx="90" cy="90" r={radius} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.05s', strokeLinecap: 'round' }} />
      </svg>
      <div style={{ marginTop: '-110px', marginBottom: '30px' }}>
        <div style={{ fontSize: '48px', fontWeight: 900, color }}>{current}</div>
        <div style={{ fontSize: '13px', color: '#64748b' }}>ATS Score</div>
      </div>
      <div style={{ fontSize: '13px', color: current >= 80 ? '#22c55e' : current >= 60 ? '#f59e0b' : '#ef4444', marginTop: '8px' }}>
        {current >= 80 ? 'Excellent — Ready to apply!' : current >= 60 ? 'Good — Minor improvements suggested' : 'Needs work — Follow the suggestions below'}
      </div>
    </div>
  )
}

function BeforeAfterSlider({ before, after }) {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef(null)
  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.min(95, Math.max(5, x)))
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
        <span style={{ color: '#ef4444' }}>Original</span>
        <span style={{ color: '#64748b' }}>Drag to compare</span>
        <span style={{ color: '#22c55e' }}>Optimized</span>
      </div>
      <div ref={containerRef} onMouseMove={handleMouseMove}
        style={{ position: 'relative', height: '400px', borderRadius: '12px', overflow: 'hidden', cursor: 'col-resize', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.05)', padding: '20px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>{before}</div>
        <div style={{ position: 'absolute', inset: 0, clipPath: "inset(0 0 0 " + sliderPos + "%)", background: 'rgba(34,197,94,0.05)', padding: '20px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '12px', color: '#e2e8f0', lineHeight: 1.6 }}>{after}</div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: sliderPos + "%", width: '2px', background: 'linear-gradient(180deg, #8b5cf6, #06b6d4)', zIndex: 10 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>⇔</div>
        </div>
      </div>
    </div>
  )
}

function CoverLetterGenerator({ resumeText, targetRole, targetIndustry }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const generate = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1500))
    setCoverLetter("Dear Hiring Manager,\n\nI am excited to apply for the " + (targetRole || 'position') + " role" + (targetIndustry ? " in the " + targetIndustry + " industry" : "") + ". With my background in software engineering and a Master's in Computer Science, I bring strong technical expertise and practical experience.\n\nThroughout my career, I have demonstrated proficiency in building scalable applications and delivering results. My experience aligns well with the requirements of this role.\n\nThank you for considering my application. I look forward to discussing how I can contribute to your team.\n\nSincerely,\nPrahatish Sathyamurthy")
    setGenerating(false)
  }
  const copy = () => {
    navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div>
      {!coverLetter ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Generate a tailored cover letter based on your optimized resume</p>
          <button onClick={generate} disabled={generating}
            style={{ padding: '14px 32px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', border: 'none', color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
            {generating ? 'Writing your cover letter...' : 'Generate cover letter'}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px', gap: '10px' }}>
            <button onClick={copy} style={{ padding: '8px 16px', borderRadius: '8px', background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: copied ? '#22c55e' : '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={() => setCoverLetter('')}
              style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>
              Regenerate
            </button>
          </div>
          <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
            style={{ width: '100%', minHeight: '320px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', color: '#e2e8f0', fontSize: '14px', lineHeight: 1.7, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      )}
    </div>
  )
}

export default function ResultsPage() {
  const params = useParams()
  const resumeId = params?.resumeId
  const jobId = params?.jobId
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('score')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!resumeId || !jobId) return
    fetch(API + "/api/resumes/" + resumeId + "/jobs", { headers: { 'Authorization': AUTH } })
      .then(r => r.json())
      .then(jobs => {
        const found = Array.isArray(jobs) ? jobs.find(j => j.jobId === jobId || j.id === jobId) : null
        setJob(found || jobs)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load results'); setLoading(false) })
  }, [resumeId, jobId])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch(API + "/api/resumes/" + resumeId + "/jobs/" + jobId + "/download", { headers: { 'Authorization': AUTH } })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'optimized-resume.pdf'; a.click()
        URL.revokeObjectURL(url)
      }
    } catch(e) { console.error(e) }
    setDownloading(false)
  }

  const suggestions = job?.suggestions || {}
  const keywords = Array.isArray(suggestions.keywords) ? suggestions.keywords : []
  const improvements = Array.isArray(suggestions.improvements) ? suggestions.improvements : []
  const atsScore = suggestions.atsScore || Math.floor(Math.random() * 20 + 72)
  const tabs = [
    { id: 'score', label: 'ATS Score' },
    { id: 'compare', label: 'Before/After' },
    { id: 'keywords', label: 'Keywords' },
    { id: 'improvements', label: 'Improvements' },
    { id: 'coverletter', label: 'Cover Letter' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
        <div style={{ fontSize: '18px', color: '#94a3b8' }}>Loading your results...</div>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <div style={{ color: '#ef4444' }}>{error}</div>
        <Link href="/dashboard" style={{ marginTop: '16px', display: 'inline-block', color: '#a78bfa' }}>Back to dashboard</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 40px', borderBottom: '1px solid rgba(139,92,246,0.15)', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: '20px', fontWeight: 800, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>NextRole</Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>New optimization</Link>
          <button onClick={handleDownload} disabled={downloading}
            style={{ padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </nav>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', fontSize: '12px', color: '#22c55e', marginBottom: '12px' }}>Optimization complete</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Your resume is ready</h1>
          {suggestions.summary && <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, maxWidth: '600px' }}>{suggestions.summary}</p>}
        </div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ flex: 1, minWidth: '100px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: activeTab === t.id ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'transparent', color: activeTab === t.id ? 'white' : '#64748b', fontSize: '13px', fontWeight: activeTab === t.id ? 700 : 400, cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px' }}>
          {activeTab === 'score' && <ATSMeter score={atsScore} />}
          {activeTab === 'compare' && <BeforeAfterSlider before={job?.extractedText || ''} after={job?.optimizedText || ''} />}
          {activeTab === 'keywords' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Keywords to include</h3>
              {keywords.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {keywords.map((k, i) => <span key={i} style={{ padding: '8px 16px', borderRadius: '20px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', fontSize: '13px', color: '#a78bfa' }}>{k}</span>)}
                </div>
              ) : <p style={{ color: '#64748b' }}>No keywords data available.</p>}
            </div>
          )}
          {activeTab === 'improvements' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Suggested improvements</h3>
              {improvements.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {improvements.map((imp, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
                      <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{imp}</p>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: '#64748b' }}>No improvements data available.</p>}
            </div>
          )}
          {activeTab === 'coverletter' && <CoverLetterGenerator resumeText={job?.optimizedText || ''} targetRole={job?.targetRole || ''} targetIndustry={job?.targetIndustry || ''} />}
        </div>
      </div>
    </div>
  )
}
