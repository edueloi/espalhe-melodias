# Newsletter & Contact Forms — Guia Completo

Implementação robusta de Newsletter e Formulários de Contato com integração a Mailchimp/SendGrid, validações, rate limiting e templates de email profissionais.

## Índice

1. [Visão Geral](#visão-geral)
2. [Setup](#setup)
3. [API Endpoints](#api-endpoints)
4. [Email Templates](#email-templates)
5. [Rate Limiting](#rate-limiting)
6. [Validações](#validações)
7. [Exemplos de Uso](#exemplos-de-uso)

---

## Visão Geral

### Funcionalidades

**Newsletter:**
- Inscrição com validação de email e duplicate check
- Desinscrição fácil com confirmação
- Status check (subscribed/unsubscribed/bounced)
- Admin: Listar subscribers, exportar CSV, enviar newsletter
- Integração Mailchimp/SendGrid

**Contact Forms:**
- Validação robusta (email, telefone, length)
- Detecção de spam (URLs, keywords, repetição)
- Confirmação automática ao remetente
- Notificação ao admin
- Admin: Responder mensagens, atualizar status, exportar CSV
- Suporte a múltiplos emails de admin

### Tabelas do Banco

```sql
-- Newsletter Subscribers
CREATE TABLE newsletter_subscribers (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  status ENUM('subscribed', 'unsubscribed', 'bounced'),
  subscribedAt TIMESTAMP,
  unsubscribedAt TIMESTAMP,
  lastEmailSentAt TIMESTAMP,
  metadata JSON
);

-- Contact Messages
CREATE TABLE contact_messages (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  subject VARCHAR(200),
  message LONGTEXT,
  status ENUM('new', 'responded', 'resolved', 'spam'),
  adminReply LONGTEXT,
  respondedAt TIMESTAMP,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

---

## Setup

### 1. Instalar Dependências

As seguintes dependências já estão no `package.json`:

```json
{
  "dependencies": {
    "axios": "^1.18.0",
    "express-validator": "^7.2.1",
    "express-rate-limit": "^7.5.0"
  }
}
```

### 2. Configurar Variáveis de Ambiente

Copiar `.env.example` para `.env` e atualizar:

```bash
# Email Service
EMAIL_PROVIDER=local                    # 'local' | 'sendgrid' | 'mailchimp'
EMAIL_FROM=noreply@espalhe-melodias.com
EMAIL_FROM_NAME=Espalhe Melodias

# SendGrid (se usar SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxx

# Mailchimp (se usar Mailchimp)
MAILCHIMP_API_KEY=xxxx-us1
MAILCHIMP_LIST_ID=xxxxx

# Contact Form
CONTACT_ADMIN_EMAILS=admin1@espalhe-melodias.com,admin2@espalhe-melodias.com
```

### 3. Executar Migrations

```bash
npm run migrate
```

Ou manualmente via MySQL:

```sql
-- server/src/scripts/migrations/002_newsletter_contact.sql
mysql -u root -p espalhe_melodias < 002_newsletter_contact.sql
```

### 4. Iniciar o Servidor

```bash
npm run dev:back
```

---

## API Endpoints

### Newsletter

#### **POST** `/api/newsletter/subscribe`
Inscreve um email na newsletter.

**Request:**
```json
{
  "email": "user@example.com",
  "metadata": {
    "name": "João Silva",
    "source": "homepage"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Inscrição realizada com sucesso! Verifique seu email.",
  "subscriber": {
    "id": "uuid",
    "email": "user@example.com",
    "status": "subscribed",
    "subscribedAt": "2026-06-18T10:30:00Z",
    "metadata": { "name": "João Silva" }
  }
}
```

**Rate Limiting:** 1 por IP/dia

---

#### **POST** `/api/newsletter/unsubscribe`
Desinscreve um email da newsletter.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Desinscrição realizada. Você não receberá mais emails."
}
```

---

#### **GET** `/api/newsletter/status/:email`
Verifica status de inscrição de um email.

**Response (200 OK):**
```json
{
  "success": true,
  "isSubscribed": true,
  "subscriber": {
    "id": "uuid",
    "email": "user@example.com",
    "status": "subscribed",
    "subscribedAt": "2026-06-18T10:30:00Z"
  }
}
```

---

#### **GET** `/api/newsletter/subscribers` ⚠️ Admin

Lista todos os subscribers com paginação.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50, max: 500)
- `status` (subscribed|unsubscribed|bounced) - opcional

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "total": 1250,
    "page": 1,
    "limit": 50,
    "pages": 25
  }
}
```

---

#### **GET** `/api/newsletter/export` ⚠️ Admin

Exporta subscribers em CSV.

**Query Parameters:**
- `status` (opcional)

**Response:** CSV file

---

#### **POST** `/api/newsletter/send` ⚠️ Admin

Envia newsletter para todos os subscribers ativos.

**Request:**
```json
{
  "subject": "Nova atualização da comunidade",
  "htmlContent": "<h1>Olá!</h1><p>...</p>",
  "textContent": "Olá!\n..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Newsletter enviada para 850 subscribers. 2 falhas.",
  "result": {
    "sent": 850,
    "failed": 2
  }
}
```

---

### Contact Forms

#### **POST** `/api/contact/messages`
Submete nova mensagem de contato.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "(11) 99999-9999",
  "subject": "Dúvida sobre membership",
  "message": "Gostaria de saber mais sobre como funciona a membership..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso! Verificaremos em breve.",
  "contact": {
    "id": "uuid",
    "status": "new"
  }
}
```

**Rate Limiting:** 3 por IP/dia

---

#### **GET** `/api/contact/messages/:id`
Obtém uma mensagem de contato (público).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 99999-9999",
    "subject": "Dúvida sobre membership",
    "message": "Gostaria de saber mais...",
    "status": "new",
    "createdAt": "2026-06-18T10:30:00Z"
  }
}
```

---

#### **GET** `/api/contact/admin/messages` ⚠️ Admin

Lista todas as mensagens com filtros.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50, max: 500)
- `status` (new|responded|resolved|spam) - opcional
- `search` - busca em nome, email, assunto, mensagem

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "total": 342,
    "page": 1,
    "limit": 50,
    "pages": 7
  }
}
```

---

#### **PUT** `/api/contact/admin/messages/:id/status` ⚠️ Admin

Atualiza status da mensagem.

**Request:**
```json
{
  "status": "responded"  // 'new' | 'responded' | 'resolved' | 'spam'
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status atualizado com sucesso.",
  "data": { ... }
}
```

---

#### **POST** `/api/contact/admin/messages/:id/reply` ⚠️ Admin

Adiciona resposta do admin e envia email ao remetente.

**Request:**
```json
{
  "adminReply": "Olá João! Obrigado por entrar em contato. Vou te enviar mais informações..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resposta enviada com sucesso.",
  "data": {
    "id": "uuid",
    "status": "responded",
    "adminReply": "Olá João!...",
    "respondedAt": "2026-06-18T11:00:00Z"
  }
}
```

---

#### **GET** `/api/contact/admin/export` ⚠️ Admin

Exporta mensagens em CSV.

**Query Parameters:**
- `status` (opcional)

**Response:** CSV file

---

#### **GET** `/api/contact/admin/stats` ⚠️ Admin

Obtém estatísticas das mensagens.

**Response:**
```json
{
  "success": true,
  "data": {
    "new": 42,
    "responded": 156,
    "resolved": 89,
    "spam": 3
  }
}
```

---

## Email Templates

Todos os templates estão em `server/src/services/emailTemplates.ts`.

### 1. Welcome Newsletter

```typescript
EmailTemplates.welcomeNewsletter(email: string)
```

**Conteúdo:**
- Bem-vindo à newsletter
- Benefícios de estar inscrito
- Link para acessar comunidade

---

### 2. Unsubscribe Confirmation

```typescript
EmailTemplates.unsubscribeConfirmation(email: string)
```

**Conteúdo:**
- Confirmação de desinscrição
- Mensagem de despedida

---

### 3. Contact Form Confirmation

```typescript
EmailTemplates.contactFormConfirmation(name, email, subject, messageId)
```

**Conteúdo:**
- Confirmação de recebimento
- Detalhes da mensagem
- Expectativa de resposta

---

### 4. Admin Notification

```typescript
EmailTemplates.contactFormAdminNotification(
  senderName, senderEmail, senderPhone, subject, message, messageId
)
```

**Conteúdo:**
- Notificação de nova mensagem
- Detalhes do remetente
- Link para dashboard

---

### 5. Admin Reply

```typescript
EmailTemplates.contactFormAdminReply(name, adminReply)
```

**Conteúdo:**
- Resposta do admin
- Mensagem formatada

---

### 6. Weekly Digest (opcional)

```typescript
EmailTemplates.weeklyDigest(email, highlights)
```

**Parâmetros:**
```typescript
highlights: Array<{
  title: string;
  description: string;
  link?: string;
}>
```

---

## Rate Limiting

### Configuração

**Newsletter:**
- **Limite:** 1 inscrição por IP / 24 horas
- **Exceção:** Admins (com Bearer token)

**Contact Form:**
- **Limite:** 3 mensagens por IP / 24 horas
- **Exceção:** Admins (com Bearer token)

**Admin Operations:**
- **Limite:** 5 requisições por IP / 1 minuto

### Ajustar Limites

Em `server/src/middleware/rateLimiters.ts`:

```typescript
export const newsletterLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,  // Tempo da janela
  max: 1,                          // Máximo de requisições
  message: { ... }
});
```

---

## Validações

### Email

- Regex RFC 5322 simplificado
- Máximo 255 caracteres
- Normalizado para lowercase

### Telefone

- 10-11 dígitos (Brasil)
- Formatado como `(XX) 9XXXX-XXXX`
- Opcional para contact form

### Mensagem

- Mínimo: 10 caracteres
- Máximo: 5000 caracteres
- Remove scripts e event handlers

### Detecção de Spam

A função `isLikelySpam()` verifica:

- Mais de 3 URLs na mensagem
- 2+ keywords de spam (bitcoin, viagra, casino, etc)
- Repetição excessiva de caracteres

---

## Exemplos de Uso

### cURL

#### Newsletter Subscribe

```bash
curl -X POST http://localhost:3001/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "metadata": {"source": "homepage"}
  }'
```

#### Contact Form Submit

```bash
curl -X POST http://localhost:3001/api/contact/messages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 99999-9999",
    "subject": "Dúvida sobre membership",
    "message": "Gostaria de saber mais sobre como funciona..."
  }'
```

#### Admin List Messages

```bash
curl -X GET "http://localhost:3001/api/contact/admin/messages?page=1&limit=50&status=new" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Admin Respond

```bash
curl -X POST http://localhost:3001/api/contact/admin/messages/UUID/reply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "adminReply": "Olá! Obrigado por entrar em contato. Aqui estão mais informações..."
  }'
```

### TypeScript/JavaScript

```typescript
// Subscribe
const response = await fetch('http://localhost:3001/api/newsletter/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    metadata: { name: 'João' }
  })
});

