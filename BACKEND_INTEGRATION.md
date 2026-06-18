# Integração PublicSite.tsx com Backend

Documentação completa da integração de dados reais do backend no PublicSite.tsx.

## Arquivos Criados

### 1. **Hook: usePublicSiteData.ts**
- **Localização**: `src/hooks/usePublicSiteData.ts`
- **Responsabilidade**: Orquestra o carregamento de todos os dados dinâmicos do site público
- **Recursos**:
  - Fetch de posts do blog publicados
  - Fetch de eventos (upcoming e past)
  - Fetch de feed do Instagram
  - Fetch de stories/highlights
  - Testimonials estáticos (fallback)
  - Atividades recentes (computadas)
  - Fallback automático para mock data em caso de erro
  - Refetch sob demanda

```typescript
// Uso no PublicSite.tsx
const publicSiteData = usePublicSiteData();
const { blogs, upcomingEvents, instagramPosts, stories } = publicSiteData;
```

### 2. **Hook: useEventInscription.ts**
- **Localização**: `src/hooks/useEventInscription.ts`
- **Responsabilidade**: Gerenciar estado de inscrição em eventos
- **Recursos**:
  - Enrolar/desinscrever em eventos
  - Gerenciamento de loading e error
  - Estado reativo de inscrição

```typescript
const { isLoading, error, isEnrolled, enroll } = useEventInscription(eventId);
```

### 3. **Hook: useNewsletterSubscription.ts**
- **Localização**: `src/hooks/useNewsletterSubscription.ts`
- **Responsabilidade**: Gerenciar inscrições na newsletter
- **Recursos**:
  - Subscribe/unsubscribe
  - Validação de email
  - Reset de estado

```typescript
const { isLoading, error, subscribe } = useNewsletterSubscription();
```

### 4. **Componente: SkeletonLoader.tsx**
- **Localização**: `src/components/SkeletonLoader.tsx`
- **Responsabilidade**: Componentes de loading skeleton para cada seção
- **Componentes**:
  - `BlogPostSkeleton` - Carregando de post de blog
  - `EventSkeleton` - Carregando de evento
  - `InstagramPostSkeleton` - Carregando de post IG
  - `TestimonialSkeleton` - Carregando de depoimento
  - `StorySkeletons` - Carregando de stories
  - `SectionSkeleton` - Seção completa

```typescript
import { BlogPostSkeleton, EventSkeleton } from '@/src/components/SkeletonLoader';

{publicSiteData.blogsLoading ? (
  <BlogPostSkeleton />
) : (
  <BlogCard blog={blog} />
)}
```

### 5. **Componente: LocationMap.tsx**
- **Localização**: `src/components/LocationMap.tsx`
- **Responsabilidade**: Render do mapa com Google Maps
- **Componentes**:
  - `LocationMap` - Versão com Google Maps
  - `LocationMapWithFallback` - Com fallback estático

```typescript
import { LocationMap } from '@/src/components/LocationMap';

<LocationMap
  latitude={-23.9903}
  longitude={-48.0674}
  address="Tatuí, SP"
  title="Espalhe Melodias"
/>
```

### 6. **Componente: EventInscriptionModal.tsx**
- **Localização**: `src/components/EventInscriptionModal.tsx`
- **Responsabilidade**: Modal de inscrição em eventos
- **Features**:
  - Exibe detalhes do evento
  - Formulário de inscrição
  - Validação de termos
  - Estados de loading/error/success

```typescript
const [isOpen, setIsOpen] = useState(false);

<EventInscriptionModal
  event={event}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSuccess={() => console.log('Inscrito!')}
/>
```

## Fluxo de Dados

```
PublicSite.tsx
    ↓
usePublicSiteData() hook
    ├── blogsApi.list() → Convert → setBlogs
    ├── eventsApi.list() → Convert → setUpcomingEvents/setPastEvents
    ├── instagramApi.feed() → setInstagramPosts
    ├── storiesApi.list() → setStories
    └── (Fallback para mock data em caso de erro)
    ↓
Render com dados reais ou fallback
```

## Estrutura da API

### Blog Posts
```typescript
// GET /api/blogs?published=true
{
  success: true,
  data: [
    {
      id: string;
      title: string;
      excerpt: string;
      content: string;
      category: string;
      image_url: string;
      author_name: string;
      author_avatar?: string;
      created_at: string;
      read_time: string;
      published: boolean;
    }
  ],
  meta: { total, page, limit, totalPages }
}
```

