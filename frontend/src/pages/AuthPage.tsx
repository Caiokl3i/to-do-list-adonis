import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { formatApiError } from '../api/client'

type Mode = 'login' | 'signup'

export function AuthPage() {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signup(fullName, email, password)
      }
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-hero fade-up">
        <div className="brand-mark">
          <span className="brand-dot" aria-hidden />
        </div>
        <h1 className="brand">Linha</h1>
        <p>Organize o dia com uma API Adonis de verdade — o mesmo fluxo do Postman, agora na interface.</p>
      </section>

      <section className="auth-panel fade-up-delay">
        <div className="tabs" role="tablist" aria-label="Autenticação">
          <button
            type="button"
            className={`tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Criar conta
          </button>
        </div>

        <h2>{mode === 'login' ? 'Bem-vindo de volta' : 'Comece agora'}</h2>
        <p className="lead">
          {mode === 'login'
            ? 'Chama POST /api/v1/auth/login e guarda o token.'
            : 'Chama POST /api/v1/auth/signup e já autentica.'}
        </p>

        <form className="stack" onSubmit={onSubmit}>
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="fullName">Nome</label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Opcional"
                autoComplete="name"
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Enviando…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="hint">
          Backend em <code>localhost:3333</code> · frontend em <code>localhost:5173</code>
        </p>
      </section>
    </div>
  )
}
