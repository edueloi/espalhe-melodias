# Instagram Integration — React Components

**Data**: 18 de Junho de 2026

---

## 📱 React Components para Exibir Feed do Instagram

### Componente 1: InstagramFeed (Feed Grid)

```typescript
// src/components/InstagramFeedView.tsx

import { useEffect, useState } from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { Button, PageWrapper, SectionTitle, EmptyState, ContentCard } from '@/src/components/ui';

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  media_url: string;
  like_count: number;
  comments_count: number;
  timestamp: string;
  permalink: string;
}

interface InstagramStats {
  username: string;
  name: string;
  followers_count: number;
  media_count: number;
  profile_picture_url: string;
  biography: string;
  website?: string;
}

export function InstagramFeedView() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [stats, setStats] = useState<InstagramStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeed();
  }, []);

  async function fetchFeed() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/instagram/feed?limit=9');
      const data = await response.json();

      if (data.success) {
        setPosts(data.data.posts);
        setStats(data.data.stats);
        toast({
          type: 'success',
          message: `Carregado ${data.data.posts.length} posts do Instagram`,
        });
      } else {
        const message = data.error || 'Falha ao carregar feed do Instagram';
        setError(message);
        toast({
          type: 'error',
          message,
        });
      }
    } catch (err) {
      const message = 'Erro de rede ao carregar feed do Instagram';
      setError(message);
      toast({
        type: 'error',
        message,
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando feed do Instagram...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <EmptyState
          icon="AlertCircle"
          title="Erro ao carregar Instagram"
          description={error}
          action={<Button onClick={fetchFeed}>Tentar novamente</Button>}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header com Stats */}
      {stats && (
        <div className="mb-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={stats.profile_picture_url}
              alt={stats.username}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold">{stats.name}</h2>
              <p className="text-gray-600">@{stats.username}</p>
            </div>
          </div>

          <p className="text-gray-700 mb-4">{stats.biography}</p>

          {stats.website && (
            <a
              href={stats.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary font-semibold hover:underline"
            >
              {stats.website}
            </a>
          )}

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded">
              <p className="text-gray-600 text-sm">Seguidores</p>
              <p className="text-2xl font-bold text-brand-primary">
                {stats.followers_count.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-white p-4 rounded">
              <p className="text-gray-600 text-sm">Posts</p>
              <p className="text-2xl font-bold text-brand-primary">
                {stats.media_count}
              </p>
            </div>
            <div className="bg-white p-4 rounded md:col-span-1 col-span-2">
              <a
                href={`https://instagram.com/${stats.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="secondary" size="sm">
                  Seguir no Instagram
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Título */}
      <SectionTitle
        title="Últimas postagens"
        subtitle={`${posts.length} dos últimos posts publicados`}
      />

      {/* Grid de Posts */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-square">
                <img
                  src={post.media_url}
                  alt={post.caption || 'Instagram post'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* Overlay com stats */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center gap-6">
                  <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-2xl font-bold">{post.like_count}</div>
                    <div className="text-sm">Curtidas</div>
                  </div>
                  <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-2xl font-bold">{post.comments_count}</div>
                    <div className="text-sm">Comentários</div>
                  </div>
                </div>
              </div>

              {/* Caption */}
              {post.caption && (
                <p className="mt-3 text-gray-700 text-sm line-clamp-2">
                  {post.caption}
                </p>
              )}

              {/* Data */}
              <p className="text-gray-500 text-xs mt-2">
                {new Date(post.timestamp).toLocaleDateString('pt-BR')}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum post encontrado"
          description="Carregue o feed ou verifique a configuração do Instagram"
        />
      )}

      {/* Refresh Button */}
      <div className="mt-8 text-center">
        <Button onClick={fetchFeed} variant="secondary">
          Atualizar Feed
        </Button>
      </div>
    </PageWrapper>
  );
}
```

---

### Componente 2: InstagramStats (Card Compacto)

```typescript
// src/components/ui/InstagramStats.tsx

import { useEffect, useState } from 'react';
import { ContentCard, StatGrid } from '@/src/components/ui';

interface InstagramStats {
  username: string;
  name: string;
  followers_count: number;
  media_count: number;
  biography: string;
  profile_picture_url: string;
}

interface InstagramStatsProps {
  onError?: (error: string) => void;
}

