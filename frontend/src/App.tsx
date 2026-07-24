import { AuthProvider, useAuth } from './auth/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { TodosPage } from './pages/TodosPage'

function Gate() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return <div className="loading-screen">Conectando com a API…</div>
  }

  return isAuthenticated ? <TodosPage /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
