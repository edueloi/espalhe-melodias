# Blog & Events System — Documentação Completa

## 📋 Visão Geral

Sistema dinâmico de Blog e Eventos com:
- **Blog**: CRUD completo com SEO, categorias, rascunhos, likes
- **Eventos**: CRUD completo com status (upcoming/past), inscrições, categorias
- **Admin Features**: Painel completo para gerenciar posts e eventos
- **Banco de Dados**: MySQL com migrações e seed de dados

---

## 🗄️ Schema do Banco de Dados

### 1. Blog Posts Table (com SEO)

```sql
-- ── Blog Posts ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id               CHAR(36)      NOT NULL PRIMARY KEY,
  title            VARCHAR(300)  NOT NULL,
  slug             VARCHAR(300)  NOT NULL UNIQUE,           -- Para URLs amigáveis
  excerpt          TEXT          NOT NULL,                   -- Preview/descrição curta
  content          LONGTEXT      NOT NULL,                   -- Conteúdo completo
  category_id      CHAR(36)      NOT NULL,                   -- FK para categories
  category         VARCHAR(100)  NOT NULL,                   -- Cache do nome
  image_url        TEXT,                                     -- Imagem de capa
  author_id        CHAR(36)      NOT NULL,
  author_name      VARCHAR(150)  NOT NULL,
  author_avatar    TEXT,
  read_time        VARCHAR(20)   DEFAULT '5 min',            -- "5 min", "10 min", etc
  likes            INT           NOT NULL DEFAULT 0,
  liked_by         JSON,                                     -- Array de IDs
  published        TINYINT(1)    NOT NULL DEFAULT 0,         -- Draft/Publicado
  status           ENUM('draft','published','archived')      -- Status detalhado
               NOT NULL DEFAULT 'draft',
  
  -- SEO Fields
  seo_title        VARCHAR(160),                             -- Máx 160 chars (para Google)
  seo_description  VARCHAR(160),                             -- Máx 160 chars
  seo_keywords     VARCHAR(300),                             -- Keywords separadas por vírgula
  og_image_url     TEXT,                                     -- Imagem para social sharing
  
  -- Controle Editorial
  featured         TINYINT(1)    DEFAULT 0,                  -- Post em destaque
  featured_until   DATETIME,                                 -- Até quando em destaque
  views_count      INT           DEFAULT 0,                  -- Contador de visualizações
  
  post_date        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at     DATETIME,                                 -- Data de publicação
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP 
                   ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_blog_category  (category_id),
  INDEX idx_blog_author    (author_id),
  INDEX idx_blog_published (status),
  INDEX idx_blog_slug      (slug),
  INDEX idx_blog_featured  (featured, featured_until),
  FULLTEXT idx_blog_search (title, content),                 -- Para busca full-text
  CONSTRAINT fk_blog_category FOREIGN KEY (category_id) 
    REFERENCES blog_categories(id) ON DELETE CASCADE,
  CONSTRAINT fk_blog_author FOREIGN KEY (author_id) 
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Blog Categories Table

```sql
-- ── Blog Categories ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_categories (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL UNIQUE,
  slug          VARCHAR(100)  NOT NULL UNIQUE,               -- Para URLs
  description   TEXT,
  icon          VARCHAR(50),                                 -- Nome do ícone (ex: "heart")
  color         VARCHAR(20),                                 -- Cor da badge (ex: "rose")
  order_rank    INT           DEFAULT 0,                     -- Ordem de exibição
  post_count    INT           DEFAULT 0,                     -- Cache de contagem
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP 
                ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_cat_slug (slug),
  UNIQUE KEY uk_cat_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Events Categories Table

```sql
-- ── Events Categories ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_categories (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL UNIQUE,
  slug          VARCHAR(100)  NOT NULL UNIQUE,
  description   TEXT,
  icon          VARCHAR(50),
  color         VARCHAR(20),
  order_rank    INT           DEFAULT 0,
  event_count   INT           DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_evt_cat_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Events Table (Enhanced)

```sql
-- ── Health Events (Enhanced) ──────────────────────────────────────────────────
ALTER TABLE health_events ADD COLUMN (
  category_id       CHAR(36),
  slug              VARCHAR(300),
  event_capacity    INT           DEFAULT 0,              -- 0 = ilimitado
  waitlist_count    INT           DEFAULT 0,
  seo_description   VARCHAR(300),
  thumbnail_url     TEXT,
  status_enum       ENUM('draft','upcoming','ongoing','past','cancelled')
                    DEFAULT 'draft',
  registration_deadline DATETIME
);

ALTER TABLE health_events 
  ADD FOREIGN KEY fk_event_category (category_id) 
    REFERENCES event_categories(id) ON DELETE SET NULL;
```

---

## 📚 API Endpoints

### Blog Endpoints

#### **GET /api/blogs** — Listar Posts (com paginação, filtros, busca)
```bash
curl "http://localhost:3001/api/blogs?page=1&limit=10&category=health&search=meditacao&published=all"

# Query params:
# - page: número da página (default: 1)
# - limit: posts por página (default: 10)
# - category: filtrar por categoria
# - search: busca por título/excerpt
# - published: "all" (admin/prof veem rascunhos) | "published" (padrão)
# - featured: "true" para destacados
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Meditação para Iniciantes",
      "slug": "meditacao-para-iniciantes",
      "excerpt": "Aprenda as bases da meditação...",
      "category": "health",
      "category_id": "...",
      "image_url": "https://...",
      "author_name": "Dr. João",
      "author_avatar": "https://...",
      "post_date": "2024-06-18T10:30:00",
      "read_time": "5 min",
      "likes": 12,
      "status": "published",
      "featured": true,
      "views_count": 125,
      "seo_title": "Meditação para Iniciantes - Espalhe Melodias",
      "seo_description": "Guia completo de meditação..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "offset": 0,
    "total": 45,
    "pages": 5
  }
}
```

#### **GET /api/blogs/slug/:slug** — Obter Post por Slug (SEO-friendly)
```bash
curl "http://localhost:3001/api/blogs/slug/meditacao-para-iniciantes"
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "Meditação para Iniciantes",
    "content": "<p>Conteúdo completo em HTML...</p>",
    "seo_title": "Meditação para Iniciantes",
    "seo_description": "...",
    "seo_keywords": "meditação, iniciantes, zen",
    "og_image_url": "...",
    "featured": true,
    "views_count": 125,
    "likedBy": ["user-1", "user-2"],
    "likes": 2
  }
}
```

#### **GET /api/blogs/:id** — Obter Post por ID
```bash
curl "http://localhost:3001/api/blogs/550e8400-e29b-41d4-a716-446655440000"
```

#### **POST /api/blogs** — Criar Post (Admin/Professional only)
```bash
curl -X POST "http://localhost:3001/api/blogs" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Novo Artigo",
    "slug": "novo-artigo",
    "excerpt": "Preview",
    "content": "<p>Conteúdo completo</p>",
    "category_id": "cat-id-123",
    "image_url": "https://...",
    "read_time": "5 min",
    "status": "draft",
    "seo_title": "Novo Artigo - Espalhe Melodias",
    "seo_description": "Descrição para SEO",
    "seo_keywords": "artigo, novo",
    "featured": false
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "title": "Novo Artigo",
    "slug": "novo-artigo",
    "status": "draft"
  }
}
```

#### **PUT /api/blogs/:id** — Atualizar Post (owner ou admin)
```bash
curl -X PUT "http://localhost:3001/api/blogs/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Artigo Atualizado",
    "content": "<p>Novo conteúdo</p>",
    "status": "published",
    "featured": true,
    "featured_until": "2024-07-18T23:59:59"
  }'
