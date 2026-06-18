# Instagram API Integration — Testing Guide

**Data**: 18 de Junho de 2026

---

## 📋 Quick Start Testing

### 1. Validar Credenciais Meta

Antes de qualquer coisa, você precisa obter:
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`
- `INSTAGRAM_ACCESS_TOKEN`

Siga as instruções em [INSTAGRAM_API_SETUP.md](INSTAGRAM_API_SETUP.md) — seção "Instagram Credentials Setup"

### 2. Adicionar ao .env

```bash
# Abra C:\Users\Eduardo\Desktop\espalhe-melodias\.env e adicione:

INSTAGRAM_BUSINESS_ACCOUNT_ID=17841405793139210
INSTAGRAM_ACCESS_TOKEN=IGQWRf...seu_token...
INSTAGRAM_CACHE_TTL=3600
INSTAGRAM_API_VERSION=v18.0
```

### 3. Iniciar Server

```bash
cd C:\Users\Eduardo\Desktop\espalhe-melodias\server

# Instalar dependências (se necessário)
npm install

# Iniciar em modo desenvolvimento
npm run dev

# Você deve ver:
# [Instagram] Health check endpoint listening on port 3001
```

### 4. Testar Health Check

```bash
curl http://localhost:3001/api/instagram/health
```

**Esperado** (200 OK):
```json
{
  "success": true,
  "status": "HEALTHY",
  "message": "Instagram integration is working",
  "account": {
    "username": "espalhe_melodias",
    "followers": 5240,
    "posts": 142
  },
  "timestamp": "2026-06-18T10:35:22.123Z"
}
```

**Error** (500 - Misconfigured):
```json
{
  "success": false,
  "status": "MISCONFIGURED",
  "message": "Instagram API credentials not configured",
  "details": {
    "hasAccountId": false,
    "hasAccessToken": true
  }
}
```

---

## 🧪 Testes por Endpoint

### Teste 1: Obter Feed (9 posts)

```bash
curl -X GET "http://localhost:3001/api/instagram/feed"
```

**Esperado** (200 OK):
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "18016547395262849",
        "caption": "Novo projeto de musicalização em escolas públicas! 🎵",
        "media_type": "IMAGE",
        "media_url": "https://instagram.fbcdn.net/...",
        "like_count": 342,
        "comments_count": 28,
        "timestamp": "2026-06-18T10:30:00+0000",
        "permalink": "https://www.instagram.com/p/ABC123/"
      },
      {
        "id": "18016547395262850",
        "caption": "Workshop de solfejo para crianças",
        "media_type": "IMAGE",
        "media_url": "https://instagram.fbcdn.net/...",
        "like_count": 215,
        "comments_count": 12,
        "timestamp": "2026-06-17T14:15:00+0000",
        "permalink": "https://www.instagram.com/p/ABC124/"
      }
      // ... 7 mais posts
    ],
    "stats": {
      "username": "espalhe_melodias",
      "name": "Espalhe Melodias",
      "biography": "Plataforma de comunidade para músicos 🎼",
      "profile_picture_url": "https://instagram.fbcdn.net/...",
      "website": "https://espalhemelodias.com",
      "followers_count": 5240,
      "media_count": 142,
      "ig_id": "17841405793139210"
    },
    "fetchedAt": "2026-06-18T10:35:22.123Z"
  }
}
```

---

### Teste 2: Obter Feed com Limite Customizado

```bash
# Pegar apenas 3 posts
curl -X GET "http://localhost:3001/api/instagram/feed?limit=3"

# Pegar 15 posts
curl -X GET "http://localhost:3001/api/instagram/feed?limit=15"

# Máximo permitido: 25
curl -X GET "http://localhost:3001/api/instagram/feed?limit=25"
```

---

### Teste 3: Testar Cache

```bash
# Primeira chamada (deve vir da API, mais lenta)
time curl http://localhost:3001/api/instagram/feed

# Segunda chamada (deve vir do cache, muito mais rápida)
time curl http://localhost:3001/api/instagram/feed

# Bypass cache
curl http://localhost:3001/api/instagram/feed?cache=false
```

**Esperado no console do servidor**:
```
[Instagram] Fetching feed from API (limit=9)...
[Instagram] Received 9 posts from API
[Instagram] Feed cached for 3600s

# Segunda chamada:
[Instagram] Cache hit for feed
```

---

### Teste 4: Obter Stories

```bash
curl -X GET "http://localhost:3001/api/instagram/stories"
```

