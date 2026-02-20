'use client'

import { useEffect, useRef, useState } from 'react'

interface RevealOnScrollProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'none'
  id?: string
}

export default function RevealOnScroll({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  id,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const getTransform = () => {
    if (direction === 'up') return 'translateY(40px)'
    if (direction === 'left') return 'translateX(-40px)'
    if (direction === 'right') return 'translateX(40px)'
    return 'none'
  }

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0,0)' : getTransform(),
        transition: `opacity 600ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 600ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
