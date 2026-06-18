# Instagram API Integration — Espalhe Melodias

**Data**: 18 de Junho de 2026  
**Status**: 📋 Setup Guide & Implementation Instructions  
**Stack**: Node.js 22 + Express + TypeScript + Redis (optional)

---

## 📋 Índice

1. [Instagram Credentials Setup](#instagram-credentials-setup)
2. [Environment Variables](#environment-variables)
3. [Server Implementation](#server-implementation)
4. [API Endpoints](#api-endpoints)
5. [Response Examples](#response-examples)
6. [Cache Strategy](#cache-strategy)
7. [Testing Locally](#testing-locally)
8. [Error Handling](#error-handling)

---

## 🔐 Instagram Credentials Setup

### Passo 1: Criar Meta App

1. Acesse [Meta Developers Console](https://developers.facebook.com)
2. Clique em **"Criar App"** → Selecione **"Negócios"**
3. Preencha:
   - **App Name**: `Espalhe Melodias Instagram Feed`
   - **Contato de Email**: seu email
   - **Propósito**: Social Media Management
4. Clique em **"Criar App ID"**
5. Selecione **"Instagram Graph API"** como seu produto

### Passo 2: Obter Business Account ID & Access Token

#### Opção A: Instagram Business Account (Recomendado para Brands)

1. Na console, vá para **Ferramentas** → **Graph API Explorer**
2. No dropdown de app, selecione seu app
3. No dropdown de token, selecione **"Gerar Token de Acesso"**
4. Selecione seu Instagram Business Account
5. Altere o método para **GET** e a query para:
   ```
   GET /me
   ```
6. Clique em **Enviar**. Você verá algo como:
   ```json
   {
     "id": "17841405793139210",
     "username": "espalhe_melodias"
   }
   ```
   **Este é seu `INSTAGRAM_BUSINESS_ACCOUNT_ID`**

7. Para gerar um **Access Token permanente**:
   - Vá para **Configurações** → **Aplicativos e sites** → Seu App
   - Clique em **Gerar novo token**
   - Selecione **`instagram_basic,instagram_content_publishing,pages_read_engagement`**
   - Copie o token gerado: **Este é seu `INSTAGRAM_ACCESS_TOKEN`**

#### Opção B: Instagram Creator Account (Via Instagram App)

1. Abra seu Instagram
2. Vá para **Configurações** → **Apps e sites** → **Apps conectados**
3. Procure por seu app Espalhe Melodias
4. Autorize e copie o token fornecido

### Passo 3: Validar as Credenciais

Execute no terminal:

```bash
# Teste seu Business Account ID
curl -X GET "https://graph.instagram.com/v18.0/{INSTAGRAM_BUSINESS_ACCOUNT_ID}?fields=id,username,name,biography,website,profile_picture_url,followers_count,media_count&access_token={INSTAGRAM_ACCESS_TOKEN}"

# Resposta esperada:
{
  "id": "17841405793139210",
  "username": "espalhe_melodias",
  "name": "Espalhe Melodias",
  "biography": "Plataforma de comunidade...",
  "website": "https://espalhemelodias.com",
  "profile_picture_url": "https://...",
  "followers_count": 5240,
  "media_count": 142
}
```

---

## 🌍 Environment Variables

Adicione ao arquivo `.env` na raiz do projeto:

```bash
# ═══ Instagram API ═══════════════════════════════════════════════════════════
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841405793139210
INSTAGRAM_ACCESS_TOKEN=IGQWRf...
INSTAGRAM_CACHE_TTL=3600              # 1 hora em segundos
INSTAGRAM_API_VERSION=v18.0           # Versão atual da Meta Graph API

# ═══ Redis (opcional, para cache distribuído) ═════════════════════════════════
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true                    # true/false para ativar cache Redis
```

**NUNCA commite credenciais!** Adicione `.env` ao `.gitignore` (já deve estar).

---

## 🛠️ Server Implementation

### Arquivo 1: `server/src/models/instagram.ts`

```typescript
/**
 * Models & Types para integração Instagram API
 * Inclui interfaces para Posts, Stories, Stats
 */

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
  media_url: string;
  thumbnail_url?: string;
  like_count: number;
  comments_count: number;
  timestamp: string;
  permalink: string;
}

export interface InstagramStats {
  username: string;
  name: string;
  biography: string;
  profile_picture_url: string;
  website?: string;
  followers_count: number;
  media_count: number;
  ig_id: string;
}

export interface InstagramFeedResponse {
  success: boolean;
  data: {
    posts: InstagramMediaItem[];
    stats: InstagramStats;
    cacheExpiry?: number;
    fetchedAt: string;
  };
  error?: string;
}

export interface InstagramStatsResponse {
  success: boolean;
  data: InstagramStats;
  error?: string;
}

export interface InstagramErrorResponse {
  success: false;
  error: string;
  code: string;
  message: string;
}
```

### Arquivo 2: `server/src/services/instagramService.ts`

```typescript
/**
 * Service para integração com Instagram Graph API
 * Gerencia cache, fetch de dados, tratamento de erros
 */

import axios, { AxiosError } from 'axios';
import { config } from '../config';
import {
  InstagramMediaItem,
  InstagramStats,
  InstagramFeedResponse,
  InstagramStatsResponse,
  InstagramErrorResponse,
} from '../models/instagram';

class InstagramService {
  private readonly baseURL = `https://graph.instagram.com/${config.instagram.apiVersion}`;
  private readonly accountId = config.instagram.businessAccountId;
  private readonly accessToken = config.instagram.accessToken;
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  /**
   * Busca os últimos N posts do Instagram
   * @param limit Número de posts (default: 9)
   * @param useCache Usar cache se disponível (default: true)
   */
  async getFeed(limit: number = 9, useCache: boolean = true): Promise<InstagramFeedResponse> {
    const cacheKey = 'instagram_feed';

    // Verifica cache
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return { ...cached.data, cacheExpiry: cached.expiry };
      }
    }

    try {
      const url = `${this.baseURL}/${this.accountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,like_count,comments_count,timestamp,permalink&limit=${limit}&access_token=${this.accessToken}`;

      const response = await axios.get(url);
      const posts: InstagramMediaItem[] = response.data.data || [];

      // Busca stats
      const stats = await this.getStats();

      const feedData = {
        success: true,
        data: {
          posts,
          stats,
          fetchedAt: new Date().toISOString(),
        },
      };

      // Armazena em cache
      const cacheTTL = config.instagram.cacheTTL * 1000; // converte para ms
      this.cache.set(cacheKey, {
        data: feedData,
        expiry: Date.now() + cacheTTL,
      });

      return feedData;
    } catch (error) {
      return this.handleError(error, 'Failed to fetch Instagram feed');
    }
  }

  /**
   * Busca as 3 últimas stories (se disponível)
   * @param limit Número de stories (default: 3)
   */
  async getStories(limit: number = 3): Promise<InstagramFeedResponse> {
    const cacheKey = 'instagram_stories';

    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return { ...cached.data, cacheExpiry: cached.expiry };
    }

    try {
      const url = `${this.baseURL}/${this.accountId}/stories?fields=id,media_type,media_url,timestamp&limit=${limit}&access_token=${this.accessToken}`;

      const response = await axios.get(url);
      const stories: InstagramMediaItem[] = response.data.data || [];

      const stats = await this.getStats();

      const storiesData = {
        success: true,
        data: {
          posts: stories,
          stats,
          fetchedAt: new Date().toISOString(),
        },
      };

      const cacheTTL = config.instagram.cacheTTL * 1000;
      this.cache.set(cacheKey, {
        data: storiesData,
        expiry: Date.now() + cacheTTL,
      });

      return storiesData;
    } catch (error) {
      // Stories podem não estar disponível, retorna erro gracioso
      return this.handleError(error, 'Instagram stories not available');
    }
  }

  /**
   * Busca estatísticas da conta
   */
  async getStats(): Promise<InstagramStats> {
    const cacheKey = 'instagram_stats';

    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    try {
      const url = `${this.baseURL}/${this.accountId}?fields=id,username,name,biography,website,profile_picture_url,followers_count,media_count&access_token=${this.accessToken}`;

      const response = await axios.get(url);
      const stats: InstagramStats = {
        ig_id: response.data.id,
        username: response.data.username,
        name: response.data.name,
        biography: response.data.biography || '',
        website: response.data.website,
        profile_picture_url: response.data.profile_picture_url,
        followers_count: response.data.followers_count || 0,
        media_count: response.data.media_count || 0,
      };

      const cacheTTL = config.instagram.cacheTTL * 1000;
      this.cache.set(cacheKey, {
        data: stats,
        expiry: Date.now() + cacheTTL,
      });

      return stats;
    } catch (error) {
      console.error('Error fetching Instagram stats:', error);
      throw error;
    }
  }

  /**
   * Invalida o cache manualmente
   */
  invalidateCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Trata erros de forma consistente
   */
  private handleError(error: unknown, defaultMessage: string): InstagramErrorResponse {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;

      console.error(`Instagram API Error [${status}]:`, data);

      let errorMessage = defaultMessage;
      let errorCode = 'INSTAGRAM_API_ERROR';

      if (data?.error) {
        errorMessage = data.error.message || defaultMessage;
        errorCode = data.error.code || errorCode;
      }

      return {
        success: false,
        error: errorMessage,
        code: errorCode,
        message: `HTTP ${status}: ${errorMessage}`,
      };
    }

    return {
      success: false,
      error: defaultMessage,
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export const instagramService = new InstagramService();
```

### Arquivo 3: `server/src/controllers/instagramController.ts`

```typescript
/**
 * Controller para endpoints Instagram
 * Valida requests, chama service, retorna respostas
 */

import { Request, Response, NextFunction } from 'express';
import { instagramService } from '../services/instagramService';
import { config } from '../config';

/**
 * GET /api/instagram/feed
 * Retorna últimos 9 posts do Instagram
 * 
 * Query params:
 *   - limit: número de posts (1-25, default: 9)
 *   - cache: usar cache (true/false, default: true)
 */
export async function getInstagramFeed(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 9, 25);
    const useCache = req.query.cache !== 'false';

    const result = await instagramService.getFeed(limit, useCache);

    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/instagram/stories
 * Retorna últimas 3 stories do Instagram
 * 
 * Query params:
 *   - limit: número de stories (1-25, default: 3)
 *   - cache: usar cache (true/false, default: true)
 */
export async function getInstagramStories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 3, 25);

    const result = await instagramService.getStories(limit);

    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/instagram/stats
 * Retorna estatísticas da conta (followers, engagement, etc)
 */
export async function getInstagramStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await instagramService.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Instagram stats',
    });
    next(error);
  }
}

/**
 * POST /api/instagram/invalidate-cache
 * Invalida cache (admin only)
 * 
 * Body (opcional):
 *   - key: chave específica a invalidar (ex: 'instagram_feed')
 * 
 * Chaves disponíveis:
 *   - instagram_feed
 *   - instagram_stories
 *   - instagram_stats
 */
export async function invalidateInstagramCache(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validar que é admin (assumindo middleware de auth)
    const { key } = req.body;

    instagramService.invalidateCache(key);

    res.json({
      success: true,
      message: key
        ? `Cache key '${key}' invalidated`
        : 'All Instagram cache invalidated',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/instagram/health
 * Verifica se a integração está funcionando
 */
export async function checkInstagramHealth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const hasAccountId = !!config.instagram.businessAccountId;
    const hasAccessToken = !!config.instagram.accessToken;

    if (!hasAccountId || !hasAccessToken) {
      return res.status(500).json({
        success: false,
        status: 'MISCONFIGURED',
        message: 'Instagram API credentials not configured',
        details: {
          hasAccountId,
          hasAccessToken,
        },
      });
    }

    // Tenta fazer uma request para validar credenciais
    const stats = await instagramService.getStats();

    res.json({
      success: true,
      status: 'HEALTHY',
      message: 'Instagram integration is working',
      account: {
        username: stats.username,
        followers: stats.followers_count,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'ERROR',
      message: 'Instagram integration health check failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
```

### Arquivo 4: `server/src/routes/instagram.ts`

```typescript
/**
 * Rotas para Instagram API
 * GET /api/instagram/feed
 * GET /api/instagram/stories
 * GET /api/instagram/stats
 * POST /api/instagram/invalidate-cache (admin)
 * GET /api/instagram/health
 */

import { Router, Request, Response } from 'express';
import {
  getInstagramFeed,
  getInstagramStories,
  getInstagramStats,
  invalidateInstagramCache,
  checkInstagramHealth,
} from '../controllers/instagramController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public endpoints
router.get('/feed', getInstagramFeed);
router.get('/stories', getInstagramStories);
router.get('/stats', getInstagramStats);
router.get('/health', checkInstagramHealth);

// Admin endpoints
router.post('/invalidate-cache', authenticate, invalidateInstagramCache);

export default router;
```

### Arquivo 5: Atualizar `server/src/config/index.ts`

Adicione à seção de configuração:

```typescript
// Instagram API Configuration
export const instagramConfig = {
  businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '',
  accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
  cacheTTL: parseInt(process.env.INSTAGRAM_CACHE_TTL || '3600', 10), // 1 hora
  apiVersion: process.env.INSTAGRAM_API_VERSION || 'v18.0',
};

// Atualizar config export
export const config = {
  // ... configs existentes
  instagram: instagramConfig,
};
```

### Arquivo 6: Atualizar `server/src/server.ts`

Adicione a importação e rota:

```typescript
// Após as outras importações de rotas
import instagramRoutes from './routes/instagram';

// ─── Routes ───────────────────────────────────────────────────────────────────

// ... rotas existentes ...

app.use('/api/instagram', instagramRoutes);
```

---

## 🔌 API Endpoints

### 1️⃣ GET /api/instagram/feed

**Descrição**: Retorna os últimos posts do Instagram

**Query Parameters**:
- `limit` (opcional): 1-25, default: 9
- `cache` (opcional): true/false, default: true

**Request**:
```bash
curl -X GET "http://localhost:3001/api/instagram/feed?limit=9"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "18016547395262849",
        "caption": "Novo projeto de musicalização em escolas públicas! 🎵",
        "media_type": "IMAGE",
        "media_url": "https://instagram.com/...",
        "like_count": 342,
        "comments_count": 28,
        "timestamp": "2026-06-18T10:30:00+0000",
        "permalink": "https://instagram.com/p/ABC123/"
      }
      // ... mais 8 posts
    ],
    "stats": {
      "username": "espalhe_melodias",
      "name": "Espalhe Melodias",
      "biography": "Plataforma de comunidade para músicos",
      "profile_picture_url": "https://instagram.com/...",
      "website": "https://espalhemelodias.com",
      "followers_count": 5240,
      "media_count": 142,
      "ig_id": "17841405793139210"
    },
    "fetchedAt": "2026-06-18T10:35:22.123Z",
    "cacheExpiry": 1718705722123
  }
}
```

---

### 2️⃣ GET /api/instagram/stories

**Descrição**: Retorna as últimas stories (se disponível)

**Query Parameters**:
- `limit` (opcional): 1-25, default: 3

**Request**:
```bash
curl -X GET "http://localhost:3001/api/instagram/stories?limit=3"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "18099999999999999",
        "media_type": "IMAGE",
        "media_url": "https://instagram.com/...",
        "timestamp": "2026-06-18T14:20:00+0000"
      }
      // ... mais 2 stories
    ],
    "stats": {
      // ... same as feed
    },
    "fetchedAt": "2026-06-18T10:35:22.123Z"
  }
}
```

---

### 3️⃣ GET /api/instagram/stats

**Descrição**: Retorna apenas estatísticas da conta

**Request**:
```bash
curl -X GET "http://localhost:3001/api/instagram/stats"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "ig_id": "17841405793139210",
    "username": "espalhe_melodias",
    "name": "Espalhe Melodias",
    "biography": "Plataforma de comunidade para músicos",
    "website": "https://espalhemelodias.com",
    "profile_picture_url": "https://instagram.com/...",
    "followers_count": 5240,
    "media_count": 142
  }
}
```

---

### 4️⃣ POST /api/instagram/invalidate-cache

**Descrição**: Invalida cache manualmente (Admin Only)

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body** (opcional):
```json
{
  "key": "instagram_feed"
}
```

**Chaves disponíveis**:
- `instagram_feed` — cache do feed
- `instagram_stories` — cache das stories
- `instagram_stats` — cache das estatísticas
- Omitir `key` para limpar tudo

**Request**:
```bash
# Invalidar apenas feed
curl -X POST "http://localhost:3001/api/instagram/invalidate-cache" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "instagram_feed"}'