```

#### **DELETE /api/blogs/:id** — Deletar Post (owner ou admin)
```bash
curl -X DELETE "http://localhost:3001/api/blogs/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer TOKEN"
```

#### **POST /api/blogs/:id/like** — Curtir/Descurtir Post
```bash
curl -X POST "http://localhost:3001/api/blogs/550e8400-e29b-41d4-a716-446655440000/like" \
  -H "Authorization: Bearer TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "likes": 13,
    "liked": true
  }
}
```

### Blog Categories Endpoints

#### **GET /api/blogs/categories** — Listar Categorias
```bash
curl "http://localhost:3001/api/blogs/categories"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-1",
      "name": "Saúde Mental",
      "slug": "saude-mental",
      "description": "Artigos sobre saúde mental e bem-estar",
      "icon": "heart",
      "color": "rose",
      "post_count": 12
    }
  ]
}
```

#### **POST /api/blogs/categories** — Criar Categoria (Admin only)
```bash
curl -X POST "http://localhost:3001/api/blogs/categories" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meditação",
    "slug": "meditacao",
    "description": "Técnicas de meditação",
    "icon": "meditation",
    "color": "teal",
    "order_rank": 1
  }'
```

### Events Endpoints

#### **GET /api/events** — Listar Eventos (com status)
```bash
curl "http://localhost:3001/api/events?page=1&limit=10&status=upcoming&category=workshop"

