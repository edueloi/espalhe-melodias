# Quick Start — Newsletter & Contact Forms

## 1️⃣ Setup (5 minutos)

```bash
# Copiar configurações
cp server/.env.example server/.env

# Editar .env com seus valores (ou deixar 'local' para dev)
nano server/.env
  # EMAIL_PROVIDER=local (development) ou sendgrid/mailchimp

# Executar migrations
npm run migrate
```

## 2️⃣ Iniciar

```bash
# Terminal 1: Backend
npm run dev:back

# Terminal 2: Frontend (se necessário)
npm run dev:front
```

## 3️⃣ Testar Newsletter

```bash
# Subscribe
curl -X POST http://localhost:3001/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check status
curl http://localhost:3001/api/newsletter/status/test@example.com

# Unsubscribe
curl -X POST http://localhost:3001/api/newsletter/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 4️⃣ Testar Contact Form

```bash
# Submit message
curl -X POST http://localhost:3001/api/contact/messages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "subject": "Dúvida",
    "message": "Gostaria de saber mais sobre a plataforma..."
  }'

# Get message (com UUID retornado)
curl http://localhost:3001/api/contact/messages/UUID
```

## 5️⃣ Admin Operations

```bash
# Login para obter token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Copy token da resposta

# List subscribers
curl http://localhost:3001/api/newsletter/subscribers \
  -H "Authorization: Bearer TOKEN"

# List contact messages
curl http://localhost:3001/api/contact/admin/messages \
  -H "Authorization: Bearer TOKEN"

# Respond to message
curl -X POST http://localhost:3001/api/contact/admin/messages/UUID/reply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"adminReply":"Olá! Obrigado por contatar..."}'

# Export subscribers
curl http://localhost:3001/api/newsletter/export \
  -H "Authorization: Bearer TOKEN" > subscribers.csv

# Export messages
curl http://localhost:3001/api/contact/admin/export \
  -H "Authorization: Bearer TOKEN" > messages.csv
```

## 📧 Email Providers

### Local (Development - default)
- Emails aparecem no console
- Nenhuma configuração necessária

### SendGrid
```bash
# .env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

### Mailchimp
```bash
# .env
EMAIL_PROVIDER=mailchimp
MAILCHIMP_API_KEY=xxxxx-us1
MAILCHIMP_LIST_ID=xxxxx
```

## 🔗 Endpoints Principais

| Método | Endpoint | Autenticação | Rate Limit |
|--------|----------|--------------|-----------|
| POST | `/api/newsletter/subscribe` | ❌ | 1/dia |
| POST | `/api/newsletter/unsubscribe` | ❌ | ✅ |
| GET | `/api/newsletter/status/:email` | ❌ | ✅ |
| GET | `/api/newsletter/subscribers` | ✅ Admin | 5/min |
| GET | `/api/newsletter/export` | ✅ Admin | 5/min |
| POST | `/api/newsletter/send` | ✅ Admin | 5/min |
| POST | `/api/contact/messages` | ❌ | 3/dia |
| GET | `/api/contact/messages/:id` | ❌ | ✅ |
| GET | `/api/contact/admin/messages` | ✅ Admin | 5/min |
| PUT | `/api/contact/admin/messages/:id/status` | ✅ Admin | 5/min |
| POST | `/api/contact/admin/messages/:id/reply` | ✅ Admin | 5/min |
| GET | `/api/contact/admin/export` | ✅ Admin | 5/min |
| GET | `/api/contact/admin/stats` | ✅ Admin | 5/min |

## 💾 Database

### Tables
- `newsletter_subscribers` — emails inscritos
- `contact_messages` — mensagens recebidas

### Views (Analytics)
- `newsletter_stats` — subscribers por status e data
- `contact_stats` — mensagens por status e data

```sql
-- Check stats
SELECT status, COUNT(*) FROM newsletter_subscribers GROUP BY status;
SELECT status, COUNT(*) FROM contact_messages GROUP BY status;

-- Export
SELECT email, status, subscribedAt FROM newsletter_subscribers;
SELECT name, email, subject, status FROM contact_messages;
```

## 📋 Validações Automáticas

```
Email:           Email válido (RFC 5322)
Telefone:        10-11 dígitos (Brasil), formatado como (XX) 9XXXX-XXXX
Subject:         5-200 caracteres
Mensagem:        10-5000 caracteres
Spam Detection:  Detecta múltiplas URLs, keywords suspeitas, repetição
HTML Cleaning:   Remove <script> tags e event handlers
```

## 🚨 Erros Comuns

| Erro | Solução |
|------|---------|
| `Email inválido` | Usar formato correto: user@example.com |
| `Este email já está inscrito` | Usar outro email ou desinscrever primeiro |
| `Muitas requisições` | Aguardar 24h ou usar conta de admin |
| `Email não recebido` | Verificar spam folder ou usar EMAIL_PROVIDER real |
| `Database error` | Rodar `npm run migrate` |

## 📚 Documentação Completa

- **[NEWSLETTER_CONTACT_GUIDE.md](./NEWSLETTER_CONTACT_GUIDE.md)** — Documentação detalhada (5000+ palavras)
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** — Resumo técnico
- **[server/examples/newsletter-contact.http](./server/examples/newsletter-contact.http)** — 30+ exemplos HTTP

## 🧪 Testes

```bash
# Rodar testes (requer Jest)
npm test -- newsletter-contact.test.ts

# Testes cobrem:
# ✓ Newsletter subscribe/unsubscribe/status
# ✓ Contact form validação e spam detection
# ✓ Rate limiting
# ✓ Admin operations
# ✓ Casos de erro
```

## 🎨 Frontend — Exemplo React

```tsx
import { useState } from 'react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.success) {
        setMessage('✅ Inscrito com sucesso!');
        setEmail('');
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage('❌ Erro ao enviar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="newsletter-form">
      <input
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Inscrevendo...' : 'Inscrever'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

## 🔒 Segurança

- ✅ Validação de input
- ✅ Rate limiting por IP
- ✅ XSS prevention (HTML sanitization)
- ✅ Autenticação JWT para admin
- ✅ CORS configurado
- ✅ Spam detection

## 📞 Contato

Para suporte ou dúvidas:
1. Consultar documentação: `NEWSLETTER_CONTACT_GUIDE.md`
2. Verificar exemplos: `server/examples/newsletter-contact.http`
3. Rodar testes: `npm test`

---

**Você está pronto para enviar newsletters e processar contact forms! 🚀**
