# Espalhe Melodias — Backend API

API REST em Node 22 + Express + TypeScript + MySQL.

---

## Pré-requisitos

- Node.js 22 (use `.nvmrc` — `nvm use`)
- MySQL 8+ rodando (localhost ou VPS)
- npm

---

## Setup rápido (local / dev)

```bash
cd server

# 1. Instalar dependências
npm install

# 2. Copiar e configurar variáveis de ambiente
cp .env.example .env
# Edite .env com sua senha do MySQL

# 3. Criar as tabelas (rode uma única vez, ou toda vez que adicionar migration)
node scripts/migrate.js

# 4. Popular com dados iniciais (opcional mas recomendado)
npm run seed

# 5. Subir o servidor em modo desenvolvimento
npm run dev
```

O servidor sobe em `http://localhost:3001`.

---

## Deploy na VPS (produção)

```bash
# No servidor
cd /var/www/espalhe-melodias/server

# Configurar variáveis de produção
cp .env.example .env
nano .env    # ajuste NODE_ENV=production, DB_*, JWT_SECRET, CORS_ORIGIN

# Instalar dependências
npm install --production

# Rodar migration
node scripts/migrate.js

# Compilar TypeScript
npm run build

# Iniciar (use PM2 em produção)
npm start
# ou: pm2 start dist/server.js --name melodias-api
```

---

## Variáveis de ambiente (.env)

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta da API | `3001` |
| `NODE_ENV` | `development` ou `production` | `development` |
| `JWT_SECRET` | Segredo do access token | — |
| `JWT_EXPIRES_IN` | Validade do access token | `7d` |
| `JWT_REFRESH_SECRET` | Segredo do refresh token | — |
| `JWT_REFRESH_EXPIRES_IN` | Validade do refresh token | `30d` |
| `CORS_ORIGIN` | Origem permitida | `http://localhost:3000` |
| `DB_HOST` | Host MySQL | `localhost` |
| `DB_PORT` | Porta MySQL | `3306` |
| `DB_USER` | Usuário MySQL | `root` |
| `DB_PASSWORD` | Senha MySQL | — |
| `DB_NAME` | Nome do banco | `espalhe_melodias` |

---

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor com hot-reload (tsx watch) |
| `npm run build` | Compila TypeScript → `dist/` |
| `npm start` | Inicia a versão compilada |
| `node scripts/migrate.js` | Cria/atualiza todas as tabelas |
| `npm run seed` | Popula o banco com dados iniciais |
| `npm run lint` | Verifica tipos TypeScript |

---

## Endpoints da API

Base: `http://localhost:3001`

### Auth  `/api/auth`

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/register` | Cadastro de novo usuário | Público |
| POST | `/login` | Login → retorna tokens | Público |
| POST | `/refresh` | Renova access token | Público |
| POST | `/logout` | Revoga refresh token | Público |
| GET | `/me` | Dados do usuário logado | ✅ |
| POST | `/change-password` | Alterar senha | ✅ |

**Login response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": "7d",
    "user": {
      "id": "uuid",
      "name": "Karen",
      "email": "karen.adm@melodias.com.br",
      "role": "super-admin",
      "permissions": ["users:read", "users:write", ...]
    }
  }
}
```

---

### Users  `/api/users`

| Método | Rota | Descrição | Role mínimo |
|---|---|---|---|
| GET | `/` | Listar usuários (filtros: role, status, search) | professional |
| GET | `/stats` | Estatísticas de usuários | super-admin |
| GET | `/:id` | Detalhe do usuário | ✅ |
| PUT | `/:id` | Atualizar perfil | ✅ (próprio) |
| POST | `/` | Criar usuário (admin) | super-admin |
| PATCH | `/:id/approval` | Aprovar/rejeitar membro | super-admin |
| PATCH | `/:id/role` | Mudar role | super-admin |
| DELETE | `/:id` | Excluir usuário | super-admin |

---

### User Preferences  `/api/preferences`

Salva tema, cores, fontes, filtros, bookmarks e inscrições em eventos por usuário.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Buscar preferências do usuário logado |
| PATCH | `/` | Atualizar preferências (campos parciais) |
| DELETE | `/reset` | Restaurar preferências ao padrão |
| POST | `/bookmark/material/:id` | Toggle bookmark de material |
| POST | `/bookmark/topic/:id` | Toggle bookmark de tópico do fórum |
| POST | `/enroll/:id` | Toggle inscrição em evento |

