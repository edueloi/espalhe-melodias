# Blog & Events System — Guia de Implementação

## 📦 Arquivos Criados

### Backend (Node.js + MySQL)

1. **Controllers**
   - `server/src/controllers/blogsControllerEnhanced.ts` — CRUD de posts com slug, SEO, featured
   - `server/src/controllers/blogCategoriesController.ts` — CRUD de categorias de blog
   - `server/src/controllers/eventsControllerEnhanced.ts` — CRUD de eventos com capacidade
   - `server/src/controllers/eventCategoriesController.ts` — CRUD de categorias de eventos

2. **Routes**
   - `server/src/routes/blogsEnhanced.ts` — Endpoints de blog e categorias
   - `server/src/routes/eventsEnhanced.ts` — Endpoints de eventos e categorias

3. **Database**
   - `server/MIGRATION_BLOG_EVENTS.sql` — SQL para criar tabelas e índices
   - `server/SEED_BLOG_EVENTS.js` — Script para popular dados iniciais

4. **Documentation**
   - `BLOG_EVENTS_SYSTEM.md` — Documentação completa do sistema
   - `IMPLEMENTATION_GUIDE_BLOG_EVENTS.md` — Este arquivo

---

## 🚀 Passos para Implementar

### Passo 1: Executar Migration do Banco

```bash
cd server

# Editar migrate.js para adicionar as novas colunas:
# Copiar/adicionar o array de colunas do MIGRATION_BLOG_EVENTS.sql

npm run migrate
```

**Ou executar SQL diretamente:**

```bash
# Se tiver acesso direto ao MySQL:
mysql -u root -p espalhe_melodias < MIGRATION_BLOG_EVENTS.sql
```

### Passo 2: Copiar Controllers

Copie os arquivos para o diretório correto:

```bash
cp src/controllers/blogsControllerEnhanced.ts src/controllers/
cp src/controllers/blogCategoriesController.ts src/controllers/
cp src/controllers/eventsControllerEnhanced.ts src/controllers/
cp src/controllers/eventCategoriesController.ts src/controllers/
```

### Passo 3: Copiar Routes

```bash
cp src/routes/blogsEnhanced.ts src/routes/
cp src/routes/eventsEnhanced.ts src/routes/
```

### Passo 4: Atualizar server.ts

No `server/src/server.ts`, adicione os novos routes:

```typescript
import blogsEnhancedRoutes from './routes/blogsEnhanced';
import eventsEnhancedRoutes from './routes/eventsEnhanced';

// ...

// ANTES dos routes existentes (para override):
app.use('/api/blogs', blogsEnhancedRoutes);
app.use('/api/events', eventsEnhancedRoutes);

// Ou com paths diferentes se quiser manter os antigos:
// app.use('/api/blog-v2', blogsEnhancedRoutes);
// app.use('/api/events-v2', eventsEnhancedRoutes);
```

### Passo 5: Executar Seed

```bash
node SEED_BLOG_EVENTS.js
```

Isso irá:
- ✅ Criar 5 categorias de blog
- ✅ Criar 5 categorias de eventos
- ✅ Adicionar 3 posts de exemplo
- ✅ Adicionar 4 eventos de exemplo

### Passo 6: Testar Endpoints

