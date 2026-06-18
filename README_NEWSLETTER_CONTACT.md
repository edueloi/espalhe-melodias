# Newsletter & Contact Forms — Setup & Reference

## 🚀 3-Step Setup

```bash
# 1. Configure environment
cp server/.env.example server/.env

# 2. Run migrations
npm run migrate

# 3. Start development server
npm run dev:back
```

## 📧 Email Providers

### Development (Console Output)
```env
EMAIL_PROVIDER=local  # Default, no configuration needed
```

### SendGrid (Production)
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
```

### Mailchimp (Production)
```env
EMAIL_PROVIDER=mailchimp
MAILCHIMP_API_KEY=xxxxx-us1
MAILCHIMP_LIST_ID=xxxxx
```

## 🔌 API Quick Reference

### Newsletter

| Endpoint | Method | Rate Limit | Auth |
|----------|--------|-----------|------|
| `/api/newsletter/subscribe` | POST | 1/day | - |
| `/api/newsletter/unsubscribe` | POST | - | - |
| `/api/newsletter/status/:email` | GET | - | - |
| `/api/newsletter/subscribers` | GET | 5/min | ✓ |
| `/api/newsletter/export` | GET | 5/min | ✓ |
| `/api/newsletter/send` | POST | 5/min | ✓ |

### Contact Forms

| Endpoint | Method | Rate Limit | Auth |
|----------|--------|-----------|------|
| `/api/contact/messages` | POST | 3/day | - |
| `/api/contact/messages/:id` | GET | - | - |
| `/api/contact/admin/messages` | GET | 5/min | ✓ |
| `/api/contact/admin/messages/:id/status` | PUT | 5/min | ✓ |
| `/api/contact/admin/messages/:id/reply` | POST | 5/min | ✓ |
| `/api/contact/admin/export` | GET | 5/min | ✓ |
| `/api/contact/admin/stats` | GET | 5/min | ✓ |

## 📝 Example: Subscribe

```bash
curl -X POST http://localhost:3001/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "metadata": {"name": "João"}
  }'
```

Response:
```json
{
  "success": true,
  "message": "Inscrição realizada com sucesso!",
  "subscriber": {
    "id": "uuid",
    "email": "user@example.com",
    "status": "subscribed"
  }
}
```

## 📝 Example: Contact Form

```bash
curl -X POST http://localhost:3001/api/contact/messages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 99999-9999",
    "subject": "Dúvida sobre membership",
    "message": "Gostaria de saber mais sobre a plataforma..."
  }'
```

Response:
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso!",
  "contact": {
    "id": "uuid",
    "status": "new"
  }
}
```

## 🔐 Admin: Login & Get Token

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@espalhe-melodias.com","password":"password"}'
```

Copy the `token` from response, then use for admin endpoints:

```bash
curl http://localhost:3001/api/newsletter/subscribers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🧪 Validation Rules

| Field | Rules |
|-------|-------|
| Email | Valid email, max 255 chars |
| Phone | 10-11 digits (Brazil), formatted |
| Subject | 5-200 characters |
| Message | 10-5000 characters |
| Name | 3-100 characters |

## 🛡️ Spam Detection

Messages rejected if:
- More than 3 URLs
- 2+ spam keywords (bitcoin, viagra, casino, etc)
- Excessive character repetition

## 📚 Full Documentation

- **[QUICK_START.md](./QUICK_START.md)** — Quick reference
- **[NEWSLETTER_CONTACT_GUIDE.md](./NEWSLETTER_CONTACT_GUIDE.md)** — Complete guide (5000+ words)
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** — Technical overview
- **[server/examples/newsletter-contact.http](./server/examples/newsletter-contact.http)** — 30+ HTTP examples

## 🧪 Run Tests

```bash
npm test -- newsletter-contact.test.ts
```

## 📱 React Example

```typescript
async function subscribe(email: string) {
  const res = await fetch('/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await res.json();
  if (data.success) {
    console.log('Subscribed!');
  } else {
    console.error(data.message);
  }
}
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Database error | Run `npm run migrate` |
| Email not sent | Check `EMAIL_PROVIDER` in .env |
| Rate limit | Wait 24h or use admin token |
| Invalid email | Check email format (user@domain.com) |

## 📧 Email Templates Included

1. **Welcome Newsletter** — Sent on subscribe
2. **Unsubscribe Confirmation** — Sent on unsubscribe
3. **Contact Form Confirmation** — Sent to user
4. **Admin Notification** — Sent to admin
5. **Admin Reply** — Reply to user
6. **Weekly Digest** — Optional newsletter

## 🔑 Environment Variables

```env
# Email
EMAIL_PROVIDER=local              # local, sendgrid, mailchimp
EMAIL_FROM=noreply@espalhe-melodias.com
EMAIL_FROM_NAME=Espalhe Melodias

# SendGrid
SENDGRID_API_KEY=

# Mailchimp
MAILCHIMP_API_KEY=
MAILCHIMP_LIST_ID=

# Contact Form
CONTACT_ADMIN_EMAILS=admin@example.com
```

## 📊 Database Tables

**newsletter_subscribers**
- id, email, status, subscribedAt, unsubscribedAt, lastEmailSentAt, metadata

**contact_messages**
- id, name, email, phone, subject, message, status, adminReply, respondedAt, createdAt, updatedAt

## ✅ Files Created

- `server/src/services/emailService.ts` — Email abstraction
- `server/src/services/emailTemplates.ts` — HTML templates
- `server/src/services/newsletterService.ts` — Newsletter logic
- `server/src/services/contactFormService.ts` — Contact form logic
- `server/src/controllers/newsletterController.ts` — Endpoints
- `server/src/controllers/contactFormController.ts` — Endpoints
- `server/src/routes/newsletter.ts` — Routes
- `server/src/routes/contact.ts` — Routes
- `server/src/middleware/rateLimiters.ts` — Rate limiting
- `server/src/scripts/migrations/002_newsletter_contact.sql` — DB schema
- `server/.env.example` — Environment template
- `server/examples/newsletter-contact.http` — HTTP examples
- Plus 4 documentation files (5000+ words total)

---

**For complete documentation, see [NEWSLETTER_CONTACT_GUIDE.md](./NEWSLETTER_CONTACT_GUIDE.md)**
