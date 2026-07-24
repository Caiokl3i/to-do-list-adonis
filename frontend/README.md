# Frontend — Linha

Interface React para testar a API Adonis do to-do-list.

## Como rodar

Em dois terminais:

```bash
# 1) Backend Adonis (na raiz do projeto)
npm run dev

# 2) Frontend
cd frontend
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173).

O Vite faz **proxy** de `/api` → `http://localhost:3333`, então o browser chama a mesma origem e o Adonis recebe as requests.

## O que cada tela faz

| UI | Request | Controller Adonis |
|---|---|---|
| Criar conta | `POST /api/v1/auth/signup` | `NewAccountController.store` |
| Entrar | `POST /api/v1/auth/login` | `AccessTokensController.store` |
| Sair | `POST /api/v1/account/logout` | `AccessTokensController.destroy` |
| Listar | `GET /api/v1/todos` | `TodosController.index` |
| Criar | `POST /api/v1/todos` | `TodosController.store` |
| Concluir / editar | `PUT /api/v1/todos/:id` | `TodosController.update` |
| Apagar | `DELETE /api/v1/todos/:id` | `TodosController.destroy` |

O token fica em `localStorage` (`linha_token`) e vai no header:

```http
Authorization: Bearer <token>
```

## Estrutura

```
src/
  api/          → client HTTP + chamadas tipadas (espelha o Postman)
  auth/         → contexto de sessão (token + user)
  pages/        → AuthPage e TodosPage
```

Leia `src/api/client.ts` e `src/api/todos.ts` para ver a integração linha a linha.