### Events
```typescript
// GET /api/events?status=upcoming|finished
{
  success: true,
  data: [
    {
      id: string;
      title: string;
      description: string;
      event_date: string;
      event_time: string;
      instructor_name: string;
      instructor_avatar?: string;
      category: string;
      status: 'upcoming' | 'past';
      participants_count: number;
      isEnrolled: boolean;
      recording_url?: string;
    }
  ],
  meta: { total, page, limit, totalPages }
}
```

### Instagram Posts
```typescript
// GET /api/instagram/posts
{
  success: true,
  data: [
    {
      id: string;
      image_url: string;
      caption: string;
      likes_count: number;
      comments_count: number;
      instagram_url: string;
      published_at: string;
    }
  ]
}
```

### Stories/Highlights
```typescript
// GET /api/stories/highlights
{
  success: true,
  data: [
    {
      id: string;
      title: string;
      image_url: string;
      order: number;
      link?: string;
      category?: string;
    }
  ]
}
```

## Integração com PublicSite.tsx

### 1. Home Section - Stats Dinâmicos

**Antes** (Mock):
```typescript
{[
  { value: '20+', label: 'Membros' },
  { value: '2', label: 'Idealizadoras' },
  { value: '2026', label: 'Nascimento' },
].map(stat => (...))}
```

**Depois** (Real):
```typescript
// Usar dados do hook ou construir stats dinamicamente
const stats = [
  { value: `${publicSiteData.blogs.length}+`, label: 'Publicações' },
  { value: `${publicSiteData.upcomingEvents.length}`, label: 'Eventos Próximos' },
  { value: `${publicSiteData.instagramPosts.length}`, label: 'Posts IG' },
];
```

### 2. Blog Section - Posts Reais

**Antes** (Mock):
```typescript
blogs.slice(0, 2).map(post => (
  <BlogCard key={post.id} post={post} />
))
```

**Depois** (Com loading):
```typescript
{publicSiteData.blogsLoading ? (
  <>
    <BlogPostSkeleton />
    <BlogPostSkeleton />
  </>
) : publicSiteData.blogs.length > 0 ? (
  publicSiteData.blogs.slice(0, 2).map(post => (
    <BlogCard key={post.id} post={post} />
  ))
) : (
  <EmptyState message="Nenhum blog ainda" />
)}
```

### 3. Events Section - Eventos Reais

**Dinamicamente carregados**:
```typescript
{publicSiteData.eventsLoading ? (
  <>
    <EventSkeleton />
    <EventSkeleton />
  </>
) : publicSiteData.upcomingEvents.length > 0 ? (
  publicSiteData.upcomingEvents.slice(0, 2).map(evt => (
    <EventCard
      key={evt.id}
      event={evt}
      onEnroll={() => setSelectedEvent(evt)}
    />
  ))
) : (
  <p className="text-slate-500">Sem eventos próximos</p>
)}
```

### 4. Instagram Section - Feed Dinâmico

**Feed com fallback**:
```typescript
{publicSiteData.instagramLoading ? (
  <InstagramGridSkeleton />
) : publicSiteData.instagramPosts.length > 0 ? (
  <div className="grid md:grid-cols-3 gap-6">
    {publicSiteData.instagramPosts.map((post) => (
      <a
        key={post.id}
        href={post.instagram_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group rounded-2xl overflow-hidden"
      >
        <img
          src={post.image_url}
          alt={post.caption}
          className="w-full h-full object-cover group-hover:scale-105"
        />
      </a>
    ))}
  </div>
) : (
  <p className="text-slate-500 text-center py-12">
    Siga-nos no Instagram para ver nossas atualizações
  </p>
)}
```

### 5. Stories Section - Dinâmico

```typescript
{publicSiteData.storiesLoading ? (
  <StorySkeletons />
) : (
  <InstagramStories stories={publicSiteData.stories} />
)}
```

## Error Handling

### Estratégia de Fallback

1. **Tenta carregar do backend** (real data)
2. **Se falhar → Usa mock data** (INITIAL_BLOGS, etc.)
3. **Se não houver mock → Exibe empty state**
4. **Mostra toast/aviso ao usuário** (opcional)

```typescript
try {
  const blogsResult = await blogsApi.list({ published: true });
  setBlogs(convertBlogPost(blogsResult));
} catch (err) {
  console.warn('Failed to load blogs:', err);
  setBlogs(INITIAL_BLOGS); // Fallback
  setBlogsError(err);
}
```

