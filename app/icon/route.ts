import { NextResponse } from 'next/server'

export async function GET() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg
  width="32"
  height="32"
  viewBox="0 0 32 32"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <!-- Punto con Onda: círculos concéntricos que se expanden desde el centro, sin fondo -->
  <circle cx="16" cy="16" r="8" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.5" />
  <circle cx="16" cy="16" r="5" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.7" />
  <circle cx="16" cy="16" r="3" fill="#10b981" opacity="1" />
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