# Limpar todo cache
curl -X POST "http://localhost:3001/api/instagram/invalidate-cache" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Cache key 'instagram_feed' invalidated",
  "timestamp": "2026-06-18T10:35:22.123Z"
}
```

---

### 5️⃣ GET /api/instagram/health

**Descrição**: Verifica se a integração está funcionando

**Request**:
```bash
curl -X GET "http://localhost:3001/api/instagram/health"
```

**Response** (200 OK):
```json
{
  "success": true,
  "status": "HEALTHY",
  "message": "Instagram integration is working",
  "account": {
    "username": "espalhe_melodias",
    "followers": 5240
  },
  "timestamp": "2026-06-18T10:35:22.123Z"
}
```

**Response** (500 Error - Misconfigured):
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

## 💾 Cache Strategy

### In-Memory Cache (Padrão)

O `instagramService` usa um `Map<string, CacheEntry>` em memória:

```typescript
private cache: Map<string, { data: any; expiry: number }> = new Map();
```

**Vantagens**:
- ✅ Zero dependências
- ✅ Rápido
- ✅ Simples de debugar

**Desvantagens**:
- ❌ Não persiste entre restarts
- ❌ Não funciona com múltiplas instâncias (não distribuído)

**TTL Padrão**: 1 hora (3600 segundos)

### Redis Cache (Opcional)

Para múltiplas instâncias ou persistência, integre Redis:

```typescript
// Adicionar ao instagramService

