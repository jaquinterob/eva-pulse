'use client'

interface EvaPulseIconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function EvaPulseIcon({ 
  size = 24, 
  className = '',
  style = {} 
}: EvaPulseIconProps) {
  // Generar un ID único para evitar conflictos de gradientes
  const gradientId = `evaPulseGradient-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style,
      }}
    >
      {/* Punto con Onda: círculos concéntricos que se expanden desde el centro, sin fondo */}
      <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
      <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="16" cy="16" r="3" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

