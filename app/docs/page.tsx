'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function DocsPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '1rem 2rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--foreground)',
            textDecoration: 'none',
          }}
        >
          Eva Pulse
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link
            href="/dashboard"
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              textDecoration: 'none',
              color: 'var(--foreground)',
              background: 'var(--muted)',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '3rem 2rem',
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '4rem',
          }}
        >
          <h1
            style={{
              fontSize: '3rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: 'var(--foreground)',
            }}
          >
            ¿Cómo Eva Pulse ayuda a Eva IA?
          </h1>
          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--muted-foreground)',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.75',
            }}
          >
            Eva Pulse es el sistema de tracking que permite a Eva IA identificar, diagnosticar y resolver problemas de manera proactiva mediante el análisis inteligente del comportamiento de usuarios
          </p>
        </div>

        {/* Beneficios Principales */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem',
          }}
        >
          {[
            {
              icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              ),
              title: 'Detección Proactiva de Problemas',
              description: 'Eva IA analiza los eventos de tracking en tiempo real para identificar patrones anómalos, errores recurrentes y puntos de fricción antes de que los usuarios reporten problemas.',
            },
            {
              icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              ),
              title: 'Diagnóstico Inteligente',
              description: 'Con acceso a toda la información contextual de cada sesión, Eva IA puede entender exactamente qué pasó, en qué momento y bajo qué condiciones, permitiendo diagnósticos precisos.',
            },
            {
              icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              ),
              title: 'Resolución Automática',
              description: 'Eva IA puede correlacionar eventos, identificar la causa raíz de problemas y sugerir o implementar soluciones automáticamente, reduciendo el tiempo de resolución.',
            },
            {
              icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              ),
              title: 'Análisis de Tendencias',
              description: 'Al rastrear el comportamiento a lo largo del tiempo, Eva IA puede detectar tendencias, predecir problemas futuros y optimizar la experiencia del usuario de forma continua.',
            },
            {
              icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              ),
              title: 'Prevención de Errores',
              description: 'Eva IA aprende de los errores pasados y puede prevenir que ocurran nuevamente, mejorando la estabilidad y confiabilidad del sistema.',
            },
            {
              icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21h6" />
                  <path d="M12 3a6 6 0 0 0 0 12" />
                  <path d="M12 9a6 6 0 0 1 0 12" />
                  <path d="M12 3v6" />
                  <path d="M12 15v6" />
                </svg>
              ),
              title: 'Mejora Continua',
              description: 'Con datos detallados de uso, Eva IA puede identificar oportunidades de mejora, optimizar flujos y personalizar la experiencia para cada usuario.',
            },
          ].map((benefit, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  marginBottom: '1rem',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {benefit.icon}
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: 'var(--foreground)',
                }}
              >
                {benefit.title}
              </h3>
              <p
                style={{
                  fontSize: '1rem',
                  color: 'var(--muted-foreground)',
                  lineHeight: '1.75',
                }}
              >
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Casos de Uso */}
        <section
          style={{
            marginBottom: '4rem',
          }}
        >
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '2.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 600,
                marginBottom: '2rem',
                color: 'var(--foreground)',
              }}
            >
              Casos de Uso Reales
            </h2>
            <div
              style={{
                display: 'grid',
                gap: '2rem',
              }}
            >
              {[
                {
                  scenario: 'Usuario no puede completar una acción',
                  howItHelps: 'Eva IA analiza la secuencia de eventos del usuario, identifica en qué paso se quedó atascado y puede ofrecer ayuda contextual o corregir el problema automáticamente.',
                },
                {
                  scenario: 'Error recurrente en una funcionalidad',
                  howItHelps: 'Eva IA detecta el patrón de errores, analiza el contexto común (dispositivo, navegador, hora, etc.) y puede aplicar un fix preventivo o notificar al equipo de desarrollo.',
                },
                {
                  scenario: 'Caída en la tasa de conversión',
                  howItHelps: 'Eva IA compara el comportamiento actual con períodos anteriores, identifica qué cambió y sugiere optimizaciones basadas en datos reales de uso.',
                },
                {
                  scenario: 'Problema de rendimiento',
                  howItHelps: 'Eva IA correlaciona eventos lentos con características del dispositivo, conexión y carga del sistema para optimizar la experiencia según el contexto del usuario.',
                },
                {
                  scenario: 'Nuevo usuario abandonando temprano',
                  howItHelps: 'Eva IA identifica qué pasos causan confusión en nuevos usuarios y puede ofrecer guías personalizadas o simplificar el flujo para mejorar la retención.',
                },
              ].map((useCase, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1.5rem',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '0.75rem',
                      color: 'var(--primary)',
                    }}
                  >
                    {useCase.scenario}
                  </h3>
                  <p
                    style={{
                      fontSize: '1rem',
                      color: 'var(--muted-foreground)',
                      lineHeight: '1.75',
                    }}
                  >
                    <strong style={{ color: 'var(--foreground)' }}>Cómo ayuda Eva IA:</strong>{' '}
                    {useCase.howItHelps}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Flujo de Trabajo */}
        <section
          style={{
            marginBottom: '4rem',
          }}
        >
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '2.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 600,
                marginBottom: '2rem',
                color: 'var(--foreground)',
              }}
            >
              Flujo de Trabajo: De Problema a Solución
            </h2>
            <div
              style={{
                display: 'grid',
                gap: '2rem',
              }}
            >
              {[
                {
                  step: '1',
                  title: 'Tracking Continuo',
                  description: 'Eva Pulse registra cada interacción del usuario: clicks, navegación, errores, tiempos de carga y contexto completo.',
                },
                {
                  step: '2',
                  title: 'Análisis en Tiempo Real',
                  description: 'Eva IA procesa los eventos en tiempo real, identificando anomalías, patrones y correlaciones entre diferentes sesiones.',
                },
                {
                  step: '3',
                  title: 'Detección de Problemas',
                  description: 'Eva IA detecta automáticamente cuando algo no está funcionando como debería, basándose en desviaciones de comportamiento normal.',
                },
                {
                  step: '4',
                  title: 'Diagnóstico Contextual',
                  description: 'Eva IA analiza toda la información disponible (dispositivo, navegador, hora, ubicación, historial) para entender la causa raíz.',
                },
                {
                  step: '5',
                  title: 'Acción Inteligente',
                  description: 'Eva IA puede ofrecer ayuda al usuario, aplicar correcciones automáticas, o escalar el problema al equipo con información completa.',
                },
                {
                  step: '6',
                  title: 'Aprendizaje Continuo',
                  description: 'Cada problema resuelto mejora el conocimiento de Eva IA, permitiendo prevenir problemas similares en el futuro.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  style={{
                    display: 'flex',
                    gap: '1.5rem',
                    padding: '1.5rem',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      flexShrink: 0,
                    }}
                  >
                    {item.step}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: 'var(--foreground)',
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '1rem',
                        color: 'var(--muted-foreground)',
                        lineHeight: '1.75',
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ventajas Competitivas */}
        <section
          style={{
            marginBottom: '4rem',
          }}
        >
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '2.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 600,
                marginBottom: '2rem',
                color: 'var(--foreground)',
              }}
            >
              Ventajas Competitivas
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {[
                {
                  title: 'Reducción de Tiempo de Resolución',
                  value: 'Hasta 80% más rápido',
                  description: 'Los problemas se detectan y resuelven antes de que los usuarios los reporten.',
                },
                {
                  title: 'Mejora en Satisfacción',
                  value: 'Experiencia Proactiva',
                  description: 'Los usuarios reciben ayuda antes de necesitarla, mejorando significativamente su experiencia.',
                },
                {
                  title: 'Ahorro de Costos',
                  value: 'Menos Tickets de Soporte',
                  description: 'Menos problemas reportados significa menos carga en el equipo de soporte.',
                },
                {
                  title: 'Mejora Continua',
                  value: 'Optimización Constante',
                  description: 'El sistema aprende y mejora automáticamente con cada interacción.',
                },
              ].map((advantage, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1.5rem',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {advantage.value}
                  </div>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: 'var(--foreground)',
                    }}
                  >
                    {advantage.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--muted-foreground)',
                      lineHeight: '1.6',
                    }}
                  >
                    {advantage.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: 'var(--foreground)',
            }}
          >
            Eva Pulse: El Ojo de Eva IA
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--muted-foreground)',
              marginBottom: '2rem',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.75',
            }}
          >
            Sin Eva Pulse, Eva IA estaría ciega. Con Eva Pulse, Eva IA puede ver todo lo que sucede, entender el contexto completo y actuar de manera inteligente para resolver problemas antes de que afecten a los usuarios.
          </p>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            Ver Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