```bash
# Autenticar (obter token)
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha"}' \
  | jq -r '.data.token')

# Listar posts
curl http://localhost:3001/api/blogs \
  -H "Authorization: Bearer $TOKEN"

# Listar categorias
curl http://localhost:3001/api/blogs/categories \
  -H "Authorization: Bearer $TOKEN"

# Criar post
curl -X POST http://localhost:3001/api/blogs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Novo Artigo",
    "slug": "novo-artigo",
    "excerpt": "Preview",
    "content": "<p>Conteúdo</p>",
    "category_id": "cat-uuid",
    "status": "draft"
  }'

# Listar eventos
curl http://localhost:3001/api/events \
  -H "Authorization: Bearer $TOKEN"

# Listar eventos próximos
curl http://localhost:3001/api/events/upcoming \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 Schema Detalhado

### blog_posts (expandido)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | CHAR(36) | UUID primária |
| title | VARCHAR(300) | Título do post |
| slug | VARCHAR(300) UNIQUE | URL-friendly (ex: "meu-post") |
| excerpt | TEXT | Preview/descrição curta |
| content | LONGTEXT | Conteúdo completo (HTML) |
| category_id | CHAR(36) FK | Referência a blog_categories |
| category | VARCHAR(100) | Cache do nome da categoria |
| image_url | TEXT | URL da imagem de capa |
| author_id | CHAR(36) FK | Referência a users |
| author_name | VARCHAR(150) | Cache do nome do autor |
| author_avatar | TEXT | Cache do avatar do autor |
| read_time | VARCHAR(20) | "5 min", "10 min", etc |
| likes | INT | Contagem de likes |
| liked_by | JSON | Array de IDs de usuários que curtiram |
| status | ENUM | draft, published, archived |
| featured | TINYINT(1) | 0/1 para destaque |
| featured_until | DATETIME | Até quando ficará em destaque |
| views_count | INT | Contador de visualizações |
| seo_title | VARCHAR(160) | Título para SEO (máx 160 chars) |
| seo_description | VARCHAR(160) | Descrição para SEO (máx 160 chars) |
| seo_keywords | VARCHAR(300) | Keywords separadas por vírgula |
| og_image_url | TEXT | Imagem para Open Graph (social sharing) |
| post_date | DATETIME | Data de criação |
| published_at | DATETIME | Data de publicação |
| updated_at | DATETIME | Última atualização |

**Índices:**
- `idx_blog_slug` — Para busca por slug
- `idx_blog_featured` — Para posts em destaque
- `idx_blog_search` FULLTEXT — Para busca full-text

### health_events (expandido)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | CHAR(36) | UUID primária |
| title | VARCHAR(300) | Título do evento |
| slug | VARCHAR(300) | URL-friendly |
| description | TEXT | Descrição completa |
| event_date | DATE | Data do evento |
| event_time | VARCHAR(10) | Horário (HH:MM) |
| location | VARCHAR(300) | Local/endereço |
| category_id | CHAR(36) FK | Referência a event_categories |
| category | VARCHAR(100) | Cache da categoria |
| instructor_id | CHAR(36) FK | Referência a users |
| instructor_name | VARCHAR(150) | Nome do instrutor |
| instructor_avatar | TEXT | Avatar do instrutor |
| status | ENUM | upcoming, past (legado) |
| status_enum | ENUM | draft, upcoming, ongoing, past, cancelled |
| participants_count | INT | Número de inscritos |
| event_capacity | INT | Capacidade máxima (0 = ilimitado) |
| waitlist_count | INT | Pessoas na lista de espera |
| enrolled_user_ids | JSON | Array de IDs de inscritos |
| recording_url | TEXT | URL da gravação |
| cover_url | MEDIUMTEXT | Imagem de capa |
| thumbnail_url | TEXT | Imagem thumbnail |
| seo_description | VARCHAR(300) | Descrição para SEO |
| registration_deadline | DATETIME | Deadline para inscrição |
| rsvp_enabled | TINYINT(1) | 0/1 para RSVP |
| allow_guests | TINYINT(1) | 0/1 para permitir convidados |
| item_division | TINYINT(1) | 0/1 para divisão de itens |
| created_at | DATETIME | Data de criação |
| updated_at | DATETIME | Última atualização |

### blog_categories

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | CHAR(36) | UUID primária |
| name | VARCHAR(100) UNIQUE | Nome da categoria |
| slug | VARCHAR(100) UNIQUE | Slug para URL |
| description | TEXT | Descrição |
| icon | VARCHAR(50) | Nome do ícone (ex: "heart") |
| color | VARCHAR(20) | Cor para badge (ex: "rose") |
| order_rank | INT | Ordem de exibição |
| post_count | INT | Cache de contagem de posts |
| created_at | DATETIME | Data de criação |
| updated_at | DATETIME | Última atualização |

### event_categories

Estrutura similar a `blog_categories`, mas para eventos.

---

## 🔗 API Endpoints (Resumido)

### Blog Posts

```
GET    /api/blogs                      — Listar (paginado, filtros)
GET    /api/blogs/featured             — Posts destacados
GET    /api/blogs/popular              — Posts populares
GET    /api/blogs/slug/:slug           — Obter por slug
GET    /api/blogs/:id                  — Obter por ID
POST   /api/blogs                      — Criar
PUT    /api/blogs/:id                  — Atualizar
DELETE /api/blogs/:id                  — Deletar
POST   /api/blogs/:id/like             — Curtir/Descurtir
```

### Blog Categories

```
GET    /api/blogs/categories           — Listar
GET    /api/blogs/categories/:id       — Obter por ID
GET    /api/blogs/categories/slug/:slug — Obter por slug
POST   /api/blogs/categories           — Criar (admin)
PUT    /api/blogs/categories/:id       — Atualizar (admin)
DELETE /api/blogs/categories/:id       — Deletar (admin)
```

### Events

```
GET    /api/events                     — Listar (paginado, filtros)
GET    /api/events/upcoming            — Próximos eventos
GET    /api/events/popular             — Mais populares
GET    /api/events/slug/:slug          — Obter por slug
GET    /api/events/:id                 — Obter por ID
POST   /api/events                     — Criar
PUT    /api/events/:id                 — Atualizar
DELETE /api/events/:id                 — Deletar
POST   /api/events/:id/enroll          — Inscrever
```

### Event Categories

```
GET    /api/events/categories          — Listar
GET    /api/events/categories/:id      — Obter por ID
GET    /api/events/categories/slug/:slug — Obter por slug
POST   /api/events/categories          — Criar (admin)
PUT    /api/events/categories/:id      — Atualizar (admin)
DELETE /api/events/categories/:id      — Deletar (admin)
```

---

## 🔒 Permissões de Acesso

| Endpoint | Member | Professional | Admin |
|----------|--------|--------------|-------|
| GET /api/blogs | Publicados | Todos | Todos |
| POST /api/blogs | ❌ | ✅ | ✅ |
| PUT /api/blogs/:id | Own only | Own + Admin | ✅ |
| DELETE /api/blogs/:id | ❌ | Own + Admin | ✅ |
| POST /api/blogs/categories | ❌ | ❌ | ✅ |
| GET /api/events | ✅ | ✅ | ✅ |
| POST /api/events | ❌ | ✅ | ✅ |
| POST /api/events/:id/enroll | ✅ | ✅ | ✅ |
| POST /api/events/categories | ❌ | ❌ | ✅ |

---

## 🧪 Queries de Teste

### Criar Blog Post

```bash
curl -X POST http://localhost:3001/api/blogs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Técnicas de Respiração para Calma",
    "slug": "tecnicas-respiracao-calma",
    "excerpt": "Aprenda técnicas simples de respiração para reduzir a ansiedade",
    "content": "<h2>Respiração Diafragmática</h2><p>A respiração profunda ativa o sistema nervoso parassimpático...</p>",
    "category_id": "meditacao-uuid",
    "imageUrl": "https://images.unsplash.com/...",
    "readTime": "5 min",
    "status": "draft",
    "seoTitle": "Técnicas de Respiração para Calma - Guia Prático",
    "seoDescription": "Aprenda técnicas científicas de respiração para controlar a ansiedade",
    "seoKeywords": "respiração, ansiedade, calma, técnicas"
  }'
