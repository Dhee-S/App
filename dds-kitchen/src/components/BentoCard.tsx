'use client'

import { cn } from '@/utils/cn'
import { useRef, useState } from 'react'

export function BentoCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return

    const div = divRef.current
    const rect = div.getBoundingClientRect()

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      style={{
        '--mouse-x': `${position.x}px`,
        '--mouse-y': `${position.y}px`,
      } as React.CSSProperties}
      className={cn(
        'bg-white rounded-2xl p-6 border border-gray-100 shadow-md spotlight-card transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
