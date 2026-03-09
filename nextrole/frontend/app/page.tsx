// @ts-nocheck
'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const particles: {x:number,y:number,vx:number,vy:number,size:number,opacity:number}[] = []
    for (let i = 0; i < 80; i++) {
      particles.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4, size: Math.random()*2+0.5, opacity: Math.random()*0.5+0.1})
    }
    let animId: number
    const animate = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy
        if(p.x<0||p.x>canvas.width) p.vx*=-1
        if(p.y<0||p.y>canvas.height) p.vy*=-1
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2)
        ctx.fillStyle='rgba(139,92,246,'+p.opacity+')'; ctx.fill()
      })
      animId=requestAnimationFrame(animate)
    }
    animate()
    return ()=>cancelAnimationFrame(animId)
  }, [])

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',color:'white',fontFamily:'system-ui,sans-serif'}}>
      <canvas ref={canvasRef} style={{position:'fixed',top:0,left:0,pointerEvents:'none',zIndex:0}} />
      <nav style={{position:'relative',zIndex:10,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 40px',borderBottom:'1px solid rgba(139,92,246,0.15)'}}>
        <div style={{fontSize:'22px',fontWeight:800,background:'linear-gradient(135deg,#8b5cf6,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>NextRole ⚡</div>
        <div style={{display:'flex',gap:'12px'}}>
          <Link href="/dashboard" style={{padding:'8px 20px',borderRadius:'8px',border:'1px solid rgba(139,92,246,0.4)',color:'#a78bfa',textDecoration:'none',fontSize:'14px'}}>Sign in</Link>
          <Link href="/dashboard" style={{padding:'8px 20px',borderRadius:'8px',background:'linear-gradient(135deg,#8b5cf6,#06b6d4)',color:'white',textDecoration:'none',fontSize:'14px',fontWeight:600}}>Get started free</Link>
        </div>
      </nav>
      <div style={{position:'relative',zIndex:10,textAlign:'center',padding:'100px 20px 60px'}}>
        <div style={{display:'inline-block',padding:'6px 16px',borderRadius:'20px',background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',fontSize:'13px',color:'#a78bfa',marginBottom:'32px'}}>✨ AI-powered resume optimization</div>
        <h1 style={{fontSize:'clamp(40px,6vw,72px)',fontWeight:900,lineHeight:1.1,maxWidth:'800px',margin:'0 auto 24px'}}>
          Your Resume, <span style={{background:'linear-gradient(135deg,#8b5cf6,#06b6d4,#f472b6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Supercharged</span> by AI
        </h1>
        <p style={{fontSize:'18px',color:'#94a3b8',maxWidth:'540px',margin:'0 auto 48px',lineHeight:1.7}}>Upload your PDF. Our AI rewrites your resume, boosts your ATS score, and suggests the exact keywords recruiters search for.</p>
        <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
          <Link href="/dashboard" style={{padding:'16px 36px',borderRadius:'12px',background:'linear-gradient(135deg,#8b5cf6,#06b6d4)',color:'white',textDecoration:'none',fontSize:'16px',fontWeight:700,boxShadow:'0 0 40px rgba(139,92,246,0.4)'}}>Optimize my resume →</Link>
          <a href="#how" style={{padding:'16px 36px',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.1)',color:'#94a3b8',textDecoration:'none',fontSize:'16px'}}>See how it works</a>
        </div>
        <p style={{marginTop:'20px',fontSize:'13px',color:'#475569'}}>Free · No credit card required · 5 optimizations/day</p>
      </div>
      <div style={{position:'relative',zIndex:10,display:'flex',justifyContent:'center',gap:'40px',padding:'0 20px 80px',flexWrap:'wrap'}}>
        {[['10k+','Resumes optimized'],['94%','ATS pass rate'],['3x','More interviews'],['30s','Average time']].map(([n,l])=>(
          <div key={n} style={{textAlign:'center'}}>
            <div style={{fontSize:'32px',fontWeight:800,background:'linear-gradient(135deg,#8b5cf6,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{n}</div>
            <div style={{fontSize:'13px',color:'#64748b',marginTop:'4px'}}>{l}</div>
          </div>
        ))}
      </div>
      <div id="how" style={{position:'relative',zIndex:10,maxWidth:'1000px',margin:'0 auto',padding:'0 20px 100px'}}>
        <h2 style={{textAlign:'center',fontSize:'36px',fontWeight:800,marginBottom:'60px'}}>How it works</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'24px'}}>
          {[{icon:'📄',title:'Upload your PDF',desc:'Drop your existing resume and we extract all the text instantly.'},{icon:'🤖',title:'AI rewrites it',desc:'GPT-4 strengthens your bullet points, adds impact, and fixes formatting.'},{icon:'🎯',title:'ATS score + keywords',desc:'See your score and get the exact keywords to beat applicant tracking systems.'},{icon:'⬇️',title:'Download and apply',desc:'Get a polished, ready-to-submit resume in seconds.'}].map(f=>(
            <div key={f.title} style={{padding:'28px',borderRadius:'16px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
              <div style={{fontSize:'32px',marginBottom:'16px'}}>{f.icon}</div>
              <h3 style={{fontSize:'18px',fontWeight:700,marginBottom:'8px'}}>{f.title}</h3>
              <p style={{fontSize:'14px',color:'#94a3b8',lineHeight:1.6}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{position:'relative',zIndex:10,textAlign:'center',padding:'80px 20px 60px'}}>
        <h2 style={{fontSize:'36px',fontWeight:800,marginBottom:'16px'}}>Ready to land more interviews?</h2>
        <p style={{color:'#64748b',marginBottom:'32px'}}>Join thousands of job seekers who optimized their resume with NextRole.</p>
        <Link href="/dashboard" style={{padding:'16px 40px',borderRadius:'12px',background:'linear-gradient(135deg,#8b5cf6,#06b6d4)',color:'white',textDecoration:'none',fontSize:'16px',fontWeight:700}}>Start for free →</Link>
      </div>
      <footer style={{position:'relative',zIndex:10,textAlign:'center',padding:'20px',fontSize:'13px',color:'#334155',borderTop:'1px solid rgba(255,255,255,0.05)'}}>© 2026 NextRole AI · Built with ❤️</footer>
    </div>
  )
}
