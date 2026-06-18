# Exemplos de Integração - PublicSite.tsx

Exemplos práticos de como usar os novos hooks e componentes no PublicSite.tsx.

## 1. Seção de Blog com Dados Reais

### Antes (Mock)
```typescript
const MOCK_BLOGS = [...];

<section className="py-20 max-w-6xl mx-auto px-6">
  <div className="grid md:grid-cols-2 gap-6">
    {blogs.slice(0, 2).map(post => (
      <BlogCard key={post.id} post={post} />
    ))}
  </div>
</section>
```

### Depois (Real + Loading)
```typescript
import { BlogPostSkeleton } from '@/src/components/SkeletonLoader';

const publicSiteData = usePublicSiteData();
const { blogs, blogsLoading, blogsError } = publicSiteData;

<section className="py-20 max-w-6xl mx-auto px-6">
  <div className="flex items-end justify-between mb-10">
    <div>
      <p className="text-xs font-bold text-brand-clay uppercase tracking-widest mb-2">Blog & Conteúdo</p>
      <h2 className="font-serif text-3xl font-bold text-brand-navy">Últimas publicações</h2>
    </div>
    <button onClick={() => scrollTo('blog')} className="flex items-center space-x-1 text-sm text-brand-clay font-bold hover:underline">
      <span>Ver todos</span>
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>

  {blogsLoading ? (
    <div className="grid md:grid-cols-2 gap-6">
      <BlogPostSkeleton />
      <BlogPostSkeleton />
    </div>
  ) : blogsError ? (
    <div className="text-center py-12 bg-brand-sand/30 rounded-xl border border-brand-sand">
      <AlertCircle className="w-12 h-12 text-brand-clay mx-auto mb-3 opacity-50" />
      <p className="text-slate-600 font-semibold mb-2">Erro ao carregar blogs</p>
      <button
        onClick={() => publicSiteData.refetch()}
        className="text-xs text-brand-clay font-bold hover:underline"
      >
        Tentar novamente
      </button>
    </div>
  ) : blogs.length === 0 ? (
    <EmptyState
      icon={BookOpen}
      title="Nenhum blog publicado ainda"
      description="Em breve teremos novos conteúdos disponíveis"
    />
  ) : (
    <div className="grid md:grid-cols-2 gap-6">
      {blogs.slice(0, 2).map(post => (
        <button
          key={post.id}
          onClick={() => setSelectedBlog(post)}
          className="text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-sand hover:shadow-lg hover:-translate-y-0.5 transition group"
        >
          <div className="relative overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur text-brand-clay text-xs font-bold px-3 py-1 rounded-full">
                {post.category}
              </span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-serif text-lg font-bold text-brand-navy mb-2 leading-snug group-hover:text-brand-clay transition">
              {post.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-xs text-slate-500 font-semibold">
                  {post.authorName}
                </span>
              </div>
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{post.readTime}</span>
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  )}
</section>
```

## 2. Seção de Eventos com Inscrição Modal

### Implementação
```typescript
import { EventInscriptionModal } from '@/src/components/EventInscriptionModal';
import { EventSkeleton } from '@/src/components/SkeletonLoader';

const [selectedEvent, setSelectedEvent] = useState<HealthEvent | null>(null);
const publicSiteData = usePublicSiteData();
const { upcomingEvents, eventsLoading, eventsError } = publicSiteData;

<section className="py-16 bg-brand-sand/40">
  <div className="max-w-6xl mx-auto px-6">
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="text-xs font-bold text-brand-moss uppercase tracking-widest mb-2">
          Agenda
        </p>
        <h2 className="font-serif text-3xl font-bold text-brand-navy">
          Próximos encontros
        </h2>
      </div>
      <button
        onClick={() => scrollTo('events')}
        className="flex items-center space-x-1 text-sm text-brand-moss font-bold hover:underline"
      >
        <span>Ver agenda</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>

    {eventsLoading ? (
      <div className="grid md:grid-cols-2 gap-5">
        <EventSkeleton />
        <EventSkeleton />
      </div>
    ) : eventsError ? (
      <div className="text-center py-12 bg-white rounded-xl border-2 border-brand-sand">
        <p className="text-slate-600">Erro ao carregar eventos. Tente novamente.</p>
      </div>
    ) : upcomingEvents.length === 0 ? (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600">Nenhum evento próximo no momento</p>
      </div>
    ) : (
      <div className="grid md:grid-cols-2 gap-5">
        {upcomingEvents.slice(0, 2).map(evt => (
          <div
            key={evt.id}
            className="bg-white rounded-2xl p-6 border border-brand-sand shadow-sm flex items-start space-x-4 hover:shadow-md transition group"
          >
            <div className="w-14 h-14 bg-brand-moss/10 rounded-xl flex flex-col items-center justify-center shrink-0 group-hover:bg-brand-moss/20 transition">
              <span className="text-xs font-bold text-brand-moss">
                {new Date(evt.date).toLocaleDateString('pt-BR', {
                  month: 'short',
                }).toUpperCase()}
              </span>
              <span className="text-xl font-black text-brand-moss leading-none">
                {new Date(evt.date).getDate()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-brand-clay uppercase tracking-wider">
                {evt.category}
              </span>
              <h3 className="font-semibold text-brand-navy text-sm mt-0.5 leading-snug">
                {evt.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{evt.time}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1.5">
                Com: <span className="font-semibold text-brand-navy">{evt.instructorName}</span>
              </p>
              <button
                onClick={() => setSelectedEvent(evt)}
                className="mt-3 text-xs text-brand-clay font-bold hover:underline flex items-center space-x-0.5 group-hover:space-x-1 transition"
              >
                <span>Inscrever-se</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Event Inscription Modal */}
  {selectedEvent && (
    <EventInscriptionModal
      event={selectedEvent}
      isOpen={Boolean(selectedEvent)}
      onClose={() => setSelectedEvent(null)}
      onSuccess={() => {
        showToast('Inscrição confirmada! Verifique seu e-mail.', 'success');
        publicSiteData.refetch();
      }}
    />
  )}
</section>
```

