import { api } from './client'
import type { Todo } from './types'

/** GET /api/v1/todos → TodosController.index */
export function listTodos() {
  return api<Todo[]>('/todos')
}

/** POST /api/v1/todos → TodosController.store */
export function createTodo(input: { title: string; description?: string | null }) {
  return api<Todo>('/todos', { method: 'POST', body: input })
}

/** GET /api/v1/todos/:id → TodosController.show */
export function getTodo(id: number) {
  return api<Todo>(`/todos/${id}`)
}

/** PUT /api/v1/todos/:id → TodosController.update */
export function updateTodo(
  id: number,
  input: { title?: string; description?: string | null; completed?: boolean },
) {
  return api<Todo>(`/todos/${id}`, { method: 'PUT', body: input })
}

/** DELETE /api/v1/todos/:id → TodosController.destroy */
export function deleteTodo(id: number) {
  return api<{ message: string }>(`/todos/${id}`, { method: 'DELETE' })
}
