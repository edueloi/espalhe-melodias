# Public Website API - Espalhe Melodias

Endpoints para o site público do Espalhe Melodias (newsletter, contato, inscrição em eventos, estatísticas).

---

## Endpoints

### Newsletter

#### 1. Subscribe to Newsletter
**POST** `/api/newsletter/subscribe`

Inscrever um email na newsletter (sem autenticação).

**Request:**
```json
{
  "email": "usuario@exemplo.com.br"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Inscrito com sucesso"
}
```

**Errors:**
- `400` - Email obrigatório ou inválido
- `409` - Email já inscrito

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@exemplo.com.br"}'
```

---

#### 2. Unsubscribe from Newsletter
**POST** `/api/newsletter/unsubscribe`

Desinscrever usando um token de unsubscribe (recebido por email).

**Request:**
```json
{
  "token": "abc123def456..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Desinscrição realizada"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/newsletter/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{"token":"abc123def456..."}'
```

---

#### 3. Get Newsletter Subscriber Count
**GET** `/api/newsletter/count`

Total de inscritos ativos na newsletter (público).

**Response (200 OK):**
```json
{
  "count": 1250
}
```

**cURL Example:**
```bash
curl http://localhost:3001/api/newsletter/count
```

---

### Contact Messages

#### 4. Create Contact Message
**POST** `/api/contact`

Enviar uma mensagem de contato (sem autenticação).

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com.br",
  "phone": "(11) 98765-4321",
  "message": "Gostaria de saber mais sobre vossas atividades de educação em saúde."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "messageId": 42
}
```

**Validation:**
- `name` (required, string, não vazio)
- `email` (required, email válido)
- `phone` (optional, formato telefônico)
- `message` (required, mínimo 10 caracteres)

**Errors:**
- `400` - Dados inválidos
- `500` - Erro ao processar

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com.br",
    "phone": "(11) 98765-4321",
    "message": "Gostaria de saber mais sobre vossas atividades de educação em saúde."
  }'