export function InstagramStats({ onError }: InstagramStatsProps) {
  const [stats, setStats] = useState<InstagramStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const response = await fetch('/api/instagram/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        onError?.(data.error || 'Falha ao carregar estatísticas');
      }
    } catch (error) {
      onError?.('Erro ao conectar ao Instagram');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <ContentCard>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </ContentCard>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <ContentCard>
      <div className="flex items-center gap-4 mb-4">
        <img
          src={stats.profile_picture_url}
          alt={stats.username}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h3 className="font-bold">{stats.name}</h3>
          <a
            href={`https://instagram.com/${stats.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-primary hover:underline"
          >
            @{stats.username}
          </a>
        </div>
      </div>

      <StatGrid
        stats={[
          {
            label: 'Seguidores',
            value: stats.followers_count.toLocaleString('pt-BR'),
            icon: 'Users',
          },
          {
            label: 'Posts',
            value: stats.media_count,
            icon: 'Image',
          },
        ]}
      />

      <p className="text-sm text-gray-600 mt-4">{stats.biography}</p>
    </ContentCard>
  );
}
```

---

### Componente 3: InstagramStoriesCarousel

```typescript
// src/components/InstagramStoriesCarousel.tsx

import { useEffect, useState } from 'react';
import { IconButton } from '@/src/components/ui';

interface InstagramStory {
  id: string;
  media_type: string;
  media_url: string;
  timestamp: string;
}

export function InstagramStoriesCarousel() {
  const [stories, setStories] = useState<InstagramStory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    try {
      const response = await fetch('/api/instagram/stories');
      const data = await response.json();

      if (data.success) {
        setStories(data.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || stories.length === 0) {
    return null;
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Story Display */}
      <div className="relative aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden">
        <img
          src={currentStory.media_url}
          alt="Story"
          className="w-full h-full object-cover"
        />

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / stories.length) * 100}%`,
            }}
          ></div>
        </div>

        {/* Close Button */}
        <button className="absolute top-4 right-4 text-white hover:bg-black/20 rounded-full p-2">
          ✕
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mt-4">
        <IconButton
          icon="ChevronLeft"
          variant="ghost"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
        />
        <div className="flex-1 flex gap-1">
          {stories.map((_, index) => (
            <button
              key={index}
              className={`flex-1 h-1 rounded ${
                index === currentIndex ? 'bg-brand-primary' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
        <IconButton
          icon="ChevronRight"
          variant="ghost"
          disabled={currentIndex === stories.length - 1}
          onClick={() => setCurrentIndex((i) => i + 1)}
        />
      </div>

      {/* Story Counter */}
      <p className="text-center text-sm text-gray-600 mt-4">
        {currentIndex + 1} de {stories.length}
      </p>
    </div>
  );
}
```

---

### Componente 4: InstagramFeedWidget (Sidebar)

```typescript
// src/components/ui/InstagramFeedWidget.tsx

import { useEffect, useState } from 'react';
import { Badge } from '@/src/components/ui';

interface InstagramPost {
  id: string;
  media_url: string;
  like_count: number;
  timestamp: string;
  permalink: string;
}

export function InstagramFeedWidget() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  async function fetchFeed() {
    try {
      const response = await fetch('/api/instagram/feed?limit=6');
      const data = await response.json();

      if (data.success) {
        setPosts(data.data.posts);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 rounded"></div>
      ))}
    </div>;
  }

  return (
    <div className="space-y-3">
      <h4 className="font-bold text-sm">Últimas do Instagram</h4>
      <div className="grid grid-cols-3 gap-2">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded"
          >
            <img
              src={post.media_url}
              alt="Post"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {post.like_count}
              </span>
            </div>
          </a>
        ))}
      </div>
      <a
        href="https://instagram.com/espalhe_melodias"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-brand-primary font-semibold hover:underline block"
      >
        Ver no Instagram →
      </a>
    </div>
  );
}
```

---

## 🔌 Como Integrar nos Views Existentes

### Adicionar Feed do Instagram em uma Página

```typescript
// src/components/HomeView.tsx

import { InstagramFeedView } from './InstagramFeedView';
import { PageWrapper, SectionTitle } from './ui';

export function HomeView() {
  return (
    <PageWrapper>
      {/* ... outros conteúdos ... */}

      {/* Seção Instagram */}
      <div className="my-12">
        <SectionTitle title="Acompanhe a gente no Instagram" />
        <InstagramFeedView />
      </div>
    </PageWrapper>
  );
}
```

### Adicionar Widget na Sidebar

```typescript
// src/components/Sidebar.tsx

import { InstagramFeedWidget } from './ui/InstagramFeedWidget';

export function Sidebar() {
  return (
    <aside className="space-y-6">
      {/* ... outros widgets ... */}

      {/* Instagram Widget */}
      <div className="p-4 bg-white rounded border">
        <InstagramFeedWidget />
      </div>
    </aside>
  );
}
```

---

## ⚙️ Configurações Responsivas

Os componentes usam Tailwind CSS e são responsivos:

- **Mobile**: Grid 1 coluna
- **Tablet**: Grid 2 colunas
- **Desktop**: Grid 3 colunas

```typescript
// Exemplo de grid responsivo já implementado
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Posts */}
</div>
```

---

## 🎨 Personalizações

### Mudar cores

```typescript
// Altere as classes Tailwind conforme brand
className="text-brand-primary"  // Cor primária
className="text-brand-secondary" // Cor secundária
className="bg-gradient-to-r from-pink-50 to-purple-50" // Gradiente
```

### Adicionar loading states

```typescript
if (loading) {
  return <Skeleton count={9} className="h-64" />;
}
```

### Adicionar error boundaries

```typescript
<ErrorBoundary fallback={<p>Erro ao carregar Instagram</p>}>
  <InstagramFeedView />
</ErrorBoundary>
```

---

## 📦 Componentes Utilizados (UI Design System)

- `PageWrapper` — Layout wrapper
- `SectionTitle` — Títulos de seção
- `Button` — Botões
- `IconButton` — Botões com ícones
- `ContentCard` — Cards de conteúdo
- `StatGrid` — Grid de estatísticas
- `EmptyState` — Estado vazio
- `Badge` — Tags/badges

Todos disponíveis em `@/src/components/ui/`

---

**Pronto para usar!** 🎉
