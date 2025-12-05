'use client'

import { useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  username: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

const AUTH_STORAGE_KEY = 'eva-pulse-auth'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    loadAuthFromStorage()
  }, [])

  function loadAuthFromStorage() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (stored) {
        const { token, user } = JSON.parse(stored)
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        })
        verifyToken(token)
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      }
    } catch {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  async function verifyToken(token: string) {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Token inválido')
      }

      const data = await response.json()
      if (data.success && data.data) {
        setAuthState({
          user: data.data,
          token,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        throw new Error('Token inválido')
      }
    } catch {
      logout()
    }
  }

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      const { token, user } = data.data

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }))

      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al iniciar sesión',
      }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.clear()
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }, [])

  return {
    ...authState,
    login,
    logout,
  }
}

