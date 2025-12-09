/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    instrumentationHook: true,
  },
  // Configuración para reducir uso de memoria
  swcMinify: true,
  // Deshabilitar algunas optimizaciones pesadas durante el build
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig

