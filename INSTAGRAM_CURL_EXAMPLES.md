# Instagram API — cURL Examples & Real Responses

**Data**: 18 de Junho de 2026

---

## 🔗 Complete cURL Testing Suite

### Setup

```bash
# 1. Salve suas credenciais como variáveis de ambiente
export API_URL="http://localhost:3001"

# 2. Para endpoints que requerem JWT, primeiro faça login:
# Substitua com seus dados reais
export JWT_TOKEN="seu_token_aqui"

# Ou gere um novo:
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }' | jq '.token'

# Salve o token:
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

---

## 📋 Test Suite Completa

### 1. Health Check (Sem autenticação)

```bash
curl -X GET "$API_URL/api/instagram/health"
```

**Response esperado (200 OK)**:
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

**Salve em arquivo**:
```bash
curl -X GET "$API_URL/api/instagram/health" | jq . > health_response.json
```

---

### 2. Obter Feed (9 posts)

```bash
# Sem parâmetros (padrão: 9 posts)
curl -X GET "$API_URL/api/instagram/feed"

# Com limite customizado
curl -X GET "$API_URL/api/instagram/feed?limit=15"

# Sem cache (força API)
curl -X GET "$API_URL/api/instagram/feed?cache=false"

# Salvar resposta formatada
curl -X GET "$API_URL/api/instagram/feed" | jq . > feed_response.json
```

**Response esperado (200 OK)**:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "18016547395262849",
        "caption": "Novo projeto de musicalização em escolas públicas! 🎵\n\nEstamos muito felizes em anunciar nossa nova iniciativa...",
        "media_type": "IMAGE",
        "media_url": "https://instagram.fbcdn.net/v/t51.2885-15/318762940_...",
        "like_count": 342,
        "comments_count": 28,
        "timestamp": "2026-06-18T10:30:00+0000",
        "permalink": "https://www.instagram.com/p/ABC123DEF/"
      },
      {
        "id": "18016547395262850",
        "caption": "Workshop de solfejo para crianças de 6-10 anos",
        "media_type": "IMAGE",
        "media_url": "https://instagram.fbcdn.net/v/t51.2885-15/318962941_...",
        "like_count": 215,
        "comments_count": 12,
        "timestamp": "2026-06-17T14:15:00+0000",
        "permalink": "https://www.instagram.com/p/ABC124DEF/"
      },
      {
        "id": "18016547395262851",
        "caption": "Vídeo: Aula de piano ao vivo",
        "media_type": "VIDEO",
        "media_url": "https://instagram.fbcdn.net/v/t50.2886-16/...",
        "thumbnail_url": "https://instagram.fbcdn.net/v/t51.2885-15/...",
        "like_count": 487,
        "comments_count": 45,
        "timestamp": "2026-06-16T09:00:00+0000",
        "permalink": "https://www.instagram.com/p/ABC125DEF/"
      },
      {
        "id": "18016547395262852",
        "caption": "Carrossel: 5 dicas para melhorar seu carisma ao cantar",
        "media_type": "CAROUSEL",
        "media_url": "https://instagram.fbcdn.net/v/t51.2885-15/...",
        "like_count": 623,
        "comments_count": 67,
        "timestamp": "2026-06-15T16:30:00+0000",
        "permalink": "https://www.instagram.com/p/ABC126DEF/"
      },
      {
        "id": "18016547395262853",
        "caption": "Inscrições abertas para a 3ª turma de teoria musical!",
        "media_type": "IMAGE",
        "media_url": "https://instagram.fbcdn.net/v/t51.2885-15/...",
        "like_count": 156,
        "comments_count": 19,
        "timestamp": "2026-06-14T11:20:00+0000",
        "permalink": "https://www.instagram.com/p/ABC127DEF/"
      },
      {
        "id": "18016547395262854",
        "caption": "Live: Conversa com maestro renomado",
        "media_type": "VIDEO",
        "media_url": "https://instagram.fbcdn.net/v/t50.2886-16/...",
        "like_count": 892,
        "comments_count": 103,
        "timestamp": "2026-06-13T19:00:00+0000",
        "permalink": "https://www.instagram.com/p/ABC128DEF/"
      },
      {
        "id": "18016547395262855",
        "caption": "Recital de alunos - Apresentações incríveis!",
        "media_type": "IMAGE",
        "media_url": "https://instagram.fbcdn.net/v/t51.2885-15/...",
        "like_count": 534,
        "comments_count": 76,
        "timestamp": "2026-06-12T15:45:00+0000",
        "permalink": "https://www.instagram.com/p/ABC129DEF/"
      },
      {
        "id": "18016547395262856",
        "caption": "Conheça nosso novo aplicativo mobile!",
        "media_type": "IMAGE",
        "media_url": "https://instagram.fbcdn.net/v/t51.2885-15/...",
        "like_count": 421,
        "comments_count": 52,
        "timestamp": "2026-06-11T10:00:00+0000",
        "permalink": "https://www.instagram.com/p/ABC130DEF/"
      },
      {
        "id": "18016547395262857",
        "caption": "Dica do dia: Como manter a motivação nos estudos musicais",
        "media_type": "IMAGE",
        "media_url": "https://instagram.fbcdn.net/v/t51.2885-15/...",
        "like_count": 289,
        "comments_count": 34,
        "timestamp": "2026-06-10T13:30:00+0000",
        "permalink": "https://www.instagram.com/p/ABC131DEF/"
      }
    ],
    "stats": {
      "username": "espalhe_melodias",
      "name": "Espalhe Melodias",
      "biography": "Plataforma de comunidade para músicos 🎼\nCursos online | Conexões | Oportunidades\nSiga para não perder nenhuma novidade!",
      "profile_picture_url": "https://instagram.fbcdn.net/v/t51.2885-19/s150x150/...",
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

### 3. Obter Stories (3 últimas)

```bash
# Stories padrão (3)
curl -X GET "$API_URL/api/instagram/stories"