# Query params:
# - status: "upcoming", "past", "all"
# - category: filtrar por categoria
# - search: busca por título/descrição
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "evt-1",
      "title": "Workshop de Meditação",
      "slug": "workshop-meditacao",
      "description": "...",
      "event_date": "2024-07-15",
      "event_time": "10:00",
      "location": "São Paulo, SP",
      "category": "workshop",
      "category_id": "cat-evt-1",
      "status": "upcoming",
      "status_enum": "upcoming",
      "participants_count": 25,
      "event_capacity": 30,
      "waitlist_count": 2,
      "registered": true,
      "isEnrolled": true
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 8 }
}
```

#### **POST /api/events** — Criar Evento (Admin/Professional)
```bash
curl -X POST "http://localhost:3001/api/events" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Workshop de Meditação",
    "slug": "workshop-meditacao",
    "description": "Um workshop prático...",
    "date": "2024-07-15",
    "time": "10:00",
    "location": "São Paulo, SP",
    "category_id": "cat-evt-1",
    "event_capacity": 30,
    "seo_description": "Workshop de meditação em SP",
    "thumbnail_url": "https://...",
    "status_enum": "draft",
    "registration_deadline": "2024-07-12T23:59:59"
  }'
```

#### **PUT /api/events/:id** — Atualizar Evento
```bash
curl -X PUT "http://localhost:3001/api/events/evt-1" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Workshop Atualizado",
    "status_enum": "published"
  }'
```

#### **DELETE /api/events/:id** — Deletar Evento
```bash
curl -X DELETE "http://localhost:3001/api/events/evt-1" \
  -H "Authorization: Bearer TOKEN"
```

#### **POST /api/events/:id/enroll** — Inscrever/Desinscrever em Evento
```bash
curl -X POST "http://localhost:3001/api/events/evt-1/enroll" \
  -H "Authorization: Bearer TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "enrolled": true,
    "participantsCount": 26,
    "waitlist": false
  }
}
```

---

## 🌱 Seed Data (Dados Iniciais)

### Script de Seed Expandido

Adicionar ao `server/scripts/seed.js`:

```javascript
// ─── Blog Categories ──────────────────────────────────────────────────────────
const blogCategories = [
  {
    name: 'Saúde Mental',
    slug: 'saude-mental',
    description: 'Dicas e informações sobre saúde mental e bem-estar emocional',
    icon: 'heart',
    color: 'rose',
    order_rank: 1,
  },
  {
    name: 'Meditação',
    slug: 'meditacao',
    description: 'Técnicas e práticas de meditação para iniciantes e avançados',
    icon: 'meditation',
    color: 'teal',
    order_rank: 2,
  },
  {
    name: 'Yoga',
    slug: 'yoga',
    description: 'Asanas, pranayama e filosofia do yoga',
    icon: 'yoga',
    color: 'amber',
    order_rank: 3,
  },
  {
    name: 'Nutrição',
    slug: 'nutricao',
    description: 'Nutrição saudável e receitas nutritivas',
    icon: 'apple',
    color: 'moss',
    order_rank: 4,
  },
];