const data = await response.json();
console.log(data);

// Check Status
const statusResponse = await fetch(
  'http://localhost:3001/api/newsletter/status/user@example.com'
);
const status = await statusResponse.json();
console.log(status.isSubscribed); // true ou false
```

---

## Integração com Mailchimp

### Setup

1. Criar conta Mailchimp: https://mailchimp.com
2. Obter API Key e List ID
3. Configurar `.env`:

```
EMAIL_PROVIDER=mailchimp
MAILCHIMP_API_KEY=xxxxxxxx-us1
MAILCHIMP_LIST_ID=abcdef1234
```

### Sincronização

A plataforma sincroniza automaticamente:
- Inscrições → Subscribe no Mailchimp
- Desinscrições → Unsubscribe no Mailchimp

### Tratamento de Bounces

Você pode configurar webhooks no Mailchimp para marcar emails como "bounced":

```bash
curl -X PATCH http://localhost:3001/api/newsletter/bounce \
  -H "Content-Type: application/json" \
  -d '{ "email": "invalid@example.com" }'
```

---

## Integração com SendGrid

### Setup

1. Criar conta SendGrid: https://sendgrid.com
2. Obter API Key
3. Configurar `.env`:

```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
```

### Webhooks

Configurar Event Webhooks no dashboard SendGrid para notificações de bounce/complaint.

---

## Production Checklist

- [ ] Usar `EMAIL_PROVIDER=sendgrid` ou `mailchimp` (não `local`)
- [ ] Configurar chaves de API
- [ ] Aumentar `RATE_LIMIT_MAX` se necessário
- [ ] Configurar `CONTACT_ADMIN_EMAILS` com email real
- [ ] Testar fluxo completo (subscribe → email → unsubscribe)
- [ ] Configurar webhooks de bounce/complaint
- [ ] Fazer backup regular do banco
- [ ] Monitorar rate limit em produção

---

## Troubleshooting

### "Este email já está inscrito"

Email já existe na lista. Opções:
- Fazer logout/login
- Usar email diferente
- Contato admin para remover

### Email não recebido

- Verificar `EMAIL_PROVIDER` (não está em `local`)
- Verificar chaves de API
- Verificar spam folder
- Logs do servidor

### Rate limit atingido

- Esperar 24 horas (para newsletter/contact)
- Usar token de admin (para bypass)
- Admin fazer requisição com Bearer token

---

## Arquivos Criados

```
server/src/
├── services/
│   ├── emailService.ts          # Serviço abstrato de email
│   ├── emailTemplates.ts        # Templates de emails
│   ├── newsletterService.ts     # Lógica de newsletter
│   └── contactFormService.ts    # Lógica de contact forms
├── controllers/
│   ├── newsletterController.ts  # Endpoints newsletter
│   └── contactFormController.ts # Endpoints contact
├── routes/
│   ├── newsletter.ts            # Rotas newsletter
│   └── contact.ts               # Rotas contact
├── middleware/
│   └── rateLimiters.ts          # Rate limiters específicos
└── scripts/migrations/
    └── 002_newsletter_contact.sql # Migrations

server/
└── .env.example                 # Exemplo de configuração
```

---

## Próximas Melhorias

- [ ] Webhooks de Mailchimp/SendGrid para bounce handling
- [ ] Agendador de newsletters (cron jobs)
- [ ] Templates personalizáveis por admin
- [ ] WYSIWYG editor para admin criar newsletters
- [ ] A/B testing de subject lines
- [ ] Analytics de abertura de emails
- [ ] Segmentação de subscribers
- [ ] Automação de sequences