## 3. Seção do Instagram com Fallback

### Implementação
```typescript
import { InstagramStories } from './InstagramStories';
import { InstagramPostSkeleton } from '@/src/components/SkeletonLoader';

const publicSiteData = usePublicSiteData();
const { instagramPosts, stories, instagramLoading, storiesLoading } = publicSiteData;

<section className="py-20 max-w-6xl mx-auto px-6">
  <div className="flex items-end justify-between mb-10">
    <div>
      <p className="text-xs font-bold text-brand-clay uppercase tracking-widest mb-2">
        Nos Acompanhe
      </p>
      <h2 className="font-serif text-3xl font-bold text-brand-navy">
        Momentos no Instagram
      </h2>
    </div>
    <a
      href="https://instagram.com/espalhemelodias"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-2 text-sm bg-gradient-to-r from-pink-500 to-brand-clay text-white px-4 py-2.5 rounded-xl font-bold hover:shadow-lg transition shadow-md"
    >
      <Instagram className="w-4 h-4" />
      <span>Seguir @espalhemelodias</span>
    </a>
  </div>

  {/* Stories - Dinâmico */}
  <div className="mb-12">
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
      Stories Recentes
    </p>
    {storiesLoading ? (
      <StorySkeletons />
    ) : stories.length > 0 ? (
      <InstagramStories stories={stories} loading={false} />
    ) : (
      <p className="text-slate-500 py-8">Nenhuma story no momento</p>
    )}
  </div>

  {/* Posts Grid - Dinâmico */}
  {instagramLoading ? (
    <div className="grid md:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <InstagramPostSkeleton key={i} />
      ))}
    </div>
  ) : instagramPosts.length > 0 ? (
    <div className="grid md:grid-cols-3 gap-6">
      {instagramPosts.map((post) => (
        <a
          key={post.id}
          href={post.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 border border-slate-100"
        >
          <div className="relative overflow-hidden bg-slate-100 aspect-square">
            <img
              src={post.image_url}
              alt={post.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-white">
                  <Heart className="w-5 h-5 fill-current" />
                  <span className="font-bold text-sm">{post.likes_count}</span>
                </div>
                <div className="flex items-center space-x-1 text-white">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-bold text-sm">{post.comments_count}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white">
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {post.caption}
            </p>
          </div>
        </a>
      ))}
    </div>
  ) : (
    <div className="text-center py-12">
      <p className="text-slate-500">
        Nenhum post encontrado. Siga-nos no Instagram!
      </p>
    </div>
  )}
</section>
```

## 4. Newsletter com Validação

