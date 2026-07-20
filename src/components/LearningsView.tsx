import React, { useState, useEffect } from 'react';
import {
  BookMarked, Search, Clock, ArrowLeft, PenTool,
  Share2, CheckCircle, FileText, Image,
  Layers, Heart, X, Pencil, Trash2
} from 'lucide-react';
import { AppUser } from '../types';
import { PageWrapper, ContentCard, ConfirmModal, useToast } from './ui';
import { blogsApi, type BlogPost } from '../lib/api';

interface LearningsViewProps {
  currentUser: AppUser;
}

const PRESET_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=700&auto=format&fit=crop', label: 'Meditação' },
  { url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=700&auto=format&fit=crop', label: 'Luz solar' },
  { url: 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?q=80&w=700&auto=format&fit=crop', label: 'Escrita' },
  { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=700&auto=format&fit=crop', label: 'Yoga' },
  { url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=700&auto=format&fit=crop', label: 'Natureza' },
];

const CATEGORIES = ['todos', 'Informação', 'Estilo de Vida', 'Autoconhecimento', 'Curiosidades'];

const CAT_COLORS: Record<string, string> = {
  'Informação': 'bg-rose-50 text-rose-700 border-rose-100',
  'Estilo de Vida': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Autoconhecimento': 'bg-violet-50 text-violet-700 border-violet-100',
  'Curiosidades': 'bg-amber-50 text-amber-700 border-amber-100',
};

export default function LearningsView({ currentUser }: LearningsViewProps) {
  const { show: showToast } = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [activeBlogFull, setActiveBlogFull] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Autoconhecimento');
  const [presetImg, setPresetImg] = useState(PRESET_IMAGES[0].url);
  const [publishing, setPublishing] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadBlogs = (cat?: string, q?: string) => {
    setLoading(true);
    blogsApi.list({ category: cat !== 'todos' ? cat : undefined, search: q || undefined, limit: 50 })
      .then(res => setBlogs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBlogs(); }, []);
  useEffect(() => { loadBlogs(activeCategory, searchQuery); }, [activeCategory, searchQuery]);

  const openBlog = async (id: string) => {
    setSelectedBlogId(id);
    try {
      const full = await blogsApi.get(id);
      setActiveBlogFull(full);
    } catch { setActiveBlogFull(null); }
  };

  const handleLike = async (id: string) => {
    try {
      const res = await blogsApi.like(id);
      setLiked(p => ({ ...p, [id]: res.liked }));
    } catch { /* ignore */ }
  };

  const filtered = blogs; // filtering is server-side

  const canManage = (post: BlogPost) =>
    post.author_id === currentUser.id || currentUser.role === 'super-admin';

  const resetForm = () => {
    setNewTitle(''); setNewExcerpt(''); setNewContent('');
    setNewCategory('Autoconhecimento'); setPresetImg(PRESET_IMAGES[0].url);
    setEditingId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  const openEditForm = (post: BlogPost) => {
    setEditingId(post.id);
    setNewTitle(post.title);
    setNewExcerpt(post.excerpt);
    setNewContent(post.content);
    setNewCategory(post.category);
    setPresetImg(post.image_url || PRESET_IMAGES[0].url);
    setShowAddForm(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newExcerpt.trim() || !newContent.trim()) return;
    setPublishing(true);
    try {
      if (editingId) {
        await blogsApi.update(editingId, {
          title: newTitle, excerpt: newExcerpt, content: newContent,
          category: newCategory, imageUrl: presetImg,
        });
        showToast('Artigo atualizado!', 'success');
      } else {
        await blogsApi.create({ title: newTitle, excerpt: newExcerpt, content: newContent, category: newCategory, imageUrl: presetImg, readTime: '5 min' });
        showToast('Artigo publicado!', 'success');
      }
      resetForm();
      setShowAddForm(false);
      loadBlogs();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao salvar artigo.', 'error');
    }
    finally { setPublishing(false); }
  };

  const handleDelete = async () => {
    if (!deletingPost) return;
    setDeleting(true);
    try {
      await blogsApi.delete(deletingPost.id);
      showToast('Artigo excluído.', 'success');
      setDeletingPost(null);
      loadBlogs();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir artigo.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── SINGLE ARTICLE VIEW ──────────────────────────────────────────────────
  if (selectedBlogId) {
    const post = activeBlogFull;
    return (
      <PageWrapper id="blog-article-view">
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
          <button
            onClick={() => { setSelectedBlogId(null); setActiveBlogFull(null); }}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-clay transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Sinfonias da Mente
          </button>

          {!post ? (
            <div className="text-center py-16 text-slate-400 text-sm">Carregando artigo...</div>
          ) : (
            <ContentCard padding="lg">
              <div className="space-y-4">
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${CAT_COLORS[post.category] ?? 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                  {post.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy leading-tight">{post.title}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-y border-brand-sand/60 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-clay/10 flex items-center justify-center text-brand-clay font-bold text-lg">
                      {post.author_name?.charAt(0) ?? '?'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
                        {post.author_name}
                        <span className="text-[9px] bg-brand-moss text-white px-1.5 py-0.5 rounded font-sans uppercase">Pro</span>
                      </p>
                      <p className="text-[10px] text-slate-400">Corpo Técnico · Espalhe Melodias</p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <p>{new Date(post.post_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    <p className="flex items-center justify-end gap-1 text-brand-clay mt-0.5">
                      <Clock className="w-3 h-3" /> {post.read_time}
                    </p>
                  </div>
                </div>
              </div>

              {post.image_url && (
                <img src={post.image_url} alt={post.title}
                  className="w-full h-64 sm:h-80 rounded-2xl object-cover border border-brand-sand mt-2" />
              )}

              <div className="border-l-4 border-brand-clay pl-4 italic text-brand-navy/80 font-serif leading-relaxed text-base mt-6">
                "{post.excerpt}"
              </div>

              <div className="text-sm text-slate-600 leading-loose space-y-4 mt-4 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: post.content }} />

              <div className="mt-8 p-5 bg-brand-sand/30 border border-brand-sand rounded-2xl text-center text-xs">
                <p className="font-serif font-bold text-brand-navy">Conectando Profissionais. Fortalecendo Cuidados.</p>
                <p className="text-brand-navy-light italic mt-1">"Espalhe Melodias — um ecossistema de caminhos acolhedores."</p>
              </div>

              <div className="pt-5 border-t border-brand-sand/60 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4">
                <button
                  onClick={() => void handleLike(post.id)}
                  className={`flex items-center gap-2 text-xs font-bold transition ${liked[post.id] ? 'text-brand-clay' : 'text-slate-400 hover:text-brand-clay'}`}
                >
                  <Heart className={`w-4 h-4 ${liked[post.id] ? 'fill-brand-clay stroke-brand-clay' : ''}`} />
                  {liked[post.id] ? `Você gostou! (${(post.likes ?? 0) + 1})` : `Marcar como útil (${post.likes ?? 0})`}
                </button>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('📋 Link copiado!'); }}
                    className="flex items-center gap-2 text-xs font-bold text-brand-moss hover:text-brand-moss-dark transition"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartilhar artigo
                  </button>
                  {canManage(post) && (
                    <>
                      <button
                        onClick={() => openEditForm(post)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-clay transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      <button
                        onClick={() => setDeletingPost(post)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            </ContentCard>
          )}
        </div>
      </PageWrapper>
    );
  }

  // ── FORM VIEW ────────────────────────────────────────────────────────────
  if (showAddForm) {
    return (
      <PageWrapper id="blog-create-view">
        <div className="animate-scaleUp">
          <ContentCard padding="lg">
            <div className="flex items-center justify-between pb-4 border-b border-brand-sand mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-clay/10 rounded-xl text-brand-clay">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-navy">{editingId ? 'Editar Artigo' : 'Redator de Artigos'}</h3>
                  <p className="text-[10px] text-slate-400">{editingId ? 'Atualize o conteúdo do artigo' : 'Espalhe saberes para a comunidade'}</p>
                </div>
              </div>
              <button id="btn-cancel-blog" onClick={() => { setShowAddForm(false); resetForm(); }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-clay transition">
                <X className="w-4 h-4" /> Cancelar
              </button>
            </div>

            {publishing ? (
              <div className="py-20 flex flex-col items-center gap-4 text-center animate-fadeIn">
                <span className="w-16 h-16 rounded-full bg-brand-moss/10 text-brand-moss flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-9 h-9 stroke-[2.5]" />
                </span>
                <p className="font-serif font-bold text-brand-navy text-lg">{editingId ? 'Salvando alterações...' : 'Publicando artigo...'}</p>
                <p className="text-xs text-slate-400 max-w-xs">Registrando seu ensinamento na plataforma Espalhe Melodias.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Form */}
                <form id="blog-create-form" onSubmit={handleCreate} className="lg:col-span-7 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <FileText className="w-3 h-3 text-brand-moss" /> Título do Artigo
                      </label>
                      <input id="blog-title-input" type="text" required placeholder="Ex: A sinfonia do sono..."
                        value={newTitle} onChange={e => setNewTitle(e.target.value)}
                        className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3 h-3 text-brand-moss" /> Categoria
                      </label>
                      <select id="blog-category-select" value={newCategory} onChange={e => setNewCategory(e.target.value)}
                        className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition">
                        {CATEGORIES.filter(c => c !== 'todos').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resumo (Chamada de Capa)</label>
                    <input id="blog-excerpt-input" type="text" required placeholder="Frase marcante que chame o leitor..."
                      value={newExcerpt} onChange={e => setNewExcerpt(e.target.value)}
                      className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Image className="w-3 h-3 text-brand-moss" /> Imagem de Capa
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {PRESET_IMAGES.map((img, i) => (
                        <button key={i} type="button" id={`preset-img-${i}`}
                          onClick={() => setPresetImg(img.url)}
                          className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all ${presetImg === img.url ? 'border-brand-clay scale-[1.04] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                          <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Corpo do Artigo</label>
                    <textarea id="blog-content-textarea" rows={10} required
                      placeholder="Digite o artigo completo com insights e referências clínicas..."
                      value={newContent} onChange={e => setNewContent(e.target.value)}
                      className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition leading-relaxed resize-none" />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-brand-sand/50">
                    <button type="button" onClick={() => { setShowAddForm(false); resetForm(); }}
                      className="px-4 py-2.5 border border-brand-sand hover:bg-brand-sand/40 rounded-xl text-xs font-bold text-brand-navy transition">
                      Cancelar
                    </button>
                    <button id="btn-publish-blog" type="submit"
                      className="px-5 py-2.5 bg-brand-moss hover:bg-brand-moss-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition">
                      {editingId ? 'Salvar Alterações' : 'Publicar no Melodias'}
                    </button>
                  </div>
                </form>

                {/* Live preview */}
                <div className="lg:col-span-5 flex flex-col justify-center">
                  <p className="text-[10px] text-brand-clay font-bold tracking-widest uppercase text-center mb-3">Pré-visualização</p>
                  <div className="bg-brand-sand/30 rounded-2xl border border-brand-sand overflow-hidden shadow-lg">
                    <img src={presetImg} alt="preview" className="w-full h-36 object-cover" />
                    <div className="p-4 space-y-2.5">
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${CAT_COLORS[newCategory] ?? 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                        {newCategory}
                      </span>
                      <h4 className="text-sm font-serif font-bold text-brand-navy leading-snug line-clamp-2 min-h-[40px]">
                        {newTitle || 'Título do artigo...'}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed">
                        {newExcerpt || 'Resumo curto aparecerá aqui...'}
                      </p>
                      <div className="flex items-center gap-2 pt-2 border-t border-brand-sand/50">
                        {currentUser.avatar ? (
                          <img src={currentUser.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-brand-clay/15 flex items-center justify-center">
                            <span className="text-[7px] font-bold text-brand-clay">
                              {currentUser.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-[9px] font-bold text-brand-navy">{currentUser.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ContentCard>
        </div>
      </PageWrapper>
    );
  }

  // ── BLOG LIST VIEW ───────────────────────────────────────────────────────
  return (
    <PageWrapper id="blog-list-view">
      <div className="space-y-5 sm:space-y-6 animate-fadeIn">

        {/* Header */}
        <ContentCard padding="md" id="blog-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-clay animate-pulse" />
                <span className="text-[10px] font-bold text-brand-clay uppercase tracking-widest">Blog Científico Oficial</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-navy">
                Sinfonias da Mente
                <span className="font-script text-brand-clay font-normal text-2xl sm:text-3xl ml-2">e Aprendizados</span>
              </h2>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                Nossos psicoterapeutas compartilham saberes sobre equilíbrio emocional e saúde integrativa.
              </p>
            </div>
            {currentUser.role !== 'member' && (
              <button id="btn-trigger-write-article" onClick={openCreateForm}
                className="flex items-center gap-2 px-5 py-3 bg-brand-clay hover:bg-brand-clay-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition shrink-0">
                <PenTool className="w-4 h-4" />
                Redigir Artigo
              </button>
            )}
          </div>
        </ContentCard>

        {/* Filters */}
        <div id="blog-filters" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map(cat => (
              <button key={cat} id={`filter-cat-${cat}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-brand-moss text-white border-transparent shadow-sm'
                    : 'bg-white text-slate-600 border-brand-sand/60 hover:bg-brand-sand/30'
                }`}>
                {cat === 'todos' ? 'Todos os Temas' : cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input id="blog-search" type="text" placeholder="Pesquisar artigos..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs text-brand-navy bg-white border border-brand-sand pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-moss transition" />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Carregando artigos...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white border border-brand-sand rounded-2xl">
            <BookMarked className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">Nenhum artigo encontrado</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('todos'); }}
              className="mt-3 text-xs text-brand-clay font-bold hover:underline flex items-center gap-1 mx-auto">
              <X className="w-3.5 h-3.5" /> Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map(post => (
              <div key={post.id}
                onClick={() => void openBlog(post.id)}
                className="bg-white border border-brand-sand/60 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer group">

                <div className="relative h-44 overflow-hidden bg-brand-sand/30 border-b border-brand-sand/40">
                  {post.image_url
                    ? <img src={post.image_url} alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                    : <div className="w-full h-full bg-gradient-to-br from-brand-clay/10 to-brand-moss/10 flex items-center justify-center text-4xl">📖</div>
                  }
                  <span className={`absolute top-3 left-3 text-[9px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-sm ${CAT_COLORS[post.category] ?? 'bg-white/90 text-slate-600 border-slate-100'}`}>
                    {post.category}
                  </span>
                  {canManage(post) && (
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                      <button
                        onClick={e => { e.stopPropagation(); openEditForm(post); }}
                        className="p-1.5 rounded-lg bg-white/90 backdrop-blur text-slate-600 hover:text-brand-clay shadow-sm transition"
                        aria-label="Editar artigo"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setDeletingPost(post); }}
                        className="p-1.5 rounded-lg bg-white/90 backdrop-blur text-slate-600 hover:text-red-600 shadow-sm transition"
                        aria-label="Excluir artigo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="text-brand-clay font-semibold">{post.author_name}</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {post.read_time}
                      </span>
                    </div>
                    <h3 className="text-sm font-serif font-bold text-brand-navy line-clamp-2 leading-snug group-hover:text-brand-clay transition">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-brand-sand/50">
                    <span className="text-[10px] text-slate-400">{new Date(post.post_date).toLocaleDateString('pt-BR')}</span>
                    <span className="text-[10px] font-bold text-brand-moss group-hover:text-brand-clay uppercase tracking-wider transition">Ler →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <ConfirmModal
        isOpen={!!deletingPost}
        onClose={() => setDeletingPost(null)}
        onConfirm={handleDelete}
        title="Excluir artigo"
        message={`O artigo "${deletingPost?.title}" será excluído permanentemente.`}
        variant="danger"
        confirmLabel="Excluir"
        loading={deleting}
      />
    </PageWrapper>
  );
}
