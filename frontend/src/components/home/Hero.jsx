// src/components/Hero.jsx
import { motion } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { Link } from 'react-router-dom'
import { HiOutlineArrowRight, HiOutlineSparkles } from 'react-icons/hi'
import { useEffect, useRef, useState } from 'react'
import api from '../../utils/api'

/* ═══════════════════════════════════════════════════
   WAVE CANVAS
   ═══════════════════════════════════════════════════ */

const WaveCanvas = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId = 0
    let time = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }

    resize()
    window.addEventListener('resize', resize)

    const waves = [
      { y: 0.82, amplitude: 35, frequency: 0.008, speed: 0.012, color: 'rgba(42,22,14,0.06)', lineColor: 'rgba(42,22,14,0.12)', lineWidth: 1.2, phase: 0 },
      { y: 0.78, amplitude: 28, frequency: 0.012, speed: 0.018, color: 'rgba(163,72,42,0.05)', lineColor: 'rgba(163,72,42,0.14)', lineWidth: 1, phase: 1.2 },
      { y: 0.74, amplitude: 22, frequency: 0.015, speed: 0.024, color: 'rgba(170,148,30,0.04)', lineColor: 'rgba(170,148,30,0.1)', lineWidth: 0.8, phase: 2.5 },
      { y: 0.70, amplitude: 18, frequency: 0.01, speed: 0.015, color: 'rgba(163,72,42,0.03)', lineColor: 'rgba(163,72,42,0.08)', lineWidth: 0.6, phase: 3.8 },
      { y: 0.66, amplitude: 14, frequency: 0.018, speed: 0.02, color: 'rgba(42,22,14,0.02)', lineColor: 'rgba(42,22,14,0.05)', lineWidth: 0.5, phase: 5.0 },
    ]

    const ribbonWaves = [
      { y: 0.25, amplitude: 12, frequency: 0.006, speed: 0.01, lineColor: 'rgba(163,72,42,0.07)', lineWidth: 0.8, phase: 0 },
      { y: 0.35, amplitude: 10, frequency: 0.009, speed: 0.014, lineColor: 'rgba(170,148,30,0.06)', lineWidth: 0.6, phase: 2.0 },
      { y: 0.45, amplitude: 8, frequency: 0.012, speed: 0.008, lineColor: 'rgba(42,22,14,0.04)', lineWidth: 0.5, phase: 4.0 },
    ]

    const getY = (x, w, t, baseY) =>
      baseY +
      Math.sin(x * w.frequency + t * w.speed * 60 + w.phase) * w.amplitude +
      Math.sin(x * w.frequency * 1.8 + t * w.speed * 40 + w.phase + 1.3) * (w.amplitude * 0.4) +
      Math.sin(x * w.frequency * 0.5 + t * w.speed * 20 + w.phase + 2.7) * (w.amplitude * 0.6)

    const drawWave = (w, t) => {
      const width = window.innerWidth
      const height = window.innerHeight
      const baseY = height * w.y
      ctx.beginPath()
      ctx.moveTo(0, baseY)
      for (let x = 0; x <= width; x += 2) ctx.lineTo(x, getY(x, w, t, baseY))
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()
      ctx.fillStyle = w.color
      ctx.fill()

      ctx.beginPath()
      for (let x = 0; x <= width; x += 2) {
        const y = getY(x, w, t, baseY)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = w.lineColor
      ctx.lineWidth = w.lineWidth
      ctx.stroke()
    }

    const drawRibbon = (w, t) => {
      const width = window.innerWidth
      const height = window.innerHeight
      const baseY = height * w.y
      ctx.beginPath()
      for (let x = 0; x <= width; x += 2) {
        const y =
          baseY +
          Math.sin(x * w.frequency + t * w.speed * 60 + w.phase) * w.amplitude +
          Math.sin(x * w.frequency * 2.2 + t * w.speed * 35 + w.phase + 1.8) * (w.amplitude * 0.35)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = w.lineColor
      ctx.lineWidth = w.lineWidth
      ctx.stroke()
    }

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      time += 0.016
      ribbonWaves.forEach((w) => drawRibbon(w, time))
      for (let i = waves.length - 1; i >= 0; i--) drawWave(waves[i], time)
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-[1] pointer-events-none" />
}

/* ═══════════════════════════════════════════════════
   SVG WAVES — Bottom
   ═══════════════════════════════════════════════════ */

const WaveSVGBottom = () => (
  <div className="absolute bottom-0 left-0 w-full z-[2] pointer-events-none overflow-hidden">
    <motion.svg
      viewBox="0 0 1440 200"
      className="absolute bottom-0 w-full"
      style={{ height: '180px' }}
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0,120 C120,160 240,180 360,160 C480,140 600,100 720,100 C840,100 960,140 1080,150 C1200,160 1320,140 1440,120 L1440,200 L0,200 Z"
        fill="rgba(42,22,14,0.08)"
        animate={{
          d: [
            'M0,120 C120,160 240,180 360,160 C480,140 600,100 720,100 C840,100 960,140 1080,150 C1200,160 1320,140 1440,120 L1440,200 L0,200 Z',
            'M0,140 C120,120 240,100 360,120 C480,140 600,170 720,160 C840,150 960,110 1080,120 C1200,130 1320,160 1440,140 L1440,200 L0,200 Z',
            'M0,120 C120,160 240,180 360,160 C480,140 600,100 720,100 C840,100 960,140 1080,150 C1200,160 1320,140 1440,120 L1440,200 L0,200 Z',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.path
        d="M0,120 C120,160 240,180 360,160 C480,140 600,100 720,100 C840,100 960,140 1080,150 C1200,160 1320,140 1440,120"
        fill="none"
        stroke="rgba(42,22,14,0.15)"
        strokeWidth="1.5"
        animate={{
          d: [
            'M0,120 C120,160 240,180 360,160 C480,140 600,100 720,100 C840,100 960,140 1080,150 C1200,160 1320,140 1440,120',
            'M0,140 C120,120 240,100 360,120 C480,140 600,170 720,160 C840,150 960,110 1080,120 C1200,130 1320,160 1440,140',
            'M0,120 C120,160 240,180 360,160 C480,140 600,100 720,100 C840,100 960,140 1080,150 C1200,160 1320,140 1440,120',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.svg>

    <motion.svg
      viewBox="0 0 1440 200"
      className="absolute bottom-0 w-full"
      style={{ height: '140px' }}
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0,130 C180,170 360,150 540,130 C720,110 900,130 1080,150 C1260,170 1350,140 1440,130 L1440,200 L0,200 Z"
        fill="rgba(163,72,42,0.05)"
        animate={{
          d: [
            'M0,130 C180,170 360,150 540,130 C720,110 900,130 1080,150 C1260,170 1350,140 1440,130 L1440,200 L0,200 Z',
            'M0,150 C180,130 360,110 540,140 C720,170 900,160 1080,130 C1260,110 1350,150 1440,150 L1440,200 L0,200 Z',
            'M0,130 C180,170 360,150 540,130 C720,110 900,130 1080,150 C1260,170 1350,140 1440,130 L1440,200 L0,200 Z',
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.path
        d="M0,130 C180,170 360,150 540,130 C720,110 900,130 1080,150 C1260,170 1350,140 1440,130"
        fill="none"
        stroke="rgba(163,72,42,0.1)"
        strokeWidth="1"
        animate={{
          d: [
            'M0,130 C180,170 360,150 540,130 C720,110 900,130 1080,150 C1260,170 1350,140 1440,130',
            'M0,150 C180,130 360,110 540,140 C720,170 900,160 1080,130 C1260,110 1350,150 1440,150',
            'M0,130 C180,170 360,150 540,130 C720,110 900,130 1080,150 C1260,170 1350,140 1440,130',
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
    </motion.svg>

    <motion.svg
      viewBox="0 0 1440 200"
      className="absolute bottom-0 w-full"
      style={{ height: '100px' }}
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0,160 C240,140 480,170 720,155 C960,140 1200,165 1440,155 L1440,200 L0,200 Z"
        fill="rgba(170,148,30,0.04)"
        animate={{
          d: [
            'M0,160 C240,140 480,170 720,155 C960,140 1200,165 1440,155 L1440,200 L0,200 Z',
            'M0,155 C240,170 480,145 720,160 C960,175 1200,145 1440,160 L1440,200 L0,200 Z',
            'M0,160 C240,140 480,170 720,155 C960,140 1200,165 1440,155 L1440,200 L0,200 Z',
          ],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.path
        d="M0,160 C240,140 480,170 720,155 C960,140 1200,165 1440,155"
        fill="none"
        stroke="rgba(170,148,30,0.08)"
        strokeWidth="0.8"
        animate={{
          d: [
            'M0,160 C240,140 480,170 720,155 C960,140 1200,165 1440,155',
            'M0,155 C240,170 480,145 720,160 C960,175 1200,145 1440,160',
            'M0,160 C240,140 480,170 720,155 C960,140 1200,165 1440,155',
          ],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </motion.svg>
  </div>
)

/* ═══════════════════════════════════════════════════
   SVG WAVES — Top
   ═══════════════════════════════════════════════════ */

const WaveSVGTop = () => (
  <div className="absolute top-0 left-0 w-full z-[1] pointer-events-none overflow-hidden">
    <motion.svg
      viewBox="0 0 1440 120"
      className="absolute top-0 w-full"
      style={{ height: '120px' }}
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0,60 C200,30 400,90 600,50 C800,10 1000,80 1200,40 C1300,20 1400,60 1440,50"
        fill="none"
        stroke="rgba(163,72,42,0.08)"
        strokeWidth="1"
        animate={{
          d: [
            'M0,60 C200,30 400,90 600,50 C800,10 1000,80 1200,40 C1300,20 1400,60 1440,50',
            'M0,40 C200,70 400,20 600,60 C800,100 1000,30 1200,70 C1300,90 1400,40 1440,60',
            'M0,60 C200,30 400,90 600,50 C800,10 1000,80 1200,40 C1300,20 1400,60 1440,50',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.path
        d="M0,80 C300,50 500,100 700,70 C900,40 1100,90 1440,65"
        fill="none"
        stroke="rgba(170,148,30,0.06)"
        strokeWidth="0.8"
        animate={{
          d: [
            'M0,80 C300,50 500,100 700,70 C900,40 1100,90 1440,65',
            'M0,50 C300,80 500,40 700,80 C900,110 1100,50 1440,80',
            'M0,80 C300,50 500,100 700,70 C900,40 1100,90 1440,65',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </motion.svg>
  </div>
)

/* ═══════════════════════════════════════════════════
   WAVE PARTICLES
   ═══════════════════════════════════════════════════ */

const WaveParticles = () => {
  const particles = [
    { x: '10%', y: '70%', size: 4, delay: 0, duration: 6, color: 'rgba(163,72,42,0.25)' },
    { x: '25%', y: '75%', size: 3, delay: 1, duration: 5, color: 'rgba(170,148,30,0.2)' },
    { x: '40%', y: '68%', size: 5, delay: 0.5, duration: 7, color: 'rgba(42,22,14,0.15)' },
    { x: '55%', y: '72%', size: 3, delay: 2, duration: 5.5, color: 'rgba(163,72,42,0.2)' },
    { x: '70%', y: '76%', size: 4, delay: 1.5, duration: 6.5, color: 'rgba(170,148,30,0.25)' },
    { x: '85%', y: '69%', size: 3, delay: 0.8, duration: 5, color: 'rgba(42,22,14,0.18)' },
    { x: '15%', y: '65%', size: 2, delay: 3, duration: 8, color: 'rgba(163,72,42,0.15)' },
    { x: '60%', y: '80%', size: 2, delay: 2.5, duration: 7, color: 'rgba(170,148,30,0.15)' },
    { x: '90%', y: '73%', size: 3, delay: 1.2, duration: 6, color: 'rgba(163,72,42,0.2)' },
    { x: '35%', y: '78%', size: 2, delay: 3.5, duration: 5.5, color: 'rgba(42,22,14,0.12)' },
  ]

  return (
    <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -30, -15, -40, 0],
            x: [0, 10, -5, 8, 0],
            opacity: [0.3, 0.8, 0.5, 0.9, 0.3],
            scale: [1, 1.3, 1.1, 1.4, 1],
          }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════ */

const Hero = () => {
  const [videos, setVideos] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get('/hero-videos')
        setVideos(res.data.data || [])
      } catch (err) {
        console.error('Failed to load hero videos', err)
      }
    }
    fetchVideos()
  }, [])

  const handleVideoEnd = () => {
    if (videos.length > 1) {
      setCurrentIdx((prev) => (prev + 1) % videos.length)
    }
  }

  const currentVideo = videos[currentIdx]

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-cream-100 via-cream-50 to-white">

      <WaveCanvas />
      <WaveSVGTop />
      <WaveSVGBottom />
      <WaveParticles />

      {/* SVG noise filter */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <filter id="warm-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.14  0 0 0 0 0.07  0 0 0 0 0.04  0 0 0 0.3 0" />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-0">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── LEFT ── */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-6"
            >
              <HiOutlineSparkles className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium text-primary-700">Handcrafted with Love</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-chocolate-900 leading-tight mb-6"
            >
              Where{' '}
              <span
                className="inline-block"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #2a160e 0%, #a3482a 20%, #aa941e 42%, #cf6f4d 58%, #a3482a 80%, #2a160e 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                  filter: 'url(#warm-noise)',
                  animation: 'shiny 6s linear infinite',
                }}
              >
                Art
              </span>
              <br />
              Meets{' '}
              <TypeAnimation
                sequence={['Chocolate', 3000, 'Sweetness', 3000, 'Elegance', 3000, 'Joy', 3000]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="text-chocolate-700"
              />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-chocolate-600 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Discover our exquisite collection of handcrafted chocolates and stunning artwork. Each
              piece is a celebration of creativity and the finest ingredients.
            </motion.p>

            {/* ── CTA BUTTONS ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/collection"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-chocolate-700 to-chocolate-900 text-white font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                Explore Collection
                <HiOutlineArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/workshops"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-chocolate-700 text-chocolate-800 font-semibold rounded-full shadow-xl hover:shadow-2xl hover:bg-chocolate-700 hover:text-white transition-all hover:scale-105"
              >
                Join Workshops
                <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-cream-200"
            >
             
            </motion.div>
          </motion.div>

          {/* ── RIGHT ── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10"
              >
                <div className="aspect-square rounded-3xl overflow-hidden shadow-elegant-lg bg-gradient-to-br from-chocolate-700 to-chocolate-900 p-8">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-chocolate-700 to-chocolate-900 flex items-center justify-center relative overflow-hidden">                    {currentVideo ? (
                    <>
                      {/* 🎬 VIDEO REPLACES THE STATIC CARD CONTENT */}
                      <video
                        key={currentVideo._id}
                        src={currentVideo.videoUrl}
                        poster={currentVideo.thumbnail}
                        autoPlay
                        muted
                        playsInline
                        loop={videos.length === 1}
                        onEnded={handleVideoEnd}
                        className="absolute inset-0 w-full h-full object-cover"
                      />

                      {/* Video indicators (only if multiple videos) */}
                      {videos.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                          {videos.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentIdx(i)}
                              className={`h-1.5 rounded-full transition-all ${i === currentIdx ? 'w-8 bg-gold-400' : 'w-4 bg-white/50'
                                }`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Fallback: Original animated card when no video uploaded */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                          className="w-64 h-64 border border-gold-500/30 rounded-full"
                        />
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                          className="absolute w-48 h-48 border border-primary-500/30 rounded-full"
                        />
                      </div>
                      <div className="text-center z-10">
                        <p className="text-gold-400 font-script text-5xl mb-2">TheRawCanvas</p>
                        <p className="text-white font-heading text-4xl font-bold">Studio</p>
                      </div>
                    </>
                  )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl shadow-gold flex items-center justify-center"
              >
                <span className="text-3xl">🍫</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl shadow-lg flex items-center justify-center"
              >
                <span className="text-2xl">🎨</span>
              </motion.div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-primary-300/30 to-gold-300/30 rounded-full blur-3xl -z-10" />
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-sm text-chocolate-400">Scroll Down</span>
          <div className="w-6 h-10 border-2 border-chocolate-300 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-chocolate-400 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>

    </section>
  )
}

export default Hero