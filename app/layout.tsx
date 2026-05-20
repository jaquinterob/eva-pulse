import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import AppVersion from '@/components/ui/AppVersion'
import './globals.css'

export const metadata: Metadata = {
  title: 'Eva Pulse',
  description: 'Aplicación monolítica con Next.js y TypeScript',
  icons: {
    icon: '/icon',
    shortcut: '/icon',
    apple: '/icon',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('eva-pulse-theme');var t=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(t);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <AppVersion />
        </ThemeProvider>
      </body>
    </html>
  )
}

