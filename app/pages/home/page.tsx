import { Metadata } from 'next'
import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'
import DatabaseStatus from '@/components/ui/DatabaseStatus'

export const metadata: Metadata = {
  title: 'Inicio - Eva Pulse',
}

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: `linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)`,
        color: 'var(--primary-foreground)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
        }}
      >
        <ThemeToggle />
      </div>
      <div
        style={{
          textAlign: 'center',
          maxWidth: '800px',
        }}
      >
        <h1
          style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            fontWeight: 'bold',
            color: 'var(--primary-foreground)',
          }}
        >
          Eva Pulse
        </h1>
        <p
          style={{
            fontSize: '1.25rem',
            marginBottom: '2rem',
            opacity: 0.9,
            color: 'var(--primary-foreground)',
          }}
        >
          Aplicación monolítica con Next.js y TypeScript
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <DatabaseStatus />
        </div>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/api/health"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s',
              display: 'inline-block',
              color: 'var(--primary-foreground)',
            }}
          >
            Ver API Health Check
          </Link>
        </div>
      </div>
    </main>
  )
}