// ─── Event Categories ─────────────────────────────────────────────────────────
const eventCategories = [
  {
    name: 'Workshop',
    slug: 'workshop',
    description: 'Workshops práticos e interativos',
    icon: 'video',
    color: 'clay',
    order_rank: 1,
  },
  {
    name: 'Palestra',
    slug: 'palestra',
    description: 'Palestras e conferências',
    icon: 'speaker',
    color: 'navy',
    order_rank: 2,
  },
  {
    name: 'Grupo de Apoio',
    slug: 'grupo-apoio',
    description: 'Grupos de apoio e suporte comunitário',
    icon: 'users',
    color: 'rose',
    order_rank: 3,
  },
  {
    name: 'Meditação Coletiva',
    slug: 'meditacao-coletiva',
    description: 'Sessões coletivas de meditação',
    icon: 'meditation',
    color: 'teal',
    order_rank: 4,
  },
];

// ─── Sample Blog Posts ─────────────────────────────────────────────────────────
const blogPosts = [
  {
    title: 'Meditação para Iniciantes: Um Guia Completo',
    slug: 'meditacao-iniciantes-guia',
    excerpt: 'Aprenda como começar sua jornada de meditação com dicas práticas e eficazes.',
    content: `<h2>Introdução à Meditação</h2>
<p>A meditação é uma prática ancient que traz muitos benefícios para a saúde mental...</p>
<h3>Passo 1: Escolha um local tranquilo</h3>
<p>Encontre um espaço confortável...</p>`,
    category: 'Meditação',
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    read_time: '8 min',
    status: 'published',
    featured: true,
    seo_title: 'Meditação para Iniciantes: Guia Completo - Espalhe Melodias',
    seo_description: 'Aprenda meditação do zero com nosso guia prático e acessível.',
    seo_keywords: 'meditação, iniciantes, bem-estar, mindfulness',
    og_image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200',
  },
  {
    title: 'Yoga: Benefícios Científicos Comprovados',
    slug: 'yoga-beneficios-cientificos',
    excerpt: 'Descubra o que a ciência diz sobre os benefícios do yoga para corpo e mente.',
    content: '<h2>Benefícios Científicos do Yoga</h2><p>Estudos recentes mostram...</p>',
    category: 'Yoga',
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    read_time: '6 min',
    status: 'published',
    featured: false,
    seo_title: 'Yoga: Benefícios Científicos Comprovados',
    seo_description: 'Conheça os benefícios comprovados pela ciência da prática regular de yoga.',
    seo_keywords: 'yoga, benefícios, saúde, ciência',
  },
];

// ─── Sample Events ────────────────────────────────────────────────────────────
const events = [
  {
    title: 'Workshop: Meditação Mindfulness',
    slug: 'workshop-meditacao-mindfulness',
    description: 'Um workshop prático sobre mindfulness e suas aplicações no dia a dia.',
    date: '2024-07-20',
    time: '10:00',
    location: 'São Paulo, SP',
    category: 'Workshop',
    event_capacity: 30,
    status: 'upcoming',
    seo_description: 'Workshop prático de meditação mindfulness em São Paulo',
    registration_deadline: '2024-07-19T23:59:59',
  },
  {
    title: 'Palestra: Saúde Mental na Era Digital',
    slug: 'palestra-saude-digital',
    description: 'Uma palestra sobre os desafios da saúde mental na era digital.',
    date: '2024-07-25',
    time: '19:00',
    location: 'Rio de Janeiro, RJ',
    category: 'Palestra',
    event_capacity: 100,
    status: 'upcoming',
    seo_description: 'Palestra sobre saúde mental e o impacto da era digital',
  },
];

