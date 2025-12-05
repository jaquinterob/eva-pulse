'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'
import DatabaseStatus from '@/components/ui/DatabaseStatus'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Home() {
  const router = useRouter()
  const { user, logout, isAuthenticated, login, isLoading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
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

  function handleLogout() {
    logout()
    setShowLogin(false)
  }

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
      setShowLogin(false)
      setFormData({ username: '', password: '' })
      setErrors({})
      router.push('/dashboard')
    } else {
      setErrors({ general: result.error || 'Error al iniciar sesión' })
    }

    setIsSubmitting(false)
  }

  return (
    <>
      {showLogin && !isAuthenticated && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setShowLogin(false)}
        />
      )}
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
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        {isAuthenticated && user && (
          <>
            <div
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'var(--primary-foreground)',
                fontSize: '0.875rem',
              }}
            >
              {user.username}
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'var(--primary-foreground)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              Cerrar Sesión
            </button>
          </>
        )}
        {!isAuthenticated && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLogin(!showLogin)}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'var(--primary-foreground)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              Iniciar Sesión
            </button>
            {showLogin && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  right: 0,
                  width: '320px',
                  padding: '1.5rem',
                  background: 'var(--input)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                  zIndex: 1000,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    color: 'var(--foreground)',
                    textAlign: 'center',
                  }}
                >
                  Iniciar Sesión
                </h2>
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

                  <div style={{ marginBottom: '1rem' }}>
                    <label
                      htmlFor="login-username"
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
                      id="login-username"
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: `1px solid ${errors.username ? 'var(--destructive)' : 'var(--input)'}`,
                        borderRadius: '6px',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                        fontSize: '0.875rem',
                      }}
                      disabled={isSubmitting || isLoading}
                    />
                    {errors.username && (
                      <p
                        style={{
                          marginTop: '0.25rem',
                          fontSize: '0.75rem',
                          color: 'var(--destructive)',
                        }}
                      >
                        {errors.username}
                      </p>
                    )}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label
                      htmlFor="login-password"
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
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          paddingRight: '2.5rem',
                          border: `1px solid ${errors.password ? 'var(--destructive)' : 'var(--input)'}`,
                          borderRadius: '6px',
                          background: 'var(--background)',
                          color: 'var(--foreground)',
                          fontSize: '0.875rem',
                        }}
                        disabled={isSubmitting || isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.5rem',
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
                        disabled={isSubmitting || isLoading}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? (
                          <svg
                            width="16"
                            height="16"
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
                            width="16"
                            height="16"
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
                          marginTop: '0.25rem',
                          fontSize: '0.75rem',
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
                      padding: '0.5rem',
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: isSubmitting || isLoading ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting || isLoading ? 0.6 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
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
          Plataforma de rastreo y análisis de evaluaciones y comportamiento de usuarios
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
            maxWidth: '700px',
            margin: '0 auto',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '2rem',
          }}
        >
          <p
            style={{
              fontSize: '1rem',
              lineHeight: '1.8',
              color: 'var(--primary-foreground)',
              opacity: 0.95,
              textAlign: 'justify',
              margin: 0,
            }}
          >
            Eva Pulse es una plataforma integral diseñada para ayudar a Eva a controlar y gestionar sus usuarios, 
            realizar un seguimiento completo de todas las evaluaciones y monitorear el comportamiento de los usuarios en tiempo real. 
            La plataforma proporciona tracking de eventos con registro completo de todas las interacciones y eventos de los usuarios, 
            gestión de usuarios con control centralizado de usuarios y sus permisos, análisis de evaluaciones con seguimiento detallado 
            del rendimiento y resultados de evaluaciones, y monitoreo de comportamiento con análisis en tiempo real del comportamiento de los usuarios. 
            Al utilizar esta plataforma, aceptas que todos los datos y eventos sean rastreados para mejorar la experiencia y el análisis de evaluaciones. 
            Los datos se manejan de forma segura y confidencial.
          </p>
        </div>
      </div>
    </main>
    </>
  )
}