### Implementação
```typescript
import { useNewsletterSubscription } from '@/src/hooks/useNewsletterSubscription';

const { isLoading, error, isSubscribed, subscribe, resetState } = useNewsletterSubscription();
const [newsletterEmail, setNewsletterEmail] = useState('');
const { showToast } = useToast();

const handleNewsletterSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const email = newsletterEmail.trim();

  if (!email) {
    showToast('Por favor, insira seu e-mail.', 'error');
    return;
  }

  if (!validateEmail(email)) {
    showToast('Por favor, insira um e-mail válido.', 'error');
    return;
  }

  try {
    await subscribe(email);
    showToast('E-mail cadastrado com sucesso!', 'success');
    setNewsletterEmail('');
    setTimeout(resetState, 3000);
  } catch (err) {
    showToast(error || 'Erro ao cadastrar e-mail', 'error');
  }
};

<section className="py-16 bg-gradient-to-r from-brand-clay/90 to-brand-clay-dark">
  <div className="max-w-2xl mx-auto px-6 text-center">
    <h2 className="font-serif text-3xl font-bold text-white mb-3">
      Fique por dentro das novidades
    </h2>
    <p className="text-white/90 mb-8 max-w-md mx-auto">
      Receba artigos, dicas de saúde mental e informações sobre nossos eventos.
    </p>

    {isSubscribed ? (
      <div className="flex items-center justify-center gap-3 bg-white/20 border border-white/30 rounded-xl px-6 py-4">
        <CheckCircle2 className="w-5 h-5 text-white" />
        <span className="text-white font-semibold">
          E-mail cadastrado com sucesso!
        </span>
      </div>
    ) : (
      <>
        <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 mb-3">
          <input
            type="email"
            placeholder="Seu melhor e-mail"
            value={newsletterEmail}
            onChange={e => setNewsletterEmail(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/60 transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !newsletterEmail.trim()}
            className="px-6 py-3 bg-white text-brand-clay font-bold rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Inscrevendo...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Inscrever
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-100 bg-red-500/30 border border-red-400/50 rounded-lg px-4 py-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </>
    )}
  </div>
</section>
```

## 5. Mapa de Localização

### Implementação
```typescript
import { LocationMapWithFallback } from '@/src/components/LocationMap';

// Em uma seção de contato ou eventos
<LocationMapWithFallback
  latitude={-23.9903}
  longitude={-48.0674}
  address="Espalhe Melodias, Tatuí, São Paulo"
  city="Tatuí"
  state="SP"
  title="Espalhe Melodias - Tatuí/SP"
  zoom={16}
  height="500px"
/>
```

## 6. Stats Dinâmicos na Hero Section

### Implementação
```typescript
const publicSiteData = usePublicSiteData();

// Calcular stats dinamicamente
const dynamicStats = [
  {
    icon: Users,
    value: `${publicSiteData.upcomingEvents.length}`,
    label: 'Eventos Próximos',
  },
  {
    icon: BookOpen,
    value: `${publicSiteData.blogs.length}`,
    label: 'Publicações',
  },
  {
    icon: Instagram,
    value: `${publicSiteData.instagramPosts.length}`,
    label: 'Posts Instagram',
  },
  {
    icon: TrendingUp,
    value: '100%',
    label: 'Satisfação',
  },
];

<section className="bg-gradient-to-r from-brand-navy via-brand-navy to-brand-navy-dark py-12">
  <div className="max-w-6xl mx-auto px-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {dynamicStats.map((stat, i) => (
        <div
          key={i}
          className="text-center bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition"
        >
          <stat.icon className="w-6 h-6 text-brand-clay-light mx-auto mb-2" />
          <div className="font-serif text-2xl md:text-3xl font-bold text-brand-clay mb-1">
            {stat.value}
          </div>
          <div className="text-xs md:text-sm text-slate-300 font-semibold">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

## Checklist de Implementação

- [ ] Importar `usePublicSiteData` no PublicSite.tsx
- [ ] Substituir seção de blogs por versão dinâmica
- [ ] Substituir seção de eventos por versão dinâmica
- [ ] Substituir Instagram feed por versão dinâmica
- [ ] Adicionar skeleton loaders para loading states
- [ ] Implementar error handling com retry
- [ ] Adicionar EventInscriptionModal
- [ ] Integrar LocationMap na seção de contato
- [ ] Atualizar stats na hero section
- [ ] Testar fallback para mock data
- [ ] Verificar responsive em mobile
- [ ] Testar com rede lenta (throttling)

## Tips & Tricks

### Refetch de dados
```typescript
// Recarregar todos os dados
publicSiteData.refetch();

// Usar em eventos (ex: após inscrição bem-sucedida)
onSuccess={() => publicSiteData.refetch()}
```

### Validação de email
```typescript
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
```

### Loading state condicional
```typescript
// Padrão recomendado
{isLoading ? (
  <SkeletonComponent />
) : error ? (
  <ErrorComponent onRetry={refetch} />
) : data.length === 0 ? (
  <EmptyStateComponent />
) : (
  <DataComponent data={data} />
)}
```

### Error handling com fallback
```typescript
try {
  await api.fetch();
} catch (err) {
  // Logar erro
  console.error('API error:', err);
  
  // Mostrar toast ao usuário
  showToast(err.message, 'error');
  
  // Usar fallback data
  setData(FALLBACK_DATA);
}
```