# Stories customizado
curl -X GET "$API_URL/api/instagram/stories?limit=5"

# Salvar resposta
curl -X GET "$API_URL/api/instagram/stories" | jq . > stories_response.json
```

**Response esperado (200 OK)**:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "18099999999999999",
        "media_type": "IMAGE",
        "media_url": "https://instagram.fbcdn.net/v/t51.3050-15/s1080x1080/...",
        "timestamp": "2026-06-18T14:20:00+0000"
      },
      {
        "id": "18099999999999998",
        "media_type": "IMAGE",
        "media_url": "https://instagram.fbcdn.net/v/t51.3050-15/s1080x1080/...",
        "timestamp": "2026-06-18T12:15:00+0000"
      },
      {
        "id": "18099999999999997",
        "media_type": "VIDEO",
        "media_url": "https://instagram.fbcdn.net/v/t50.2886-16/...",
        "timestamp": "2026-06-18T08:45:00+0000"
      }
    ],
    "stats": {
      "username": "espalhe_melodias",
      "name": "Espalhe Melodias",
      "biography": "Plataforma de comunidade para músicos 🎼",
      "profile_picture_url": "https://instagram.fbcdn.net/v/t51.2885-19/s150x150/...",
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

### 4. Obter Estatísticas

```bash
# Stats simples
curl -X GET "$API_URL/api/instagram/stats"

# Com pretty print
curl -X GET "$API_URL/api/instagram/stats" | jq .

# Salvar em arquivo
curl -X GET "$API_URL/api/instagram/stats" | jq . > stats_response.json
```

**Response esperado (200 OK)**:
```json
{
  "success": true,
  "data": {
    "ig_id": "17841405793139210",
    "username": "espalhe_melodias",
    "name": "Espalhe Melodias",
    "biography": "Plataforma de comunidade para músicos 🎼\nCursos online | Conexões | Oportunidades",
    "website": "https://espalhemelodias.com",
    "profile_picture_url": "https://instagram.fbcdn.net/v/t51.2885-19/s150x150/321234567_...",
    "followers_count": 5240,
    "media_count": 142
  }
}
```

---

### 5. Verificar Cache Status

```bash
# Ver status do cache (debug)
curl -X GET "$API_URL/api/instagram/cache-status"

# Com formatting
curl -X GET "$API_URL/api/instagram/cache-status" | jq .
```

**Response esperado (200 OK)**:
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

### 6. Invalidar Cache (Admin - Requer JWT)

```bash
# Primeiro, obtenha um JWT token (fazer login)
JWT_TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }' | jq -r '.token')

# Invalidar feed
curl -X POST "$API_URL/api/instagram/invalidate-cache" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "instagram_feed"}'

# Invalidar stories
curl -X POST "$API_URL/api/instagram/invalidate-cache" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "instagram_stories"}'

# Invalidar stats
curl -X POST "$API_URL/api/instagram/invalidate-cache" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "instagram_stats"}'

# Limpar TODO cache
curl -X POST "$API_URL/api/instagram/invalidate-cache" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response esperado (200 OK)**:
```json
{
  "success": true,
  "message": "Cache key 'instagram_feed' invalidated",
  "timestamp": "2026-06-18T10:35:22.123Z"
}
```

---

## 🔴 Error Response Examples

### 401 Unauthorized (Invalid Token)

```bash
curl -X POST "$API_URL/api/instagram/invalidate-cache" \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (401)**:
```json
{
  "success": false,
  "message": "Unauthorized",
  "code": "INVALID_TOKEN"
}
```

---

### 500 Error (Misconfigured Credentials)

```bash
# Se INSTAGRAM_BUSINESS_ACCOUNT_ID não estiver configurado
curl -X GET "$API_URL/api/instagram/feed"
```

**Response (500)**:
```json
{
  "success": false,
  "error": "Failed to fetch Instagram feed",
  "code": "INSTAGRAM_API_ERROR",
  "message": "HTTP 404: The Instagram user could not be found."
}
```

---

### 500 Error (Invalid Access Token)

```bash
curl -X GET "$API_URL/api/instagram/stats"
```

**Response (500)**:
```json
{
  "success": false,
  "error": "Failed to fetch Instagram stats",
  "code": "INSTAGRAM_API_ERROR",
  "message": "HTTP 401: Invalid OAuth access token."
}
```

---

### 500 Error (Rate Limited)

```bash
curl -X GET "$API_URL/api/instagram/feed?cache=false" \
  # (executado 201 vezes em 1 hora)
