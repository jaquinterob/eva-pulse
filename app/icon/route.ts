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
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop stopColor="#667eea" />
      <stop offset="1" stopColor="#764ba2" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#gradient)" />
  <path
    d="M6 16h3l1.5-6 3 12 1.5-6h3"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

