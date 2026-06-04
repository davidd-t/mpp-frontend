import { useEffect, useRef } from 'react'

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleResize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Set initial size
    handleResize()

    interface ParticleInstance {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      update: () => void
      draw: () => void
    }

    const particles: ParticleInstance[] = []
    const particleCount = 70 // balanced for premium look and high performance

    class Particle implements ParticleInstance {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * window.innerWidth
        this.y = Math.random() * window.innerHeight
        this.size = Math.random() * 2.5 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.35
        this.speedY = (Math.random() - 0.5) * 0.35
        // Premium tech palette matching futuristic dashboard (cyan, purple, blue)
        const colors = [
          `rgba(6, 182, 212, ${Math.random() * 0.3 + 0.15})`, // Cyan-500
          `rgba(168, 85, 247, ${Math.random() * 0.3 + 0.15})`, // Purple-500
          `rgba(59, 130, 246, ${Math.random() * 0.3 + 0.15})`   // Blue-500
        ]
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        // Wrap around borders
        if (this.x > window.innerWidth) this.x = 0
        if (this.x < 0) this.x = window.innerWidth
        if (this.y > window.innerHeight) this.y = 0
        if (this.y < 0) this.y = window.innerHeight
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    let animationFrameId: number

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const particle of particles) {
        particle.update()
        particle.draw()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none opacity-40 z-0"
    />
  )
}