```

**Response (500)**:
```json
{
  "success": false,
  "error": "Failed to fetch Instagram feed",
  "code": "INSTAGRAM_API_ERROR",
  "message": "HTTP 429: Too many requests. Please try again later."
}
```

---

## 🧪 Testing Script (Bash)

```bash
#!/bin/bash

# instagram_test.sh
# Script para testar todos os endpoints

set -e

API_URL="${API_URL:-http://localhost:3001}"

echo "🧪 Testing Instagram API Integration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Health Check
echo "1. Testing Health Check..."
curl -s "$API_URL/api/instagram/health" | jq .

# 2. Feed
echo -e "\n2. Testing Feed (9 posts)..."
curl -s "$API_URL/api/instagram/feed" | jq '.data | {
  post_count: (.posts | length),
  first_post: .posts[0].caption,
  stats: .stats | {username, followers_count}
}'

# 3. Feed (Custom limit)
echo -e "\n3. Testing Feed (3 posts)..."
curl -s "$API_URL/api/instagram/feed?limit=3" | jq '.data.posts | length'

# 4. Cache Test
echo -e "\n4. Testing Cache Hit/Miss..."
echo "First request (API):"
time curl -s "$API_URL/api/instagram/feed" > /dev/null
echo "Second request (Cache):"
time curl -s "$API_URL/api/instagram/feed" > /dev/null

# 5. Stats
echo -e "\n5. Testing Stats..."
curl -s "$API_URL/api/instagram/stats" | jq '.data | {
  username,
  followers: .followers_count,
  posts: .media_count
}'

# 6. Cache Status
echo -e "\n6. Testing Cache Status..."
curl -s "$API_URL/api/instagram/cache-status" | jq '.data'

echo -e "\n✅ All tests completed!"
```

**Executar**:
```bash
chmod +x instagram_test.sh
./instagram_test.sh
```

---

## 📊 Performance Comparison

```bash
# Teste sem cache vs com cache
echo "WITHOUT CACHE:"
time curl -s "$API_URL/api/instagram/feed?cache=false" > /dev/null

echo "WITH CACHE:"
time curl -s "$API_URL/api/instagram/feed" > /dev/null

# Resultado esperado:
# WITHOUT CACHE: ~0.8s
# WITH CACHE:    ~0.002s
# SPEEDUP:       ~400x
```

---

## 💾 Salvando Responses em Arquivo

```bash
# Salvar todas as respostas
mkdir -p instagram_test_results

# Health
curl -s "$API_URL/api/instagram/health" | jq . > instagram_test_results/health.json

# Feed
curl -s "$API_URL/api/instagram/feed" | jq . > instagram_test_results/feed.json

# Stories
curl -s "$API_URL/api/instagram/stories" | jq . > instagram_test_results/stories.json

# Stats
curl -s "$API_URL/api/instagram/stats" | jq . > instagram_test_results/stats.json

# Cache Status
curl -s "$API_URL/api/instagram/cache-status" | jq . > instagram_test_results/cache_status.json

# Listar tudo
ls -lah instagram_test_results/
```

---

## ⚡ One-Liners Úteis

```bash
# Contar posts no feed
curl -s "$API_URL/api/instagram/feed" | jq '.data.posts | length'

# Obter todos os captions
curl -s "$API_URL/api/instagram/feed" | jq '.data.posts[].caption'

# Calcular engagement rate
curl -s "$API_URL/api/instagram/feed" | jq '
  .data | 
  {
    avg_likes: (.posts | map(.like_count) | add / length),
    avg_comments: (.posts | map(.comments_count) | add / length),
    total_engagement: (.posts | map(.like_count + .comments_count) | add)
  }
'

# Encontrar post com mais engajamento
curl -s "$API_URL/api/instagram/feed" | jq '
  .data.posts | 
  sort_by(.like_count + .comments_count) | 
  last | 
  {caption, likes: .like_count, comments: .comments_count}
'

# Listar permalinks para abrir no navegador
curl -s "$API_URL/api/instagram/feed" | jq -r '.data.posts[].permalink'
```

---

## 📌 Dicas

### Salvar como variável

```bash
FEED_DATA=$(curl -s "$API_URL/api/instagram/feed")
echo $FEED_DATA | jq '.data.stats.followers_count'
```

### Comparar responses

```bash
# Antes vs Depois
curl -s "$API_URL/api/instagram/stats" > before.json
# (fazer mudança no Instagram)
curl -s "$API_URL/api/instagram/stats" > after.json
diff before.json after.json
```

### Monitorar em tempo real

```bash
# Loop contínuo
while true; do
  echo "$(date): $(curl -s "$API_URL/api/instagram/stats" | jq '.data.followers_count') followers"
  sleep 300  # A cada 5 minutos
done
```

---

**Pronto para testar!** 🚀
