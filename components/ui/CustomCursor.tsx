'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('ontouchstart' in window) return

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`
      }
    }

    window.addEventListener('mousemove', onMove)

    let rafId: number
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const animate = () => {
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12)
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12)
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px)`
      }
      rafId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 12,
          height: 12,
          background: '#dc2626',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'opacity 0.2s',
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          border: '1.5px solid #dc2626',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          opacity: 0.5,
        }}
      />
    </>
  )
}
