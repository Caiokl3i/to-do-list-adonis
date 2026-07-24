# To-do List — API em AdonisJS

Projeto de estudo para aprender a criar uma **API REST com AdonisJS**: autenticação com access tokens, validação, models Lucid, transformers e um CRUD de tarefas com ownership (cada usuário só acessa as próprias todos).

Inclui um frontend React (**Linha**) só para exercitar a integração front ↔ API — o foco do repositório é o backend.

## O que você aprende aqui

- Rotas em grupos (`/api/v1`) + middleware `auth`
- Signup / login / logout com **access tokens** (Bearer)
- Validators com Vine (`create` vs `update`)
- Models Lucid + relações `hasMany` / `belongsTo`
- Controllers CRUD com ownership via `user.related('todos')`
- Transformers para formatar a resposta JSON
- Migrations (SQLite) e foreign keys
- Consumir a API com `fetch` + token no frontend

Guia detalhado do aprendizado: [`GUIA-ADONIS.md`](./GUIA-ADONIS.md)

## Stack

| Camada | Tecnologia |
|---|---|
| API | AdonisJS 7, Lucid, Vine, Access Tokens |
| Banco | SQLite (`better-sqlite3`) |
| Frontend (opcional) | React + Vite + TypeScript |

## Funcionalidades

**Auth**

- `POST /api/v1/auth/signup` — criar conta + token
- `POST /api/v1/auth/login` — login + token
- `GET /api/v1/account/profile` — perfil (autenticado)
- `POST /api/v1/account/logout` — invalidar token

**Todos** (todas autenticadas)

- `GET /api/v1/todos` — listar
- `POST /api/v1/todos` — criar
- `GET /api/v1/todos/:id` — detalhe
- `PUT /api/v1/todos/:id` — atualizar
- `DELETE /api/v1/todos/:id` — apagar

Se o `:id` for de outro usuário, a API responde **404** (ownership pela relação).

## Como rodar

### Pré-requisitos

- Node.js 20+
- npm

### API

```bash
npm install
cp .env.example .env
# gere uma APP_KEY se necessário: node ace generate:key
node ace migration:run
npm run dev
```

API em [http://localhost:3333](http://localhost:3333).

### Frontend (opcional)

```bash
cd frontend
npm install
npm run dev
```

UI em [http://localhost:5173](http://localhost:5173). O Vite faz proxy de `/api` → `:3333`.

Detalhes do front: [`frontend/README.md`](./frontend/README.md)

## Exemplo rápido (auth)

```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "fullName": "Caio",
  "email": "caio@example.com",
  "password": "senha12345",
  "passwordConfirmation": "senha12345"
}
```

Nas rotas protegidas:

```http
Authorization: Bearer <token>
```

## Estrutura (visão geral)

```
app/
  controllers/     # HTTP → regras de negócio
  models/          # Lucid (User, Todo)
  validators/      # Vine
  transformers/    # JSON público
database/
  migrations/      # schema
frontend/          # React para testar a API
start/
  routes.ts        # rotas /api/v1
GUIA-ADONIS.md     # passo a passo do estudo
```

## Licença

MIT
