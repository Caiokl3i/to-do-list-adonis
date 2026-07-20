# Guia completo: Aprendendo AdonisJS 7 com um To-Do List

Este documento foi escrito para o seu projeto `aula-gpt`: um AdonisJS **7** gerado com o **kit de API**, autenticação por **access tokens**, ORM **Lucid**, validação **Vine** e banco **SQLite**.

Objetivo: você terminar entendendo **como pensar** um backend em Adonis e conseguir implementar um **to-do list autenticado** sozinho, passo a passo.

Não precisa decorar tudo de uma vez. Use este guia como manual: leia a parte 1–4, rode o que já existe, depois siga a parte 8 (to-do) na ordem.

---

## Sumário

1. [O que é Adonis e como pensar](#1-o-que-é-adonis-e-como-pensar)
2. [O que já existe no seu projeto](#2-o-que-já-existe-no-seu-projeto)
3. [Mapa das pastas (cada uma explicada)](#3-mapa-das-pastas-cada-uma-explicada)
4. [O ciclo de uma requisição HTTP](#4-o-ciclo-de-uma-requisição-http)
5. [Conceitos centrais, mastigados](#5-conceitos-centrais-mastigados)
6. [Auth: signup, login, token e logout](#6-auth-signup-login-token-e-logout)
7. [Como pensar um projeto antes de codar](#7-como-pensar-um-projeto-antes-de-codar)
8. [Projeto prático: To-Do List (passo a passo)](#8-projeto-prático-to-do-list-passo-a-passo)
9. [Como testar com Postman / Insomnia](#9-como-testar-com-postman--insomnia)
10. [Comandos Ace que você vai usar](#10-comandos-ace-que-você-vai-usar)
11. [Armadilhas comuns](#11-armadilhas-comuns)
12. [Glossário](#12-glossário)
13. [Plano de estudo sugerido](#13-plano-de-estudo-sugerido)
14. [Próximos projetos depois do to-do](#14-próximos-projetos-depois-do-to-do)

---

## 1. O que é Adonis e como pensar

### 1.1 Em uma frase

**AdonisJS** é um framework backend em TypeScript com “baterias inclusas”: rotas, controllers, ORM, validação, auth, testes e CLI (`ace`) já organizados.

Se você já viu Laravel (PHP) ou NestJS (Node), a sensação é parecida: pastas com responsabilidade clara e um jeito padrão de fazer as coisas.

### 1.2 O que Adonis **não** é

- Não é um frontend (React/Vue). Seu kit é **API JSON**.
- Não é um banco de dados. Ele **fala com** o banco (no seu caso, SQLite).
- Não “mágica”: cada request passa por código que você pode ler (`routes` → `middleware` → `controller`).

### 1.3 A metáfora certa

Imagine um restaurante:

| Restaurante | Adonis |
|---|---|
| Cliente pede | Requisição HTTP |
| Segurança na porta | Middleware (auth, CORS…) |
| Cardápio | Rotas |
| Garçom/cozinheiro | Controller |
| Receita / regras | Validator + Model |
| Despensa | Banco de dados (Lucid) |
| Prato servido | JSON (Transformer) |

Você não começa “fazendo o site bonito”. Você começa definindo:

1. Quais recursos existem? (`User`, depois `Todo`)
2. Quais ações? (criar, listar, editar, apagar)
3. Quem pode fazer o quê? (só logado; só o dono do todo)

### 1.4 API vs Web no Adonis

O Adonis oferece kits diferentes. O seu é **API**:

- Respostas em JSON
- Auth por **Bearer token** (access tokens)
- Sem Edge (template HTML) como foco

Isso é ótimo para projetos pessoais modernos: depois você pluga React, mobile, etc. na mesma API.

---

## 2. O que já existe no seu projeto

Você **não** está começando do absoluto zero. O starter já deixou autenticação pronta.

### 2.1 Rotas atuais (`start/routes.ts`)

```
GET  /                     → { hello: 'world' }  (smoke test)
POST /api/v1/auth/signup   → cria conta + devolve token
POST /api/v1/auth/login    → login + devolve token
GET  /api/v1/account/profile → perfil (precisa token)
POST /api/v1/account/logout  → invalida token (precisa token)
```

### 2.2 Arquivos importantes já criados

| Arquivo | Função |
|---|---|
| `app/models/user.ts` | Model do usuário + access tokens |
| `app/controllers/new_account_controller.ts` | Signup |
| `app/controllers/access_tokens_controller.ts` | Login e logout |
| `app/controllers/profile_controller.ts` | Perfil autenticado |
| `app/validators/user.ts` | Validação de signup/login |
| `app/transformers/user_transformer.ts` | Formato seguro do user na resposta |
| `app/middleware/auth_middleware.ts` | Bloqueia quem não está autenticado |
| `database/migrations/..._create_users_table.ts` | Tabela `users` |
| `database/migrations/..._create_access_tokens_table.ts` | Tabela de tokens |
| `tmp/db.sqlite3` | Seu banco SQLite local |

### 2.3 Stack do `package.json` (o que cada peça faz)

| Pacote | Para quê |
|---|---|
| `@adonisjs/core` | Coração do framework (HTTP, app, transformers…) |
| `@adonisjs/lucid` | ORM (models, migrations, queries) |
| `@adonisjs/auth` | Login, tokens, guards |
| `@adonisjs/cors` | Permite frontend em outra origem chamar a API |
| `@adonisjs/session` / `@adonisjs/shield` | Sessão e proteções (CSRF etc.; no kit API o foco principal ainda é token) |
| `@vinejs/vine` | Validação de dados de entrada |
| `better-sqlite3` | Driver do SQLite |
| `luxon` | Datas tipadas (`DateTime`) |
| `@japa/*` | Testes |

### 2.4 Imports com `#` (aliases)

No `package.json`, você vê coisas como:

```json
"#models/*": "./app/models/*.js",
"#controllers/*": "./app/controllers/*.js"
```

Por isso o código escreve:

```ts
import User from '#models/user'
```

em vez de `../../../models/user`. É só um atalho limpo. O `.js` no mapa é normal em projetos TypeScript ESM: o runtime resolve o arquivo compilado/transpilado.

---

## 3. Mapa das pastas (cada uma explicada)

```
aula-gpt/
├── app/                  → código da sua aplicação
│   ├── controllers/      → recebe request, orquestra resposta
│   ├── models/           → tabelas + lógica de domínio
│   ├── validators/       → regras do body/query
│   ├── transformers/     → o que o cliente pode ver no JSON
│   ├── middleware/       → filtros do request
│   └── exceptions/       → como erros viram resposta HTTP
├── start/                → “liga” a app (rotas, kernel, env)
├── config/               → configurações (db, auth, cors…)
├── database/
│   ├── migrations/       → histórico do schema do banco
│   ├── schema.ts         → GERADO — não edite na mão
│   └── schema_rules.ts   → regras extras de geração de schema
├── providers/            → registra serviços no boot
├── tests/                → testes automatizados
├── bin/                  → entrypoints (server, console, test)
├── tmp/                  → arquivos locais (ex.: db.sqlite3)
├── .adonisjs/            → código gerado (controllers index, types…)
├── adonisrc.ts           → config “raiz” do Adonis
├── ace.js                → CLI
└── package.json
```

### 3.1 `app/controllers/`

**O que é:** classes com métodos que tratam endpoints.

**Analogia:** o “garçom” — recebe o pedido, valida, chama a cozinha (model), devolve o prato.

**Regra de ouro:** controller fino.

Bom:

1. Validar
2. Buscar/criar no model
3. Serializar e retornar

Ruim:

- SQL gigante misturado
- Regra de negócio espalhada em 5 arquivos sem necessidade (no começo, um controller por recurso basta)

### 3.2 `app/models/`

**O que é:** representação de uma tabela + métodos do domínio.

Exemplo: `User` sabe criar access tokens, verificar senha, calcular `initials`.

Models **não** devem cuidar de HTTP (status code, headers). Isso é do controller.

### 3.3 `app/validators/`

**O que é:** schemas Vine que dizem: “este body é válido ou não”.

Exemplo real do seu projeto (`app/validators/user.ts`):

- email formato certo + único na tabela `users`
- senha 8–32 caracteres
- `passwordConfirmation` igual a `password`

Se falhar, a request **nem chega** a criar o usuário com dados podres.

### 3.4 `app/transformers/`

**O que é:** define o formato público do JSON.

Por que existe? Porque o model tem campos sensíveis (`password`). Você não quer `return user` cru e vazar hash.

Seu `UserTransformer` devolve só: `id`, `fullName`, `email`, datas, `initials`.

### 3.5 `app/middleware/`

**O que é:** funções que rodam **antes** do controller.

Exemplos no seu projeto:

- `force_json_response_middleware` → API sempre pensa em JSON
- `auth_middleware` → exige autenticação
- `silent_auth_middleware` → tenta autenticar se houver token, mas não bloqueia se não houver

### 3.6 `start/routes.ts`

**O que é:** o mapa URL → controller.

É um dos arquivos que você mais vai abrir.

### 3.7 `start/kernel.ts`

**O que é:** registra middlewares:

- **Server stack:** rodam em quase tudo
- **Router stack:** rodam em requests que bateram numa rota
- **Named:** você aplica manualmente (ex.: `middleware.auth()`)

### 3.8 `start/env.ts`

Valida variáveis de ambiente (`.env`). Se faltar algo obrigatório, a app nem sobe — melhor do que falhar no meio do request.

### 3.9 `config/`

Configurações por domínio:

- `database.ts` → SQLite em `tmp/db.sqlite3`
- `auth.ts` → guard padrão `api` (tokens)
- `cors.ts` → quem pode chamar a API do browser
- etc.

### 3.10 `database/migrations/`

**Histórico versionado** do banco. Cada arquivo descreve uma mudança (`up` cria, `down` desfaz).

Você **não** cria tabela editando o SQLite no Dedo. Você escreve migration e roda `node ace migration:run`.

### 3.11 `database/schema.ts`

Arquivo **gerado** a partir do banco. Contém classes tipo `UserSchema`, `AuthAccessTokenSchema`.

Seus models estendem esses schemas.  
**Nunca edite `schema.ts` na mão** — a próxima migration pode sobrescrever.

### 3.12 `.adonisjs/`

Código gerado (ex.: índice de controllers `#generated/controllers`). Por isso nas rotas aparece:

```ts
import { controllers } from '#generated/controllers'
router.post('signup', [controllers.NewAccount, 'store'])
```

Quando você cria um controller novo com Ace, esse índice é atualizado.

### 3.13 `adonisrc.ts`

Configuração central: providers carregados, preloads (`routes`, `kernel`), suites de teste, hooks de geração.

Você raramente mexe no começo.

### 3.14 `ace` / `node ace`

A CLI do Adonis. Gera arquivos, roda migrations, lista comandos, etc.

Sempre que não souber o comando:

```bash
node ace list
```

---

## 4. O ciclo de uma requisição HTTP

### 4.1 Diagrama

```
Cliente (Postman, frontend, mobile)
        │
        │  POST /api/v1/auth/login
        │  Body: { email, password }
        ▼
┌───────────────────┐
│  Server middleware │  CORS, JSON, bindings…
└─────────┬─────────┘
          ▼
┌───────────────────┐
│  Router middleware │  bodyparser, session, auth init…
└─────────┬─────────┘
          ▼
┌───────────────────┐
│  Rota encontrada?  │  start/routes.ts
└─────────┬─────────┘
          ▼
┌───────────────────┐
│  Named middleware  │  ex.: auth() nas rotas protegidas
└─────────┬─────────┘
          ▼
┌───────────────────┐
│  Controller        │  valida → model → serialize
└─────────┬─────────┘
          ▼
     JSON response
```

### 4.2 O que é `HttpContext`

Quase todo método de controller recebe `{ request, response, auth, params, serialize, ... }`.

Isso é o **HttpContext**: a “caixa de ferramentas” daquela request.

| Peça | Uso |
|---|---|
| `request` | Ler body, query, headers |
| `response` | Status, cookies (quando precisar) |
| `auth` | Usuário logado / autenticar |
| `params` | Parâmetros da URL (`:id`) |
| `serialize` | Serializar transformers de forma tipada |

Exemplo real do profile:

```ts
async show({ auth, serialize }: HttpContext) {
  return serialize(UserTransformer.transform(auth.getUserOrFail()))
}
```

Tradução humana:

1. Pegue o usuário autenticado (ou falhe)
2. Transforme para o formato público
3. Devolva serializado

---

## 5. Conceitos centrais, mastigados

### 5.1 Rotas

#### O que é

Uma rota diz: **método HTTP + caminho + o que executar**.

```ts
router.get('/', () => {
  return { hello: 'world' }
})
```

Aqui a ação é uma função anônima (ok para teste).

No resto do projeto, o padrão é controller:

```ts
router.post('signup', [controllers.NewAccount, 'store'])
```

#### Métodos HTTP (o básico que importa)

| Método | Ideia | Exemplo |
|---|---|---|
| `GET` | Ler sem alterar | listar todos |
| `POST` | Criar | criar todo |
| `PUT` / `PATCH` | Atualizar | editar todo |
| `DELETE` | Apagar | remover todo |

#### Grupos

```ts
router
  .group(() => {
    // rotas internas
  })
  .prefix('/api/v1')
```

Tudo dentro ganha o prefixo. Seu auth e account já estão assim.

Também dá para:

- `.as('auth')` → nomear grupo (útil para URL helpers / tipagem)
- `.use(middleware.auth())` → todas as rotas do grupo exigem login

#### Parâmetros dinâmicos

```ts
router.get('todos/:id', [controllers.Todos, 'show'])
```

No controller: `params.id`.

---

### 5.2 Controllers

#### Convenção REST (quase padrão da indústria)

| Ação | Método HTTP | Método do controller | URL típica |
|---|---|---|---|
| Listar | GET | `index` | `/todos` |
| Criar | POST | `store` | `/todos` |
| Ver um | GET | `show` | `/todos/:id` |
| Atualizar | PUT | `update` | `/todos/:id` |
| Apagar | DELETE | `destroy` | `/todos/:id` |

Não é lei do Adonis — é costume. Siga: seu cérebro e o de outros devs agradecem.

#### Exemplo real: signup (`NewAccountController`)

```ts
async store({ request, serialize }: HttpContext) {
  const { fullName, email, password } = await request.validateUsing(signupValidator)

  const user = await User.create({ fullName, email, password })
  const token = await User.accessTokens.create(user)

  return serialize({
    user: UserTransformer.transform(user),
    token: token.value!.release(),
  })
}
```

Passo a passo:

1. **Valida** o body com Vine  
2. **Cria** o user (a senha é hasheada pelo fluxo do model/auth)  
3. **Cria** um access token para já deixar logado  
4. **Devolve** user público + token em texto (só nessa hora o token “cru” aparece)

#### Exemplo real: login (`AccessTokensController.store`)

1. Valida email/senha  
2. `User.verifyCredentials(email, password)` → busca user e confere hash  
3. Cria token  
4. Devolve user + token  

#### Exemplo real: logout (`destroy`)

1. Pega user autenticado  
2. Apaga o token atual do banco  
3. Aquele Bearer deixa de funcionar  

---

### 5.3 Models e Lucid (ORM)

#### O que é ORM

Em vez de escrever SQL o tempo todo:

```sql
SELECT * FROM users WHERE email = ?
```

Você escreve:

```ts
await User.findBy('email', email)
```

O Lucid traduz para SQL.

#### Seu `User` model

```ts
export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  get initials() { ... }
}
```

Explicando cada parte:

- `UserSchema` → colunas vindas de `database/schema.ts` (`id`, `email`, `password`…)
- `withAuthFinder(hash)` → mixin que adiciona verificação de credenciais / hash
- `accessTokens` → API para criar/listar/apagar tokens desse user
- `initials` → getter de domínio (não é coluna; é calculado)

#### Operações que você vai viver

```ts
await User.create({ ... })
await User.find(1)
await User.findOrFail(1)          // 404 se não achar
await User.findBy('email', email)
await User.query().where('id', 1) // query builder
```

#### Relacionamentos (crítico no to-do)

- Um **User** tem muitos **Todos** → `hasMany`
- Um **Todo** pertence a um **User** → `belongsTo`

Isso modela a regra: “tarefa tem dono”.

---

### 5.4 Migrations

#### Por que existem

Para o banco evoluir **com o código**, de forma repetível:

- No seu PC
- No PC de um amigo
- Em produção

Sem migration, vira “funfou na minha máquina”.

#### Anatomia (sua migration de users)

```ts
async up() {
  this.schema.createTable(this.tableName, (table) => {
    table.increments('id').notNullable()
    table.string('full_name').nullable()
    table.string('email', 254).notNullable().unique()
    table.string('password').notNullable()
    table.timestamp('created_at').notNullable()
    table.timestamp('updated_at').nullable()
  })
}

async down() {
  this.schema.dropTable(this.tableName)
}
```

- `up` → aplica a mudança  
- `down` → desfaz (rollback)

#### snake_case no banco, camelCase no model

No banco: `full_name`  
No model TypeScript: `fullName`  

O Lucid faz esse mapeamento. Siga o padrão do projeto.

#### Comandos

```bash
node ace make:migration create_todos_table
node ace migration:run
node ace migration:rollback
node ace migration:status
```

Depois do `run`, olhe `database/schema.ts`: deve refletir as novas tabelas/colunas.

---

### 5.5 Validators (Vine)

#### Por que validar

O cliente pode mandar qualquer coisa: campo faltando, email inválido, senha `"1"`.

Validação é a **porteira**.

#### Como funciona no Adonis

```ts
const data = await request.validateUsing(signupValidator)
```

- Se ok → `data` tipado/limpo  
- Se não → exceção de validação → resposta HTTP de erro (seu exception handler cuida)

#### Padrão do seu `user.ts`

Regras reutilizáveis:

```ts
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)
```

Depois monta validators (`signupValidator`, `loginValidator`).

Para todos, você criará algo na mesma linha: `createTodoValidator`, `updateTodoValidator`.

---

### 5.6 Transformers

#### Problema que resolvem

Model ≠ JSON público.

#### Como usar (padrão do projeto)

```ts
UserTransformer.transform(user)
```

Dentro da classe:

```ts
toObject() {
  return this.pick(this.resource, [
    'id', 'fullName', 'email', 'createdAt', 'updatedAt', 'initials',
  ])
}
```

`pick` = “só estes campos saem”.

Para `Todo`, o transformer deve expor só o necessário: `id`, `title`, `description`, `completed`, timestamps — nunca dados internos desnecessários.

---

### 5.7 Middleware

#### Autenticando de verdade (`auth_middleware`)

```ts
await ctx.auth.authenticateUsing(options.guards)
return next()
```

Se não houver token válido → a request para (erro de auth).  
Se houver → o controller pode usar `auth.getUserOrFail()`.

#### Aplicando na rota

```ts
.use(middleware.auth())
```

No seu `routes.ts`, o grupo `/account` já faz isso. O grupo de `/todos` deve fazer igual.

---

### 5.8 Banco SQLite no seu projeto

Em `config/database.ts`:

- connection default: `sqlite`
- arquivo: `tmp/db.sqlite3`

Vantagens para aprender:

- Zero instalação de servidor de banco
- Arquivo local fácil de apagar e recomeçar

Quando for para produção séria, aí sim PostgreSQL/MySQL. O Lucid permite trocar a connection; suas queries de model continuam parecidas.

---

### 5.9 Auth config (`config/auth.ts`)

```ts
default: 'api',
guards: {
  api: tokensGuard({ ... }),
  web: sessionGuard({ ... }),
}
```

- **Guard `api`:** Bearer token (o que você vai usar no to-do)
- **Guard `web`:** sessão de browser (existe, mas não é o foco do kit API)

“Guard” = estratégia de autenticação.

---

## 6. Auth: signup, login, token e logout

### 6.1 Fluxo completo (guarde isso na cabeça)

```
1. POST /auth/signup
   → recebe user + token

2. Guarda o token (Postman environment / localStorage no frontend)

3. Nas próximas requests:
   Header: Authorization: Bearer <token>

4. Rotas com middleware.auth()
   → Adonis resolve o user a partir do token

5. POST /account/logout
   → apaga o token atual
   → aquele Bearer morre
```

### 6.2 O que é access token

É uma “chave” salva no banco (hash) e mostrada **uma vez** em texto ao cliente.

- Cliente manda o texto no header
- Servidor compara com o hash
- Se ok, sabe quem é o user

Por isso logout apaga o registro do token: a chave deixa de valer.

### 6.3 Teste obrigatório antes do to-do

Com o server rodando (`npm run dev`):

1. Signup  
2. Profile com Bearer  
3. Logout  
4. Profile de novo → deve falhar  

Se isso não funcionar, não comece o CRUD de todos. Conserte a base primeiro.

---

## 7. Como pensar um projeto antes de codar

Antes de gerar migration, responda no papel:

### 7.1 Perguntas

1. **Quais entidades?** User (já existe), Todo  
2. **Campos do Todo?** title, description?, completed, user_id, timestamps  
3. **Regras?**
   - Todo sempre tem dono
   - Só o dono lê/edita/apaga
   - `completed` começa `false`
   - `title` obrigatório  
4. **Endpoints?** lista abaixo  
5. **Erros esperados?** 401 sem token, 422 validação, 404 todo de outro user  

### 7.2 Contrato da API (to-do)

```
GET    /api/v1/todos
POST   /api/v1/todos
GET    /api/v1/todos/:id
PUT    /api/v1/todos/:id
DELETE /api/v1/todos/:id
```

Todas autenticadas.

### 7.3 Payloads sugeridos

**Criar (POST):**

```json
{
  "title": "Estudar Adonis",
  "description": "Ler o guia e fazer o CRUD"
}
```

**Atualizar (PUT):**

```json
{
  "title": "Estudar Adonis",
  "description": "Quase terminando",
  "completed": true
}
```

**Resposta típica de um todo:**

```json
{
  "id": 1,
  "title": "Estudar Adonis",
  "description": "Ler o guia e fazer o CRUD",
  "completed": false,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### 7.4 Ordem mental de implementação (sempre)

```
Migration → Model/relações → Validator → Transformer → Controller → Rotas → Testar
```

Por quê essa ordem?

- Sem tabela, model não tem onde gravar  
- Sem model, controller não tem o que chamar  
- Sem validator, você grava lixo  
- Sem transformer, você pode vazar dados  
- Sem rota, nada é alcançável  

---

## 8. Projeto prático: To-Do List (passo a passo)

Faça **um passo por vez**. Só avance quando o passo atual funcionar.

### Passo 0 — Subir o projeto e validar auth

```bash
npm run dev
```

Teste signup → profile com token.

**O que você aprende:** server, rotas, auth, Postman.

---

### Passo 1 — Desenhar o Todo (sem código)

Escreva num papel/nota:

- Campos
- Regras
- Endpoints

**O que você aprende:** design antes de framework (habilidade que vale para qualquer stack).

---

### Passo 2 — Criar a migration

```bash
node ace make:migration create_todos_table
```

Abra o arquivo gerado em `database/migrations/` e defina a tabela. Ideia:

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | increments | PK |
| `user_id` | unsignedInteger | FK → `users.id`, indexada |
| `title` | string | not null |
| `description` | text / string | nullable |
| `completed` | boolean | default `false` |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

Use foreign key para `users`. Assim o banco ajuda a manter integridade.

Rode:

```bash
node ace migration:run
```

Confira:

1. `node ace migration:status`  
2. `database/schema.ts` agora tem algo como `TodoSchema`  

**O que você aprende:** migrations, schema gerado, FK.

---

### Passo 3 — Model `Todo` e relações

Gere o model (Ace):

```bash
node ace make:model todo
```

Ajuste para:

- Estender o schema gerado (como `User` faz com `UserSchema`)
- Declarar `belongsTo` User
- No `User`, declarar `hasMany` Todo

Ideia de uso depois:

```ts
await user.related('todos').create({ title: '...' })
await user.related('todos').query()
```

Isso já amarra ownership na origem.

**O que você aprende:** models, relationships, Lucid.

---

### Passo 4 — Validators

Crie `app/validators/todo.ts` (ou via Ace, se preferir).

Sugestão de regras:

**Create**

- `title`: string, trim, minLength 1, maxLength razoável  
- `description`: string nullable / optional  

**Update**

- mesmos campos, mas opcionais  
- `completed`: boolean opcional  

Espelhe o estilo de `app/validators/user.ts`.

**O que você aprende:** Vine, reuso de regras, create vs update.

---

### Passo 5 — Transformer

Crie `TodoTransformer` no estilo do `UserTransformer`:

- `id`, `title`, `description`, `completed`, `createdAt`, `updatedAt`

**O que você aprende:** camada de apresentação da API.

---

### Passo 6 — Controller CRUD

```bash
node ace make:controller todos
```

Implemente na ordem mais didática:

#### 6.1 `store` (criar)

1. `auth.getUserOrFail()`  
2. validar body  
3. `user.related('todos').create({ ... })`  
4. retornar transformer  

#### 6.2 `index` (listar)

1. user autenticado  
2. `user.related('todos').query().orderBy('id', 'desc')`  
3. transformar lista  

#### 6.3 `show`

```ts
const todo = await user
  .related('todos')
  .query()
  .where('id', params.id)
  .firstOrFail()
```

Por que assim? Se o todo for de outro user, dá **404**, não 200 com dados vazados.

#### 6.4 `update`

1. Buscar como no `show`  
2. Validar  
3. `todo.merge(data)` + `todo.save()` (ou API equivalente do Lucid)  
4. Retornar transformer  

#### 6.5 `destroy`

1. Buscar como no `show`  
2. `todo.delete()`  
3. Mensagem ou 204  

**O que você aprende:** CRUD, HttpContext, ownership, `firstOrFail`.

---

### Passo 7 — Registrar rotas

Em `start/routes.ts`, dentro de `/api/v1`, crie um grupo autenticado (pode ser junto do account ou separado):

```ts
router
  .group(() => {
    router.get('todos', [controllers.Todos, 'index'])
    router.post('todos', [controllers.Todos, 'store'])
    router.get('todos/:id', [controllers.Todos, 'show'])
    router.put('todos/:id', [controllers.Todos, 'update'])
    router.delete('todos/:id', [controllers.Todos, 'destroy'])
  })
  .prefix('todos') // cuidado: se prefixar 'todos' e paths também tiverem 'todos', não duplique
  .use(middleware.auth())
```

Atenção: se o group já tem `.prefix('todos')`, as rotas internas devem ser `'/'`, `'/ :id'`, etc.  
Alternativa mais clara (sem prefix duplicado): paths completos `todos` / `todos/:id` dentro do group `/api/v1` com `.use(middleware.auth())`.

Use o mesmo estilo visual do arquivo atual para ficar consistente.

**O que você aprende:** groups, middleware, REST routes.

---

### Passo 8 — Matriz de testes manuais (faça todas)

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Criar todo sem token | 401 |
| 2 | Criar todo com token | 200/201 + JSON do todo |
| 3 | Criar sem title | 422 validação |
| 4 | Listar | só os seus |
| 5 | Atualizar `completed: true` | volta completed true |
| 6 | Deletar | some da listagem |
| 7 | Signup de **outro** user, tentar GET no id do primeiro | 404 |
| 8 | Logout e tentar listar | 401 |

O teste **7** é o mais importante para segurança.

**O que você aprende:** auth real, autorização por dono, validação.

---

### Passo 9 — Melhorias (quando o básico estiver sólido)

Escolha uma:

1. Filtro `GET /todos?completed=true`  
2. Busca por texto no title  
3. Soft delete (`deleted_at`)  
4. Teste automatizado Japa em `tests/functional`  
5. Policy/ability (`app/policies`) para autorização mais formal  

Não faça todas de uma vez. Cada melhoria ensina uma ideia.

---

### Passo 10 — Checklist “eu aprendi Adonis?”

Você consegue explicar em voz alta:

- [ ] O caminho de um request até o JSON  
- [ ] Diferença entre migration, schema e model  
- [ ] Para que serve validator e transformer  
- [ ] Como o Bearer token autentica  
- [ ] Por que filtrar todos por `user_id`  
- [ ] O que `firstOrFail` faz  

Se sim, você já tem base para projetos pessoais maiores.

---

## 9. Como testar com Postman / Insomnia

### 9.1 Ambiente sugerido

Crie variável `baseUrl` = `http://localhost:3333` (confirme a porta no terminal ao rodar `npm run dev`).

Crie variável `token` (vazia no início).

### 9.2 Signup

`POST {{baseUrl}}/api/v1/auth/signup`

Body JSON:

```json
{
  "fullName": "Caio",
  "email": "caio@example.com",
  "password": "senha12345",
  "passwordConfirmation": "senha12345"
}
```

Copie o `token` da resposta para a variável `token`.

### 9.3 Requests autenticadas

Header:

```
Authorization: Bearer {{token}}
```

### 9.4 Ordem boa de cliques

1. signup (ou login)  
2. profile  
3. create todo  
4. list todos  
5. update todo  
6. delete todo  
7. logout  

---

## 10. Comandos Ace que você vai usar

```bash
npm run dev                 # sobe server com HMR
npm run build               # build de produção
npm run test                # testes

node ace list               # todos os comandos
node ace make:controller todos
node ace make:model todo
node ace make:migration create_todos_table
node ace migration:run
node ace migration:rollback
node ace migration:status
```

Dica: quando o Ace gerar arquivo, **abra e leia** o boilerplate. O framework te deixa um esqueleto propositalmente.

---

## 11. Armadilhas comuns

1. **Esquecer o header Authorization** → 401 e a sensação de que “a rota quebrou”.  
2. **`Todo.find(params.id)` sem filtrar user** → vazamento entre usuários. Sempre amarre ao dono.  
3. **Editar `database/schema.ts`** → alteração some. Use migration.  
4. **Achar que transformer é opcional** → no começo parece burocracia; depois salva sua pele.  
5. **Controller fazendo tudo** → ok no aprendizado; se crescer, extraia service.  
6. **Não testar o user B acessando id do user A** → CRUD “funciona” mas está inseguro.  
7. **Misturar prefixos de rota** → `/todos/todos`. Revise o group.  
8. **Apagar `tmp/db.sqlite3` sem rerodar migrations** → app quebra até `migration:run`.  

---

## 12. Glossário

| Termo | Significado |
|---|---|
| **API** | Interface HTTP (geralmente JSON) entre cliente e servidor |
| **Endpoint** | Uma URL + método (ex.: `POST /todos`) |
| **Ace** | CLI do Adonis |
| **Lucid** | ORM do Adonis |
| **Migration** | Script versionado que muda o banco |
| **Model** | Classe que representa uma tabela |
| **ORM** | Camada objeto ↔ SQL |
| **Vine** | Biblioteca de validação |
| **Validator** | Schema de validação de entrada |
| **Transformer** | Formato público do JSON de saída |
| **Middleware** | Filtro que roda antes do controller |
| **Guard** | Estratégia de auth (token, session…) |
| **Access token** | Credencial de API após login/signup |
| **Bearer** | Esquema do header `Authorization: Bearer …` |
| **FK / Foreign key** | Coluna que aponta para outra tabela |
| **CRUD** | Create, Read, Update, Delete |
| **HttpContext** | Objeto com request/auth/params da request |
| **Japa** | Runner de testes usado no Adonis |
| **ESM** | Módulos JS modernos (`import`/`export`) |
| **HMR** | Hot reload no `npm run dev` |

---

## 13. Plano de estudo sugerido

| Dia | O que fazer | Critério de “pronto” |
|---|---|---|
| 1 | Ler partes 1–6; rodar auth | signup + profile funcionam |
| 2 | Migration + model + relações | `TodoSchema` existe; model compila |
| 3 | Validator + transformer + `store`/`index` | cria e lista todos |
| 4 | `show`/`update`/`destroy` + ownership | user B não vê todo do A |
| 5 | Revisar guia; anotar dúvidas; filtro opcional | você explica o fluxo sem olhar |
| 6 | (Opcional) 1–2 testes Japa | `npm run test` passa |
| 7 | Mini retrospectiva + ideia do próximo app | checklist da seção 8.10 |

Estude **fazendo**, não só lendo. Cada conceito gruda quando quebra e você conserta.

---

## 14. Próximos projetos depois do to-do

Quando o to-do estiver sólido, reutilize o mesmo esqueleto mental:

1. **Notas com tags** → many-to-many  
2. **Controle de hábitos** → check-ins por data  
3. **Despesas pessoais** → categorias + soma por mês  
4. **Biblioteca de links** → CRUD + busca  

Em todos eles a receita é a mesma:

> recurso + dono (user) + validator + transformer + rotas autenticadas

---

## Apêndice A — Leitura dos arquivos “modelo” do seu repo

Quando estiver implementando o Todo, mantenha estes arquivos abertos como referência:

1. `start/routes.ts` — como agrupar e proteger rotas  
2. `app/controllers/new_account_controller.ts` — validate → create → serialize  
3. `app/controllers/access_tokens_controller.ts` — login/logout com auth  
4. `app/controllers/profile_controller.ts` — endpoint autenticado mínimo  
5. `app/validators/user.ts` — estilo Vine do projeto  
6. `app/transformers/user_transformer.ts` — estilo de saída  
7. `app/models/user.ts` — model + mixins  
8. `database/migrations/1761885935168_create_users_table.ts` — estilo de migration  
9. `start/kernel.ts` — onde `middleware.auth` nasce  
10. `config/auth.ts` — por que o guard default é `api`  

Não copie cegamente: **entenda a intenção** de cada linha e replique a intenção no Todo.

---

## Apêndice B — Mini formulário “antes de criar qualquer feature nova”

Copie e preencha:

```text
Recurso: _______________
Pertence a um User? ( ) sim  ( ) não
Campos:
  -
  -
Regras de negócio:
  -
Endpoints:
  -
Campos sensíveis que NÃO podem vazar:
  -
Ordem de implementação:
  [ ] migration
  [ ] model/relações
  [ ] validator
  [ ] transformer
  [ ] controller
  [ ] routes + auth
  [ ] teste manual (inclui user B)
```

Se você preencher isso antes de codar, já está pensando como alguém que “sabe Adonis” de verdade — não só digitando tutorial.

---

## Fechamento

To-do list é o projeto certo para o seu momento: pequeno, completo e alinhado com o que o starter já te deu (auth por token).

Caminho resumido:

1. Entenda o ciclo request → response  
2. Domine o trio **migration / model / validator**  
3. Sempre proteja com **auth + ownership**  
4. Devolva dados via **transformer**  
5. Teste o caso do **outro usuário**  

Bom estudo — e quando quiser implementar o Todo no código deste repositório, peça no chat que seguimos passo a passo em cima desses arquivos.
`)