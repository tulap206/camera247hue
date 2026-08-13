'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

export default function Reveal({ children, className = '', delay = 0, y = 20 }: RevealProps) {
  const reduce = useReducedMotion()
  const [useMotion, setUseMotion] = useState(false)

  useEffect(() => {
    if (reduce) return
    const desktop = window.matchMedia('(min-width: 768px)').matches
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    setUseMotion(desktop && finePointer)
  }, [reduce])

  if (!useMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