async function seedBlogCategories(conn) {
  console.log('\n📚  Seeding Blog Categories...');
  for (const cat of blogCategories) {
    const id = newId();
    const slug = cat.slug.toLowerCase().replace(/\s+/g, '-');
    await conn.query(
      `INSERT IGNORE INTO blog_categories 
       (id, name, slug, description, icon, color, order_rank) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, cat.name, slug, cat.description, cat.icon, cat.color, cat.order_rank],
    );
    console.log(`   ✅ ${cat.name}`);
  }
}

async function seedBlogPosts(conn, adminId, adminName, adminAvatar) {
  console.log('\n📝  Seeding Blog Posts...');
  for (const post of blogPosts) {
    // Obter category_id
    const [catResult] = await conn.query(
      'SELECT id FROM blog_categories WHERE name = ?',
      [post.category],
    );
    const categoryId = catResult[0]?.id || null;
    
    const id = newId();
    const slug = post.slug.toLowerCase().replace(/\s+/g, '-');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await conn.query(
      `INSERT IGNORE INTO blog_posts 
       (id, title, slug, excerpt, content, category_id, category, image_url, 
        author_id, author_name, author_avatar, read_time, status, featured, 
        seo_title, seo_description, seo_keywords, og_image_url, 
        post_date, published_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, post.title, slug, post.excerpt, post.content,
        categoryId, post.category, post.image_url,
        adminId, adminName, adminAvatar,
        post.read_time, post.status, post.featured ? 1 : 0,
        post.seo_title, post.seo_description, post.seo_keywords, post.og_image_url,
        now, post.status === 'published' ? now : null, now,
      ],
    );
    console.log(`   ✅ ${post.title}`);
  }
}