**PATCH body exemplo:**
```json
{
  "theme": "dark",
  "accentColor": "moss",
  "fontSize": "lg",
  "sidebarCollapsed": true,
  "notifications": {
    "emailNewForumReply": false,
    "pushEnabled": true
  },
  "dashboard": {
    "showWelcomeBanner": false,
    "defaultView": "list"
  },
  "filters": {
    "forum": { "defaultCategory": "Ansiedade", "defaultSort": "popular" },
    "materials": { "defaultView": "list" }
  }
}
```

---

### Forum  `/api/forum`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Listar tópicos (?category, search, sort, solved) |
| GET | `/:id` | Detalhe do tópico + respostas |
| POST | `/` | Criar tópico |
| PUT | `/:id` | Editar tópico |
| DELETE | `/:id` | Excluir tópico |
| POST | `/:id/like` | Toggle like no tópico |
| POST | `/:id/replies` | Adicionar resposta |
| POST | `/:id/replies/:replyId/like` | Toggle like na resposta |

---

### Materials  `/api/materials`

| Método | Rota | Role |
|---|---|---|
| GET | `/` | Todos |
| GET | `/:id` | Todos |
| POST | `/` | professional+ |
| PUT | `/:id` | professional+ |
| DELETE | `/:id` | professional+ |
| POST | `/:id/download` | Todos (registra download) |

---

### Events  `/api/events`

| Método | Rota | Role |
|---|---|---|
| GET | `/` | Todos |
| GET | `/:id` | Todos |
| POST | `/` | professional+ |
| PUT | `/:id` | professional+ |
| DELETE | `/:id` | professional+ |
| POST | `/:id/enroll` | Todos (toggle inscrição) |

---

### Help Requests  `/api/help`

| Método | Rota | Role |
|---|---|---|
| GET | `/` | Todos (member vê só as próprias) |
| GET | `/stats` | professional+ |
| GET | `/:id` | Todos (member vê só as próprias) |
| POST | `/` | Todos |
| PATCH | `/:id` | professional+ (triage) |

---

### Suggestions  `/api/suggestions`

| Método | Rota | Role |
|---|---|---|
| GET | `/` | Todos |
| POST | `/` | Todos |
| POST | `/:id/like` | Todos |
| PATCH | `/:id` | professional+ (status/nota) |

---

### Professionals  `/api/professionals`

| Método | Rota | Role |
|---|---|---|
| GET | `/` | Todos |
| GET | `/:id` | Todos |
| PUT | `/me` | professional+ (cria ou atualiza perfil) |

---

### Blogs  `/api/blogs`

| Método | Rota | Role |
|---|---|---|
| GET | `/` | Todos |
| GET | `/:id` | Todos |
| POST | `/` | professional+ |
| PUT | `/:id` | professional+ |
| DELETE | `/:id` | professional+ |
| POST | `/:id/like` | Todos |

---

## Autenticação

Todas as rotas protegidas exigem:

```
Authorization: Bearer <accessToken>
```

O access token expira em 7 dias. Use `/api/auth/refresh` com o refresh token para renová-lo.

---

## Roles e Permissões

| Role | Nível | Acesso |
|---|---|---|
| `super-admin` | 3 | Tudo, incluindo gestão de usuários |
| `professional` | 2 | Criar/editar conteúdo, triagem de solicitações |
| `member` | 1 | Consumir conteúdo, participar do fórum |

Usuários novos ficam com `approval_status = pending` até um super-admin aprovar.

---

## Estrutura do projeto

```
server/
  scripts/
    migrate.js          ← Cria/atualiza tabelas MySQL (node scripts/migrate.js)
  src/
    config/
      index.ts          ← Configurações centralizadas
      db.ts             ← Pool MySQL + helpers query/execute
    controllers/        ← Lógica de negócio por domínio
    middleware/
      auth.ts           ← JWT authenticate + requireRole
      permissions.ts    ← can(permission) guard
      errorHandler.ts   ← AppError + handler global
      validate.ts       ← express-validator wrapper
    routes/             ← Express Router por domínio
    scripts/
      seed.ts           ← Dados iniciais
    types/
      domain.ts         ← Todos os tipos TypeScript + ROLE_PERMISSIONS
    utils/
      asyncHandler.ts   ← Wrapper para controllers async
      helpers.ts        ← newId, nowISO, sanitizeUser, parseJson
      paginate.ts       ← Paginação padronizada
    server.ts           ← Entry point
```
