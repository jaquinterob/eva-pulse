'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function Home() {
  const router = useRouter()
  const { login, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState<{
    username?: string
    password?: string
    general?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function validateForm(): boolean {
    const newErrors: typeof errors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    const result = await login(formData.username, formData.password)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setErrors({ general: result.error || 'Error al iniciar sesión' })
    }

    setIsSubmitting(false)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: `linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)`,
        color: 'var(--primary-foreground)',
        position: 'relative',
      }}
    >
      {/* Theme toggle en la esquina superior derecha */}
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
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
          background: 'var(--card)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
        }}
      >
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: 'var(--foreground)',
            textAlign: 'center',
          }}
        >
          Eva Pulse
        </h1>
        <p
          style={{
            marginBottom: '2rem',
            color: 'var(--muted-foreground)',
            textAlign: 'center',
          }}
        >
          Ingresa tus credenciales para continuar
        </p>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div
              style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                background: 'var(--muted)',
                border: '1px solid var(--destructive)',
                borderRadius: '8px',
                color: 'var(--destructive)',
                fontSize: '0.875rem',
              }}
            >
              {errors.general}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="username"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--foreground)',
              }}
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.username ? 'var(--destructive)' : 'var(--border)'}`,
                borderRadius: '8px',
                background: 'var(--background)',
                color: 'var(--foreground)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.username ? 'var(--destructive)' : 'var(--border)'
              }}
              disabled={isSubmitting || isLoading}
            />
            {errors.username && (
              <p
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--destructive)',
                }}
              >
                {errors.username}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--foreground)',
              }}
            >
              Contraseña
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: '3rem',
                  border: `1px solid ${errors.password ? 'var(--destructive)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.password ? 'var(--destructive)' : 'var(--border)'
                }}
                disabled={isSubmitting || isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--muted-foreground)',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--foreground)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--muted-foreground)'
                }}
                disabled={isSubmitting || isLoading}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--destructive)',
                }}
              >
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: isSubmitting || isLoading ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || isLoading ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'var(--muted)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: 'var(--muted-foreground)',
            textAlign: 'center',
          }}
        >
          <strong>Desarrollo:</strong> Usuario: <code>dev</code> / Contraseña:{' '}
          <code>dev</code>
        </div>
      </div>
    </main>
  )
}