async function seedEventCategories(conn) {
  console.log('\n📅  Seeding Event Categories...');
  for (const cat of eventCategories) {
    const id = newId();
    const slug = cat.slug.toLowerCase().replace(/\s+/g, '-');
    await conn.query(
      `INSERT IGNORE INTO event_categories 
       (id, name, slug, description, icon, color, order_rank) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, cat.name, slug, cat.description, cat.icon, cat.color, cat.order_rank],
    );
    console.log(`   ✅ ${cat.name}`);
  }
}

// Chamar na função main():
// await seedBlogCategories(conn);
// await seedBlogPosts(conn, adminId, adminName, adminAvatar);
// await seedEventCategories(conn);
```

---

## 🔧 Migration SQL (Adicionar ao migrate.js)

Adicionar ao array `extraCols`:

```javascript
// Blog e Events
{ table: 'blog_posts',      column: 'slug',                def: 'VARCHAR(300) UNIQUE' },
{ table: 'blog_posts',      column: 'status',              def: "ENUM('draft','published','archived') DEFAULT 'draft'" },
{ table: 'blog_posts',      column: 'seo_title',           def: 'VARCHAR(160)' },
{ table: 'blog_posts',      column: 'seo_description',     def: 'VARCHAR(160)' },
{ table: 'blog_posts',      column: 'seo_keywords',        def: 'VARCHAR(300)' },
{ table: 'blog_posts',      column: 'og_image_url',        def: 'TEXT' },
{ table: 'blog_posts',      column: 'featured',            def: 'TINYINT(1) DEFAULT 0' },
{ table: 'blog_posts',      column: 'featured_until',      def: 'DATETIME' },
{ table: 'blog_posts',      column: 'views_count',         def: 'INT DEFAULT 0' },
{ table: 'blog_posts',      column: 'published_at',        def: 'DATETIME' },
{ table: 'blog_posts',      column: 'category_id',         def: 'CHAR(36)' },

{ table: 'health_events',   column: 'slug',                def: 'VARCHAR(300)' },
{ table: 'health_events',   column: 'category_id',         def: 'CHAR(36)' },
{ table: 'health_events',   column: 'event_capacity',      def: 'INT DEFAULT 0' },
{ table: 'health_events',   column: 'waitlist_count',      def: 'INT DEFAULT 0' },
{ table: 'health_events',   column: 'seo_description',     def: 'VARCHAR(300)' },
{ table: 'health_events',   column: 'thumbnail_url',       def: 'TEXT' },
{ table: 'health_events',   column: 'status_enum',         def: "ENUM('draft','upcoming','ongoing','past','cancelled') DEFAULT 'draft'" },
{ table: 'health_events',   column: 'registration_deadline', def: 'DATETIME' },
```

---

## 🎯 Query Examples

### Buscar posts destacados (featured)

```sql
SELECT * FROM blog_posts
WHERE featured = 1
  AND featured_until > NOW()
  AND status = 'published'
ORDER BY post_date DESC
LIMIT 5;
```

### Buscar posts por categoria com contagem

```sql
SELECT 
  bp.id, bp.title, bp.slug, bp.excerpt,
  bc.name AS category_name, bc.color,
  COUNT(*) OVER (PARTITION BY bp.category_id) as posts_in_category
FROM blog_posts bp
JOIN blog_categories bc ON bp.category_id = bc.id
WHERE bp.status = 'published'
ORDER BY bc.order_rank, bp.post_date DESC;
```

### Busca full-text

```sql
SELECT *, MATCH(title, content) AGAINST('+meditacao -yoga' IN BOOLEAN MODE) AS relevance
FROM blog_posts
WHERE MATCH(title, content) AGAINST('+meditacao -yoga' IN BOOLEAN MODE)
  AND status = 'published'
ORDER BY relevance DESC;
```

### Posts mais populares (por likes)

```sql
SELECT id, title, likes, views_count, 
       (likes + (views_count / 100)) AS popularity_score
FROM blog_posts
WHERE status = 'published'
ORDER BY popularity_score DESC
LIMIT 10;
```

### Eventos com disponibilidade

```sql
SELECT 
  id, title, event_date, event_time,
  participants_count, event_capacity,
  (event_capacity - participants_count) AS available_slots,
  CASE 
    WHEN event_capacity = 0 THEN 'Ilimitado'
    WHEN participants_count >= event_capacity THEN 'Lotado'
    ELSE CONCAT(event_capacity - participants_count, ' vagas')
  END AS status_capacity
FROM health_events
WHERE status_enum = 'upcoming'
ORDER BY event_date;
```

### Inscritos em evento com detalhes

```sql
SELECT 
  he.id AS event_id,
  he.title,
  u.id AS user_id,
  u.name,
  u.email
FROM health_events he
JOIN JSON_TABLE(
  he.enrolled_user_ids,
  '$[*]' COLUMNS (user_id VARCHAR(36) PATH '$')
) AS jt
JOIN users u ON u.id = jt.user_id
WHERE he.id = 'event-uuid-123';
```

---

## 📊 Admin Dashboard Queries

### Stats do Blog
```sql
SELECT 
  COUNT(*) as total_posts,
  SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
  SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
  ROUND(AVG(likes), 2) as avg_likes,
  ROUND(AVG(views_count), 2) as avg_views
FROM blog_posts;
```

### Posts em rascunho para revisar
```sql
SELECT id, title, author_name, updated_at
FROM blog_posts
WHERE status = 'draft'
ORDER BY updated_at DESC;
```

### Eventos em breve (próximos 30 dias)
```sql
SELECT id, title, event_date, event_time, participants_count, event_capacity
FROM health_events
WHERE DATE(event_date) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
  AND status_enum != 'cancelled'
ORDER BY event_date;
```

---

## ✅ Checklist de Implementação

- [x] Schema SQL (blog_posts com SEO, blog_categories, event_categories)
- [x] API Endpoints para Blog (CRUD, likes, categorias)
- [x] API Endpoints para Events (CRUD, enroll, categorias)
- [x] Migrations SQL
- [x] Seed data
- [x] Documentação de queries
- [ ] Controller TypeScript (blogsController.ts expandido)
- [ ] Controller TypeScript (eventsController.ts expandido)
- [ ] Type definitions (types.ts)
- [ ] React components para admin
- [ ] React components para public views

---

## 🚀 Próximos Passos

1. **Executar migration**: `npm run migrate` (server/)
2. **Popular dados iniciais**: `npm run seed`
3. **Testar endpoints**: Use os curl examples acima
4. **Criar UI Admin**: Painel para CRUD de posts e eventos
5. **Criar UI Pública**: Página de blog, listagem de eventos
6. **SEO**: Implementar meta tags nas páginas React

---

## 📝 Notas Técnicas

- **Slugs**: Sempre lowercase, sem espaços, com hífens
- **SEO**: Máx 160 chars para title e description
- **Status Blog**: `draft` (rascunho) | `published` (publicado) | `archived` (arquivado)
- **Status Event**: `draft` | `upcoming` | `ongoing` | `past` | `cancelled`
- **Views Count**: Incrementar em GET /api/blogs/:id ou /api/blogs/slug/:slug
- **Categories**: Cache de contagem (post_count, event_count) deve ser atualizado em INSERT/DELETE
