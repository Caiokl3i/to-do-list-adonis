/** Tipos espelhando o que o Adonis devolve via transformers. */

export type User = {
  id: number
  fullName: string | null
  email: string
  createdAt?: string
  updatedAt?: string | null
  initials?: string
}

export type Todo = {
  id: number
  title: string
  description: string | null
  completed: boolean | 0 | 1
  createdAt?: string
  updatedAt?: string | null
}

export type AuthResponse = {
  user: User
  token: string
}

export type ApiErrorBody = {
  message?: string
  errors?: Array<{ message: string; field?: string; rule?: string }>
}
