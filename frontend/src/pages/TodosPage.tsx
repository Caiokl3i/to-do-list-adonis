import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { formatApiError } from '../api/client'
import * as todosApi from '../api/todos'
import type { Todo } from '../api/types'

export function TodosPage() {
  const { user, logout } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await todosApi.listTodos()
      setTodos(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function onCreate(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    setError(null)
    try {
      const todo = await todosApi.createTodo({
        title: title.trim(),
        description: description.trim() || null,
      })
      setTodos((prev) => [todo, ...prev])
      setTitle('')
      setDescription('')
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setCreating(false)
    }
  }

  async function toggleCompleted(todo: Todo) {
    setBusyId(todo.id)
    setError(null)
    try {
      const updated = await todosApi.updateTodo(todo.id, {
        completed: !Boolean(todo.completed),
      })
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)))
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setBusyId(null)
    }
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id)
    setEditTitle(todo.title)
    setEditDescription(todo.description ?? '')
  }

  async function saveEdit(id: number) {
    setBusyId(id)
    setError(null)
    try {
      const updated = await todosApi.updateTodo(id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      })
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
      setEditingId(null)
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setBusyId(null)
    }
  }

  async function onDelete(id: number) {
    setBusyId(id)
    setError(null)
    try {
      await todosApi.deleteTodo(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
      if (editingId === id) setEditingId(null)
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setBusyId(null)
    }
  }

  async function onLogout() {
    try {
      await logout()
    } catch {
      // token já é limpo no AuthContext/api
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar row-between">
        <div className="brand-mark">
          <span className="brand-dot" aria-hidden />
          <span className="brand">Linha</span>
        </div>

        <div className="row">
          <div className="user-chip">
            <span className="avatar">{user?.initials ?? user?.email?.slice(0, 2).toUpperCase()}</span>
            <span>{user?.fullName || user?.email}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void onLogout()}>
            Sair
          </button>
        </div>
      </header>

      <form className="composer" onSubmit={onCreate}>
        <div className="field">
          <label htmlFor="title">Nova tarefa</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="O que precisa ser feito?"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="description">Descrição</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div className="composer-actions">
          <button className="btn btn-primary" type="submit" disabled={creating}>
            {creating ? 'Criando…' : 'Adicionar'}
          </button>
        </div>
      </form>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <p className="muted fade-up">Carregando suas tarefas…</p>
      ) : todos.length === 0 ? (
        <div className="empty">
          <strong>Nada por aqui</strong>
          Crie a primeira tarefa acima — ela nasce via <code>POST /todos</code>.
        </div>
      ) : (
        <ul className="todo-list">
          {todos.map((todo, index) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <button
                type="button"
                className="check"
                aria-label={todo.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
                aria-checked={Boolean(todo.completed)}
                disabled={busyId === todo.id}
                onClick={() => void toggleCompleted(todo)}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                  <path
                    d="M2.2 6.2 4.8 8.8 9.8 3.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div>
                {editingId === todo.id ? (
                  <div className="edit-panel">
                    <div className="field">
                      <label htmlFor={`edit-title-${todo.id}`}>Título</label>
                      <input
                        id={`edit-title-${todo.id}`}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`edit-desc-${todo.id}`}>Descrição</label>
                      <textarea
                        id={`edit-desc-${todo.id}`}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div className="row" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={busyId === todo.id}
                        onClick={() => void saveEdit(todo.id)}
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="todo-title">{todo.title}</p>
                    {todo.description && <p className="todo-desc">{todo.description}</p>}
                  </>
                )}
              </div>

              {editingId !== todo.id && (
                <div className="todo-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => startEdit(todo)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={busyId === todo.id}
                    onClick={() => void onDelete(todo.id)}
                  >
                    Apagar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