import redis from 'redis';

private redisClient: redis.RedisClient | null = null;

constructor() {
  if (config.redis.enabled) {
    this.redisClient = redis.createClient({
      url: config.redis.url,
    });
    this.redisClient.on('error', (err) => console.error('Redis error:', err));
  }
}

private async getFromCache(key: string): Promise<any | null> {
  if (!this.redisClient) return null;
  
  const data = await this.redisClient.get(key);
  return data ? JSON.parse(data) : null;
}

private async setInCache(key: string, data: any, ttl: number): Promise<void> {
  if (!this.redisClient) return;
  
  await this.redisClient.setex(key, ttl, JSON.stringify(data));
}
```

---

## 🧪 Testing Localmente

### 1. Setup Básico

```bash
cd C:\Users\Eduardo\Desktop\espalhe-melodias\server

# Instalar dependências (se necessário)
npm install

# Adicionar credenciais ao .env
echo "INSTAGRAM_BUSINESS_ACCOUNT_ID=17841405793139210" >> .env
echo "INSTAGRAM_ACCESS_TOKEN=IGQWRf..." >> .env
echo "INSTAGRAM_CACHE_TTL=3600" >> .env
```

### 2. Iniciar o servidor

```bash
npm run dev
# ou
npx tsx src/server.ts
```

### 3. Testar Health Check

```bash
curl http://localhost:3001/api/instagram/health
```

**Esperado**: Status 200 com `"status": "HEALTHY"`

### 4. Testar Feed

```bash
curl http://localhost:3001/api/instagram/feed?limit=3
```

### 5. Testar Stats

```bash
curl http://localhost:3001/api/instagram/stats
```

### 6. Testar Cache

```bash
# Primeira chamada (hit na API)
time curl http://localhost:3001/api/instagram/feed