**Esperado** (200 OK):
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "18099999999999999",
        "media_type": "IMAGE",
        "media_url": "https://instagram.fbcdn.net/...",
        "timestamp": "2026-06-18T14:20:00+0000"
      }
      // ... mais 2 stories
    ],
    "stats": {
      // ... mesmos dados de stats
    },
    "fetchedAt": "2026-06-18T10:35:22.123Z"
  }
}
```

**Possível Error** (500 - Se stories não estão habilitadas):
```json
{
  "success": false,
  "error": "Instagram stories not available",
  "code": "INSTAGRAM_API_ERROR",
  "message": "HTTP 404: Stories feature not available for this account."
}
```

---

### Teste 5: Obter Estatísticas

```bash
curl -X GET "http://localhost:3001/api/instagram/stats"
```

**Esperado** (200 OK):
```json
{
  "success": true,
  "data": {
    "ig_id": "17841405793139210",
    "username": "espalhe_melodias",
    "name": "Espalhe Melodias",
    "biography": "Plataforma de comunidade para músicos 🎼",
    "website": "https://espalhemelodias.com",
    "profile_picture_url": "https://instagram.fbcdn.net/...",
    "followers_count": 5240,
    "media_count": 142
  }
}
```

---

### Teste 6: Verificar Status do Cache (Debug)

```bash
curl -X GET "http://localhost:3001/api/instagram/cache-status"
```

**Esperado** (200 OK):
```json
{
  "success": true,
  "data": {
    "instagram_feed": {
      "cached": true,
      "expired": false,
      "expiresIn": 3598500
    },
    "instagram_stories": {
      "cached": true,
      "expired": false,
      "expiresIn": 3597800
    },
    "instagram_stats": {
      "cached": true,
      "expired": false,
      "expiresIn": 3597400
    }
  },
  "timestamp": "2026-06-18T10:35:22.123Z"
}
```

---

### Teste 7: Invalidar Cache (Admin)

Primeiro, você precisa gerar um JWT token. Assuma que você já fez login:

```bash
# 1. Fazer login (use credenciais existentes)
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your_password"}'

# Resposta contém um "token"
# {
#   "success": true,
#   "user": {...},
#   "token": "eyJhbGciOiJIUzI1NiIs..."
# }

# 2. Usar esse token para invalidar cache
JWT_TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Invalidar apenas feed
curl -X POST "http://localhost:3001/api/instagram/invalidate-cache" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "instagram_feed"}'

# Resposta:
# {
#   "success": true,
#   "message": "Cache key 'instagram_feed' invalidated",
#   "timestamp": "2026-06-18T10:35:22.123Z"
# }

# Invalidar tudo
curl -X POST "http://localhost:3001/api/instagram/invalidate-cache" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"

# Resposta:
# {
#   "success": true,
#   "message": "All Instagram cache invalidated",
#   "timestamp": "2026-06-18T10:35:22.123Z"
# }
```

**Esperado no console do servidor**:
```
[Instagram] Cache key 'instagram_feed' invalidated
```

---

## ⚠️ Troubleshooting

### "Instagram API credentials not configured"

**Causa**: `.env` faltando credenciais

**Solução**:
1. Abra `.env` na raiz do projeto
2. Adicione:
   ```
   INSTAGRAM_BUSINESS_ACCOUNT_ID=...
   INSTAGRAM_ACCESS_TOKEN=...
   ```
3. Reinicie o servidor

### "HTTP 401: Unauthorized"

**Causa**: Access token expirado ou inválido

**Solução**:
1. Acesse [Meta Developers Console](https://developers.facebook.com)
2. Vá para seu App
3. Gere um novo token
4. Atualize `.env`
5. Reinicie servidor

### "HTTP 404: User Not Found"

**Causa**: Business Account ID incorreto

**Solução**:
1. Acesse [Instagram Insights](https://business.instagram.com)
2. Copie o ID correto da conta
3. Atualize `.env`
4. Reinicie servidor

### "HTTP 429: Too Many Requests"

**Causa**: Rate limit do Instagram atingido

**Solução**:
- Aumente `INSTAGRAM_CACHE_TTL` em `.env`
- Aguarde antes de fazer novas requests
- Implemente exponential backoff se necessário

### "TypeError: Cannot read property 'data' of undefined"

**Causa**: Response da API foi inválida

**Solução**:
1. Valide as credenciais novamente
2. Verifique se a conta é Business Account (não pessoal)
3. Verifique nos logs do servidor: `[Instagram] API Error`

---

## 🔄 Testing Workflow Completo

```bash
# 1. Verificar credenciais
curl http://localhost:3001/api/instagram/health

# 2. Primeira request (sem cache)
time curl http://localhost:3001/api/instagram/feed?cache=false

# 3. Segunda request (com cache)
time curl http://localhost:3001/api/instagram/feed

# 4. Verificar status do cache
curl http://localhost:3001/api/instagram/cache-status

# 5. Invalidar cache
curl -X POST http://localhost:3001/api/instagram/invalidate-cache \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "instagram_feed"}'

# 6. Verificar cache foi limpo
curl http://localhost:3001/api/instagram/cache-status

# 7. Request novamente (deve vir da API)
time curl http://localhost:3001/api/instagram/feed
```

---

## 📊 Métricas Esperadas

### Performance

| Operação | Sem Cache | Com Cache | Melhoria |
|----------|-----------|-----------|----------|
| GET /feed | ~800ms | ~2ms | 400x mais rápido |
| GET /stats | ~300ms | ~1ms | 300x mais rápido |
| GET /stories | ~500ms | ~1ms | 500x mais rápido |

### Rate Limits do Instagram

- **Rate Limit**: 200 chamadas por hora por token
- **Com Cache 1h**: Efetivamente unlimited (1 chamada/hora)

---

## ✅ Checklist Final

- [ ] `.env` tem credenciais válidas
- [ ] Server inicia sem erros
- [ ] `/api/instagram/health` retorna `HEALTHY`
- [ ] `/api/instagram/feed` retorna posts
- [ ] Cache está funcionando (2ª request é rápida)
- [ ] `/api/instagram/invalidate-cache` requer token JWT
- [ ] Todos os endpoints retornam formato JSON esperado

---

**Pronto para integração com frontend!** 🚀
