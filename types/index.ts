export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  timestamp?: string
}

export interface HealthCheckResponse {
  status: string
  message: string
  timestamp: string
}

