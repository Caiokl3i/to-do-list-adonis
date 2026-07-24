import { api, setToken } from './client'
import type { AuthResponse, User } from './types'

/** POST /api/v1/auth/signup → NewAccountController.store */
export async function signup(input: {
  fullName: string | null
  email: string
  password: string
  passwordConfirmation: string
}) {
  const data = await api<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: input,
    auth: false,
  })
  setToken(data.token)
  return data
}

/** POST /api/v1/auth/login → AccessTokensController.store */
export async function login(input: { email: string; password: string }) {
  const data = await api<AuthResponse>('/auth/login', {
    method: 'POST',
    body: input,
    auth: false,
  })
  setToken(data.token)
  return data
}

/** POST /api/v1/account/logout → AccessTokensController.destroy */
export async function logout() {
  try {
    await api<{ message: string }>('/account/logout', { method: 'POST' })
  } finally {
    setToken(null)
  }
}

/** GET /api/v1/account/profile → ProfileController.show */
export async function getProfile() {
  return api<User>('/account/profile')
}