# Segunda chamada (hit no cache)
time curl http://localhost:3001/api/instagram/feed

# Bypass cache
curl http://localhost:3001/api/instagram/feed?cache=false
```

### 7. Testar Invalidação de Cache (Admin)

```bash
# Gerar JWT token (use seu login existente)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "..."}'

# Copie o token retornado e use:
curl -X POST http://localhost:3001/api/instagram/invalidate-cache \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"key": "instagram_feed"}'
```

---

## ❌ Error Handling

### Possíveis Erros e Soluções

| Erro | Causa | Solução |
|------|-------|--------|
| `401 Unauthorized` | Access token expirado/inválido | Regenerar token no Meta Console |
| `404 Not Found` | Business Account ID incorreto | Verificar ID no Instagram Insights |
| `400 Bad Request` | Campo 'fields' inválido | Verificar sintaxe de query |
| `429 Too Many Requests` | Rate limit atingido | Aguardar ou aumentar TTL do cache |
| `MISCONFIGURED` | Credenciais faltando | Verificar `.env` |
| `CORS Error` (frontend) | Origin não autorizada | Adicionar origin ao `config.cors.origin` |

### Response Padrão de Erro

```json
{
  "success": false,
  "error": "Failed to fetch Instagram feed",
  "code": "INSTAGRAM_API_ERROR",
  "message": "HTTP 401: The Instagram user could not be found."
}
```

---

## 📊 Integração com Frontend

### React Component Exemplo

```typescript
// src/components/InstagramFeedView.tsx

