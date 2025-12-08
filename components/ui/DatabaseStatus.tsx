'use client'

import { useEffect, useState } from 'react'

interface DatabaseStatusResponse {
  status: 'connected' | 'disconnected' | 'error'
  connected: boolean
  message: string
  timestamp: string
}

export default function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        const response = await fetch('/api/db/status')
        const data: DatabaseStatusResponse = await response.json()
        setStatus(data)
      } catch (error) {
        setStatus({
          status: 'error',
          connected: false,
          message: 'Error al verificar el estado de la base de datos',
          timestamp: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }

    checkDatabaseStatus()
    // Verificar cada 5 segundos
    const interval = setInterval(checkDatabaseStatus, 5000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div
        style={{
          padding: '0.75rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: 'var(--primary-foreground)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.5)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        Verificando conexión...
      </div>
    )
  }

  const isConnected = status?.connected ?? false

  return (
    <div
      style={{
        padding: '0.75rem 1.5rem',
        background: isConnected 
          ? 'var(--muted)' 
          : 'var(--muted)',
        borderRadius: '8px',
        border: `1px solid ${isConnected ? 'var(--primary)' : 'var(--border)'}`,
        color: 'var(--foreground)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 500,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: isConnected ? 'var(--primary)' : 'var(--muted-foreground)',
          boxShadow: isConnected 
            ? '0 0 8px rgba(0, 0, 0, 0.2)' 
            : '0 0 8px rgba(0, 0, 0, 0.1)',
        }}
      />
      {isConnected ? '✓ Base de datos conectada' : '✗ Base de datos desconectada'}
    </div>
  )
}