```

### Publicar Blog Post

```bash
curl -X PUT http://localhost:3001/api/blogs/{post-id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published",
    "featured": true,
    "featured_until": "2024-08-18T23:59:59"
  }'
```

### Criar Evento

```bash
curl -X POST http://localhost:3001/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Webinar: Ansiedade e Tecnologia",
    "slug": "webinar-ansiedade-tecnologia",
    "description": "Discuta como a tecnologia afeta a ansiedade e dicas para gerenciar",
    "date": "2024-08-15",
    "time": "20:00",
    "location": "Virtual (Zoom)",
    "category_id": "webinar-uuid",
    "event_capacity": 200,
    "seoDescription": "Webinar online sobre ansiedade na era digital",
    "registration_deadline": "2024-08-15T19:00:00",
    "status_enum": "draft"
  }'
```

### Inscrever em Evento

```bash
curl -X POST http://localhost:3001/api/events/{event-id}/enroll \
  -H "Authorization: Bearer $TOKEN"
```

### Listar Posts com Filtros

```bash
# Por categoria
curl "http://localhost:3001/api/blogs?category_id={cat-id}&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Busca
curl "http://localhost:3001/api/blogs?search=meditacao&page=1" \
  -H "Authorization: Bearer $TOKEN"

# Posts em destaque
curl "http://localhost:3001/api/blogs?featured=true" \
  -H "Authorization: Bearer $TOKEN"

# Apenas publicados
curl "http://localhost:3001/api/blogs?status=published" \
  -H "Authorization: Bearer $TOKEN"
```

### Listar Eventos com Filtros

```bash
# Próximos eventos
curl "http://localhost:3001/api/events/upcoming?days=60&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Por categoria
curl "http://localhost:3001/api/events?category_id={cat-id}" \
  -H "Authorization: Bearer $TOKEN"

# Eventos populares
curl "http://localhost:3001/api/events/popular?limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Dashboard Admin Queries

### Estatísticas de Blog

```sql
SELECT 
  COUNT(*) as total_posts,
  SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_posts,
  SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_posts,
  SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) as featured_posts,
  ROUND(AVG(likes), 2) as avg_likes,
  ROUND(AVG(views_count), 2) as avg_views,
  MAX(views_count) as max_views
FROM blog_posts;
```

### Posts por Categoria