import { useEffect, useState } from 'react';
import { useToast } from '@/src/components/ui/Toast';

export function InstagramFeedView() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeed();
  }, []);

  async function fetchFeed() {
    try {
      setLoading(true);
      const response = await fetch('/api/instagram/feed?limit=9');
      const data = await response.json();

      if (data.success) {
        setPosts(data.data.posts);
        setStats(data.data.stats);
      } else {
        toast({
          type: 'error',
          message: data.error || 'Failed to load Instagram feed',
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        message: 'Network error loading Instagram feed',
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>{stats?.username}</h2>
      <p>{stats?.followers_count} followers</p>
      
      <div className="grid grid-cols-3 gap-4">
        {posts.map(post => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={post.media_url}
              alt={post.caption || 'Instagram post'}
              className="w-full h-64 object-cover rounded"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
```

---

## 📈 Monitoramento

### Logs Recomendados

```typescript
// Em instagramService.ts
console.log(`[Instagram] Fetching feed... (limit=${limit})`);
console.log(`[Instagram] Cache hit for: ${cacheKey}`);
console.log(`[Instagram] API Response: ${response.data.data.length} items`);
console.error(`[Instagram] API Error:`, axiosError.response?.data);
```

### Métricas para Rastrear

- Tempo de response (com vs. sem cache)
- Taxa de cache hit/miss
- Número de API calls por dia
- Follower growth over time
- Engagement rate (likes + comments / followers)

---

## ✅ Checklist de Implementação

- [ ] Criar credenciais no Meta Console
- [ ] Validar Business Account ID & Access Token
- [ ] Adicionar variables ao `.env`
- [ ] Copiar arquivos de modelo e service
- [ ] Copiar controller e rotas
- [ ] Atualizar `server.ts` com rota
- [ ] Testar endpoints com curl
- [ ] Integrar com frontend React
- [ ] Configurar error handling
- [ ] (Opcional) Integrar Redis para cache distribuído
- [ ] Documentar credenciais em local seguro (LastPass, 1Password, etc)

---

**Data de Conclusão**: 18 de Junho de 2026  
**Version**: 1.0.0  
**Suporte**: Graph API v18.0 (Meta)