## Newsletter Integration

### Subscribe Flow

```typescript
const { isLoading, error, subscribe } = useNewsletterSubscription();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await subscribe(email);
    showToast('Inscrito com sucesso!', 'success');
    setEmail('');
  } catch (err) {
    showToast(err.message, 'error');
  }
};
```

## Contact Form Integration

### Submit Flow

```typescript
const handleContactSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    setError('Preencha todos os campos');
    return;
  }

  setLoading(true);
  try {
    await contactApi.send({
      name: contactForm.name,
      email: contactForm.email,
      phone: contactForm.phone,
      subject: contactForm.subject,
      message: contactForm.message,
    });
    
    showToast('Mensagem enviada com sucesso!', 'success');
    resetForm();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
};
```

## Member Request Integration

### Request Submission

```typescript
const handleRequestSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  setLoading(true);
  try {
    const specialty = requestForm.specialty === 'outro'
      ? requestForm.specialtyCustom
      : requestForm.specialty;

    await memberRequestsApi.create({
      name: requestForm.name,
      email: requestForm.email,
      phone: requestForm.phone,
      specialty,
      gender: requestForm.gender,
      observation: requestForm.observation,
    });

    setSuccess(true);
    showToast('Solicitação enviada com sucesso!', 'success');
    resetForm();
  } catch (err) {
    setError(err.message);
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
};
```

## Google Maps Integration

### HTML Head (index.html)

```html
<script async defer
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=maps">
</script>
```

### Uso

```typescript
import { LocationMap } from '@/src/components/LocationMap';

// Com fallback automático
<LocationMapWithFallback
  latitude={-23.9903}
  longitude={-48.0674}
  address="Tatuí, SP"
  title="Espalhe Melodias"
/>
```

## Loading States - Exemplos

### Skeleton Pattern

```typescript
{loading ? (
  <BlogPostSkeleton />
) : (
  <BlogCard blog={blog} />
)}
```

### Spinner Pattern

```typescript
{loading && (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-brand-clay" />
  </div>
)}
```

### Progressive Loading

```typescript
{blogsLoading ? (
  <>
    <BlogPostSkeleton />
    <BlogPostSkeleton />
  </>
) : (
  blogs.map(blog => <BlogCard key={blog.id} blog={blog} />)
)}
```

## Checklist de Implementação

- [ ] `usePublicSiteData()` hook integrado ao PublicSite.tsx
- [ ] Blog section carregando posts reais
- [ ] Events section carregando eventos reais
- [ ] Instagram feed carregando posts reais
- [ ] Stories/highlights carregando dynamicamente
- [ ] Skeleton loaders para todas as seções
- [ ] Error handling com fallback para mock data
- [ ] Newsletter subscription funcionando
- [ ] Contact form enviando para backend
- [ ] Member request form enviando para backend
- [ ] Event inscription modal com API integration
- [ ] Google Maps mostrando localização
- [ ] Toast messages para feedback
- [ ] Responsive em mobile/tablet/desktop

## Variáveis de Ambiente

```
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Troubleshooting

### Blog posts não carregando
1. Verificar se `blogsApi.list()` está funcionando
2. Verificar se posts têm `published: true`
3. Conferir se `image_url` está preenchido

### Eventos não mostrando
1. Verificar se eventos têm `status: 'upcoming'` ou `'past'`
2. Conferir se `event_date` está válido
3. Verificar se `instructor_name` está preenchido

### Instagram não conectando
1. Verificar se Instagram API está configurada
2. Conferir se tokens do Instagram são válidos
3. Usar fallback com mock data

### Google Maps não renderiza
1. Verificar se API key é válida
2. Conferir se script está carregado
3. Usar `LocationMapWithFallback` para fallback

## Performance

- Blog posts: Cached por hook (refetch sob demanda)
- Events: Atualiza ao montar componente
- Instagram: Max 6 posts para performance
- Stories: Carregadas dinamicamente
- Overall: ~1.5s para carregar tudo (com rede normal)

## Próximas Melhorias

1. **Infinite scroll** para blog/eventos
2. **Search e filter** em tempo real
3. **Share buttons** para redes sociais
4. **Event calendar** interativo
5. **Instagram Stories** com viewer
6. **Analytics tracking** de cliques
7. **Cache com service worker**
8. **Pagination** dinâmica