```

---

#### 5. Get Contact Messages
**GET** `/api/contact/messages`

Listar todas as mensagens de contato (apenas admin).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, máx: 50)
- `status` (optional: 'new', 'read', 'replied', 'archived')

**Response (200 OK):**
```json
{
  "messages": [
    {
      "id": 42,
      "name": "João Silva",
      "email": "joao@exemplo.com.br",
      "phone": "(11) 98765-4321",
      "message": "Gostaria de saber mais...",
      "status": "new",
      "createdAt": "2026-06-18T10:30:00Z",
      "updatedAt": "2026-06-18T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "pages": 7
  }
}
```

**Errors:**
- `401` - Não autenticado
- `403` - Sem permissão (não admin)

**cURL Example:**
```bash
curl http://localhost:3001/api/contact/messages?page=1&limit=20 \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

#### 6. Update Contact Message Status
**PATCH** `/api/contact/:messageId`

Atualizar o status de uma mensagem de contato (apenas admin).

**Request:**
```json
{
  "status": "replied"
}
```

**Valid statuses:** `new`, `read`, `replied`, `archived`

**Response (200 OK):**
```json
{
  "success": true
}
```

**Errors:**
- `400` - Status inválido
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Mensagem não encontrada

**cURL Example:**
```bash
curl -X PATCH http://localhost:3001/api/contact/42 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"status":"replied"}'
```

---

### Event Inscriptions

#### 7. Subscribe to Event
**POST** `/api/events/:eventId/subscribe`

Inscrever um usuário autenticado em um evento.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (201 Created):**
```json
{
  "success": true,
  "inscriptionId": 156
}
```

**Errors:**
- `401` - Não autenticado
- `404` - Evento não encontrado
- `409` - Já inscrito neste evento

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/events/42/subscribe \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

#### 8. Unsubscribe from Event
**DELETE** `/api/events/:eventId/subscribe`

Cancelar inscrição em um evento.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Errors:**
- `401` - Não autenticado
- `404` - Inscrição não encontrada

**cURL Example:**
```bash
curl -X DELETE http://localhost:3001/api/events/42/subscribe \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

#### 9. Get Event Inscriptions
**GET** `/api/events/:eventId/inscriptions`

Listar inscrições de um evento (apenas admin).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50, máx: 100)

**Response (200 OK):**
```json
{
  "inscriptions": [
    {
      "id": 156,
      "userId": 10,
      "eventId": 42,
      "status": "confirmed",
      "checkedInAt": null,
      "createdAt": "2026-06-18T09:00:00Z",
      "updatedAt": "2026-06-18T10:00:00Z",
      "name": "João Silva",
      "email": "joao@exemplo.com.br"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 87,
    "pages": 2
  }
}
```

**Errors:**
- `401` - Não autenticado
- `403` - Sem permissão

**cURL Example:**
```bash
curl "http://localhost:3001/api/events/42/inscriptions?page=1&limit=50" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

### Website Statistics

#### 10. Get Website Stats
**GET** `/api/website/stats`

Estatísticas públicas do site (sem autenticação).

**Response (200 OK):**
```json
{
  "totalSubscribers": 1250,
  "totalMessages": 125,
  "totalInscriptions": 87,
  "newMessagesCount": 12
}
```

**cURL Example:**
```bash
curl http://localhost:3001/api/website/stats
```

---

## Database Tables

### newsletter_subscribers
```sql
CREATE TABLE newsletter_subscribers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  dateSubscribed DATETIME NOT NULL,
  isActive BOOLEAN DEFAULT true,
  unsubscribeToken VARCHAR(64) UNIQUE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

### contact_messages
```sql
CREATE TABLE contact_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

### event_inscriptions
```sql
CREATE TABLE event_inscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  eventId INT NOT NULL,
  status ENUM('registered', 'confirmed', 'cancelled') DEFAULT 'registered',
  checkedInAt DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  UNIQUE (userId, eventId),
  FOREIGN KEY (userId) REFERENCES app_users(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES health_events(id) ON DELETE CASCADE
);
```

### blog_categories
```sql
CREATE TABLE blog_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  description TEXT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

---

## Environment Variables

Adicionar ao `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=espalhe_melodias

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_REFRESH_SECRET=sua_chave_refresh_aqui

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Server
PORT=3001
NODE_ENV=development
```

---

## Running Migrations

```bash
# TypeScript
npm run build && npx ts-node src/scripts/runMigration.ts

# Ou com tsx (mais rápido)
npx tsx src/scripts/runMigration.ts
```

---

## Status Summary

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| /api/newsletter/subscribe | POST | No | ✅ Ready |
| /api/newsletter/unsubscribe | POST | No | ✅ Ready |
| /api/newsletter/count | GET | No | ✅ Ready |
| /api/contact | POST | No | ✅ Ready |
| /api/contact/messages | GET | Yes (Admin) | ✅ Ready |
| /api/contact/:id | PATCH | Yes (Admin) | ✅ Ready |
| /api/events/:eventId/subscribe | POST | Yes | ✅ Ready |
| /api/events/:eventId/subscribe | DELETE | Yes | ✅ Ready |
| /api/events/:eventId/inscriptions | GET | Yes (Admin) | ✅ Ready |
| /api/website/stats | GET | No | ✅ Ready |

---

## Files Created

```
server/src/
├── controllers/
│   └── publicWebsiteController.ts    (10 handlers)
├── models/
│   └── publicWebsite.ts              (types & interfaces)
├── routes/
│   └── publicWebsite.ts              (route definitions)
├── scripts/
│   ├── migrations/
│   │   └── 001_public_website.sql    (DB tables)
│   └── runMigration.ts               (migration runner)
└── utils/
    └── validators.ts                 (email, phone, etc)
```

---

## Testing the API

### 1. Run migrations
```bash
npm run build
npx tsx src/scripts/runMigration.ts
```

### 2. Start server
```bash
npm run dev:back
```

### 3. Test endpoints
```bash
# Subscribe to newsletter
curl -X POST http://localhost:3001/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Get stats
curl http://localhost:3001/api/website/stats

# Send contact message
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "(11) 98765-4321",
    "message": "This is a test message with more than 10 characters."
  }'
```

---

## Notes

- Todos os endpoints retornam JSON
- Validação de email: regex simples + tamanho máximo
- Validação de telefone: apenas caracteres numéricos, 10-15 dígitos
- Mensagens de contato começam com status `new`
- Inscrições de evento começam com status `registered`
- Tokens de unsubscribe são gerados com crypto.randomBytes(32)
- Rate limiting aplicado em `/api/*` (padrão: 100 requisições por 15 min)
- CORS configurável via `CORS_ORIGIN` (.env)