```sql
SELECT 
  bc.name,
  COUNT(bp.id) as post_count,
  ROUND(AVG(bp.likes), 2) as avg_likes,
  MAX(bp.post_date) as last_post
FROM blog_posts bp
LEFT JOIN blog_categories bc ON bp.category_id = bc.id
WHERE bp.status = 'published'
GROUP BY bc.id, bc.name
ORDER BY post_count DESC;
```

### Estatísticas de Eventos

```sql
SELECT 
  COUNT(*) as total_events,
  SUM(CASE WHEN status_enum = 'upcoming' THEN 1 ELSE 0 END) as upcoming_events,
  SUM(participants_count) as total_registrations,
  ROUND(AVG(participants_count), 2) as avg_registrations
FROM health_events;
```

### Eventos com Próximas Deadlines

```sql
SELECT 
  id, title, event_date, registration_deadline,
  participants_count, event_capacity,
  DATEDIFF(registration_deadline, NOW()) as days_until_deadline
FROM health_events
WHERE registration_deadline > NOW()
  AND status_enum IN ('draft', 'upcoming')
ORDER BY registration_deadline ASC;
```

---

## ⚠️ Considerações Técnicas

### Performance

- **Índices**: Todas as colunas frequentemente usadas em WHERE têm índices
- **Full-text Search**: Implementado para blog posts (MATCH AGAINST)
- **Paginação**: Obrigatória em listas para evitar overhead
- **Cache**: `post_count`, `event_count` nas categorias para queries mais rápidas

### Slugs

- **Geração Automática**: Se não fornecido, é gerado a partir do título
- **Unicidade**: Garantida por UNIQUE constraint
- **Formato**: lowercase, sem espaços, hífens

### SEO

- **Meta Tags**: `seo_title` (máx 160), `seo_description` (máx 160)
- **Open Graph**: `og_image_url` para social sharing
- **Keywords**: Separadas por vírgula
- **Canonical**: Implementar no frontend via slug

### Versionamento

Se quiser manter os antigos endpoints funcionando:

```typescript
// server.ts
app.use('/api/blogs', blogsEnhancedRoutes);      // v2
app.use('/api/blogs/v1', blogsRoutes);           // legado
```

---

## 🎨 Frontend Integration (React)

### Exemplo de Hook para Blog

```typescript
// hooks/useBlog.ts
import { useState, useEffect } from 'react';

export function useBlog(slug: string) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blogs/slug/${slug}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        setPost(data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  return { post, loading, error };
}
```

### Exemplo de Componente

```typescript
// components/BlogPost.tsx
import { useBlog } from '../hooks/useBlog';
import { useToast } from '../components/ui';

export function BlogPost({ slug }: { slug: string }) {
  const { post, loading } = useBlog(slug);
  const { toast } = useToast();

  async function handleLike() {
    try {
      const res = await fetch(`/api/blogs/${post.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      toast({ type: 'success', message: 'Post curtido!' });
    } catch (err) {
      toast({ type: 'error', message: 'Erro ao curtir' });
    }
  }

  if (loading) return <div>Carregando...</div>;
  if (!post) return <div>Post não encontrado</div>;

  return (
    <article>
      <h1>{post.title}</h1>
      <img src={post.image_url} alt={post.title} />
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <button onClick={handleLike}>❤️ {post.likes}</button>
    </article>
  );
}
```

---

## 🐛 Troubleshooting

### "Coluna não encontrada: slug"

A migration pode não ter sido executada. Execute:

```bash
cd server
npm run migrate
```

### "Acesso negado ao criar post"

Apenas `professional` e `super-admin` podem criar posts. Verifique o role do usuário:

```sql
SELECT role FROM users WHERE id = 'user-uuid';
```

### "Slug já existe"

Slugs devem ser únicos. Use um slug diferente ou adicione um sufixo:

```
"novo-artigo-2024"
"novo-artigo-v2"
```

### Eventos lotados retorna erro

Se `event_capacity` > 0 e todos os lugares estão preenchidos:

```typescript
const enrolled = true;  // mesmo que lotado
const waitlist = true;  // usuário foi adicionado à fila
```

---

## 📚 Próximos Passos

1. **Frontend**: Criar páginas React para blog e eventos
2. **Admin Panel**: Interface para CRUD de posts e eventos
3. **Email**: Notificações para nuevos posts e eventos
4. **Analytics**: Rastrear visualizações e engagement
5. **Comments**: Sistema de comentários para posts
6. **Ratings**: Avaliações para eventos (star rating)

---

## 📝 Notas Finais

- Todos os dados de exemplo são de testes — remova antes de produção
- Backup do banco antes de migração
- Teste os endpoints em staging primeiro
- Documente qualquer customização feita
- Mantenha as migrations versionadas

**Pronto para usar!** 🚀
