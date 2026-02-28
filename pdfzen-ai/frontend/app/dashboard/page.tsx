'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

const AUTH = 'Basic ' + btoa('user@pdfzen.ai:password')
const API = 'http://localhost:8080'

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [error, setError] = useState('')
  const [jobType, setJobType] = useState('general')
  const [targetRole, setTargetRole] = useState('')
  const [targetIndustry, setTargetIndustry] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { setError('Please upload a PDF file'); return }
    if (f.size > 5 * 1024 * 1024) { setError('File must be under 5MB'); return }
    setFile(f); setError('')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleOptimize = async () => {
    if (!file) return
    setUploading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const up = await fetch(`${API}/api/resumes/upload`, {
        method: 'POST',
        headers: { 'Authorization': AUTH },
        body: fd
      })
      if (!up.ok) throw new Error(`Upload failed: ${up.status}`)
      const upData = await up.json()
      const resumeId = upData.resumeId || upData.id
      setUploading(false); setOptimizing(true)
      const opt = await fetch(`${API}/api/resumes/${resumeId}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': AUTH },
        body: JSON.stringify({ jobType, targetRole, targetIndustry })
      })
      if (!opt.ok) throw new Error(`Optimization failed: ${opt.status}`)
      const optData = await opt.json()
      const jobId = optData.jobId || optData.id
      window.location.href = `/results/${resumeId}/${jobId}`
    } catch (e: any) {
      setError(e.message); setUploading(false); setOptimizing(false)
    }
  }

  const isLoading = uploading || optimizing

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 40px', borderBottom: '1px solid rgba(139,92,246,0.15)', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: '20px', fontWeight: 800, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>NextRole ⚡</Link>
        <div style={{ fontSize: '13px', color: '#475569' }}>5 free optimizations/day</div>
      </nav>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>Optimize your resume</h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Upload your PDF and let AI supercharge it for your target role</p>
        </div>
        <div
          style={{ background: 'rgba(255,255,255,0.03)', border: dragOver ? '2px dashed #8b5cf6' : '2px dashed rgba(139,92,246,0.25)', borderRadius: '20px', padding: '60px 40px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '24px' }}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#a78bfa', marginBottom: '4px' }}>{file.name}</div>
              <div style={{ fontSize: '13px', color: '#475569' }}>{(file.size / 1024).toFixed(0)} KB · Click to change</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📥</div>
              <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Drop your resume here</div>
              <div style={{ fontSize: '14px', color: '#475569' }}>PDF only · Max 5MB · or click to browse</div>
            </div>
          )}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: '#e2e8f0' }}>🎯 Optimization target</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Type</label>
              <select value={jobType} onChange={e => setJobType(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', outline: 'none' }}>
                <option value="general">General</option>
                <option value="software-engineering">Software Engineering</option>
                <option value="data-science">Data Science</option>
                <option value="product-management">Product Management</option>
                <option value="finance">Finance</option>
                <option value="marketing">Marketing</option>
                <option value="design">Design</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Role</label>
              <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Senior Engineer" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Industry</label>
              <input value={targetIndustry} onChange={e => setTargetIndustry(e.target.value)} placeholder="e.g. Fintech" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#fca5a5', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}
        <button
          onClick={handleOptimize}
          disabled={!file || isLoading}
          style={{ width: '100%', padding: '18px', borderRadius: '14px', background: file && !isLoading ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'rgba(255,255,255,0.05)', border: 'none', color: file && !isLoading ? 'white' : '#475569', fontSize: '17px', fontWeight: 700, cursor: file && !isLoading ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: file && !isLoading ? '0 0 40px rgba(139,92,246,0.3)' : 'none' }}
        >
          {uploading ? '⬆️ Uploading...' : optimizing ? '🤖 AI is optimizing...' : '⚡ Optimize my resume'}
        </button>
        {isLoading && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
              {uploading ? 'Uploading your resume...' : 'AI is rewriting your resume. This takes ~15 seconds...'}
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)', borderRadius: '2px', animation: 'progress 2s ease-in-out infinite' }} />
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes progress { 0% { transform: translateX(-100%) } 100% { transform: translateX(300%) } } select option { background: #1e1e2e; }`}</style>
    </div>
  )
}