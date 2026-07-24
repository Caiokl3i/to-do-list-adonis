import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '../api/auth'
import { getToken, setToken, ApiError } from '../api/client'
import type { User } from '../api/types'

type AuthContextValue = {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Ao abrir o app: se houver token salvo, busca o profile no Adonis
  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const profile = await authApi.getProfile()
        if (!cancelled) setUser(profile)
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          setToken(null)
        }
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    setUser(data.user)
  }, [])

  const signup = useCallback(async (fullName: string, email: string, password: string) => {
    const data = await authApi.signup({
      fullName: fullName.trim() || null,
      email,
      password,
      passwordConfirmation: password,
    })
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
    }),
    [user, loading, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
