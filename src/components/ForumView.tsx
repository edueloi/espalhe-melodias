import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Search, ThumbsUp, Eye, CheckCircle,
  HeartHandshake, Send, ArrowLeft, Plus, AlertCircle,
  X, MessageCircle, ChevronRight, Sparkles, Music2
} from 'lucide-react';
import { AppUser, UserRole } from '../types';
import { PageWrapper, SectionTitle, ContentCard } from './ui/PageWrapper';
import { Badge } from './ui/Badge';
import { forumApi, type ForumTopic, type ForumTopicDetail } from '../lib/api';

interface ForumViewProps {
  currentUser: AppUser;
}

const CATEGORIES = ['Ansiedade', 'DepressÃ£o', 'Autocuidado', 'Luto', 'Burnout', 'Geral'] as const;

const CAT_COLOR: Record<string, 'warning' | 'info' | 'success' | 'purple' | 'danger' | 'default'> = {
  'Ansiedade':   'warning',
  'DepressÃ£o':   'info',
  'Autocuidado': 'success',
  'Luto':        'purple',
  'Burnout':     'danger',
  'Geral':       'default',
};

function RolePill({ role }: { role: UserRole }) {
  if (role === 'super-admin')
    return <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-brand-moss text-white">Admin</span>;
  if (role === 'professional')
    return <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-800 text-cyan-100">PsicÃ³logo</span>;
  return <span className="inline-flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">Membro</span>;
}

export default function ForumView({ currentUser }: ForumViewProps) {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<ForumTopicDetail | null>(null);
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [fTitle, setFTitle] = useState('');
  const [fCat, setFCat] = useState('Ansiedade');
  const [fContent, setFContent] = useState('');
  const [likedTopics, setLikedTopics] = useState<Set<string>>(new Set());

  const loadTopics = () => {
    setLoading(true);
    forumApi.list({
      category: catFilter !== 'all' ? catFilter : undefined,
      search: search || undefined,
      limit: 50,
    })
      .then(res => setTopics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTopics(); }, [catFilter, search]);

  const filtered = topics;

  const openTopic = (id: string) => {
    setSelectedId(id);
    setActiveTopic(null);
    forumApi.get(id).then(setActiveTopic).catch(() => setActiveTopic(null));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim() || !fContent.trim()) return;
    try {
      await forumApi.create({ title: fTitle, category: fCat, content: fContent });
      setFTitle(''); setFContent(''); setShowForm(false);
      loadTopics();
    } catch (err) { console.error(err); }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedId) return;
    setSubmittingReply(true);
    try {
      await forumApi.createReply(selectedId, replyText);
      setReplyText('');
      const detail = await forumApi.get(selectedId);
      setActiveTopic(detail);
    } catch (err) { console.error(err); }
    finally { setSubmittingReply(false); }
  };

  const handleLike = async (topicId: string) => {
    if (likedTopics.has(topicId)) return;
    try {
      await forumApi.like(topicId);
      setLikedTopics(prev => new Set([...prev, topicId]));
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, likes: t.likes + 1 } : t));
    } catch { /* ignore */ }
  };

  // â”€â”€ THREAD VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (selectedId) {
    if (!activeTopic) {
      return (
        <PageWrapper id="forum-thread-view">
          <div className="text-center py-16 text-slate-400 text-sm">Carregando tópico...</div>
        </PageWrapper>
      );
    }
    const activeReplies = activeTopic.replies ?? [];
    return (
      <PageWrapper id="forum-thread-view">
        <div className="space-y-4 animate-fadeIn max-w-3xl mx-auto">
          <button id="btn-back-to-forum-list" onClick={() => { setSelectedId(null); setActiveTopic(null); }}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-clay bg-white border border-brand-sand px-4 py-2 rounded-xl transition">
            <ArrowLeft className="w-4 h-4" />
            Voltar para discussÃµes
          </button>

          {/* Main post */}
          <ContentCard padding="lg" id={`thread-post-${activeTopic.id}`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <img src={(activeTopic.author_avatar ?? "")} alt={activeTopic.author_name}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-brand-sand shadow-sm shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-brand-navy">{activeTopic.author_name}</span>
                    <RolePill role={(activeTopic.author_role as UserRole)} />
                  </div>
                  <span className="text-[11px] text-slate-400">{activeTopic.created_at}</span>
                </div>
              </div>
              <Badge color={CAT_COLOR[activeTopic.category] ?? 'default'}>
                {activeTopic.category}
              </Badge>
            </div>

            <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy mb-3 leading-snug">
              {activeTopic.title}
            </h2>

            <div className="bg-brand-sand/30 border border-brand-sand rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
              {activeTopic.content}
            </div>

            {/* Interactions */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-brand-sand/50">
              <button id="btn-like-active-topic"
                onClick={() => handleLike(activeTopic.id)}
                disabled={likedTopics.has(activeTopic.id)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                  likedTopics.has(activeTopic.id)
                    ? 'bg-brand-moss/10 text-brand-moss cursor-default'
                    : 'bg-slate-50 text-slate-500 hover:bg-brand-moss/5 hover:text-brand-moss border border-slate-200'
                }`}>
                <ThumbsUp className="w-3.5 h-3.5" />
                {activeTopic.likes} curtida{activeTopic.likes !== 1 ? 's' : ''}
              </button>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Eye className="w-3.5 h-3.5" />
                {activeTopic.views + 1} visualizaÃ§Ãµes
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <MessageCircle className="w-3.5 h-3.5" />
                {activeReplies.length} respostas
              </span>
              {activeTopic.is_solved && (
                <span className="ml-auto flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Resolvido
                </span>
              )}
            </div>
          </ContentCard>

          {/* Replies */}
          {activeReplies.length > 0 && (
            <div className="space-y-3" id="forum-replies">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Respostas e aconselhamentos ({activeReplies.length})
              </p>
              {activeReplies.map(reply => (
                <div key={reply.id} id={`reply-${reply.id}`}
                  className={`rounded-2xl border p-4 sm:p-5 ${reply.is_expert_reply ? 'bg-cyan-50/30 border-cyan-200/60' : 'bg-white border-brand-sand/60'}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <img src={(reply.author_avatar ?? "")} alt={reply.author_name}
                        className="w-8 h-8 rounded-lg object-cover border border-brand-sand shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-brand-navy">{reply.author_name}</span>
                          <RolePill role={(reply.author_role as UserRole)} />
                        </div>
                        <span className="text-[10px] text-slate-400">{reply.created_at}</span>
                      </div>
                    </div>
                    {reply.is_expert_reply && (
                      <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-800 text-white shrink-0">
                        <HeartHandshake className="w-3 h-3" />
                        Especialista
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed pl-10">
                    {reply.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Reply box */}
          <ContentCard padding="md" id="reply-form-card">
            <div className="flex items-center gap-2.5 mb-3">
              <img src={currentUser.avatar} alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover border border-brand-sand shrink-0" />
              <div>
                <p className="text-xs font-bold text-brand-navy">Responder como {currentUser.name}</p>
                {currentUser.role === 'professional' && (
                  <p className="text-[10px] text-cyan-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Sua resposta serÃ¡ marcada como orientaÃ§Ã£o especialista
                  </p>
                )}
              </div>
            </div>
            <form id="forum-reply-form" onSubmit={handleReply} className="space-y-3">
              <textarea id="forum-reply-textarea" rows={3} required
                placeholder="Escreva sua opiniÃ£o, dica prÃ¡tica ou palavras de acolhimento..."
                value={replyText} onChange={e => setReplyText(e.target.value)}
                className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-moss/30 transition resize-none" />
              <button id="btn-post-forum-reply" type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-moss hover:bg-brand-moss-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition ml-auto">
                <Send className="w-3.5 h-3.5" />
                Enviar Resposta
              </button>
            </form>
          </ContentCard>
        </div>
      </PageWrapper>
    );
  }

  // â”€â”€ CREATE FORM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (showForm) {
    return (
      <PageWrapper id="forum-create-view">
        <div className="max-w-2xl mx-auto animate-scaleUp">
          <ContentCard padding="lg">
            <div className="flex items-center justify-between pb-4 border-b border-brand-sand mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-moss/10 rounded-xl">
                  <Plus className="w-4 h-4 text-brand-moss" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-navy">Publicar Novo TÃ³pico</h3>
                  <p className="text-[10px] text-slate-400">Compartilhe com a comunidade Melodias</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-brand-clay rounded-lg transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form id="forum-create-form" onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">TÃ­tulo do TÃ³pico</label>
                  <input id="forum-new-title" type="text" required
                    placeholder="Ex: TÃ©cnicas rÃ¡pidas de mindfulness diÃ¡ria"
                    value={fTitle} onChange={e => setFTitle(e.target.value)}
                    className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-moss/30 transition" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categoria</label>
                  <select value={fCat} onChange={e => setFCat(e.target.value)}
                    className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-moss/30 transition">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ConteÃºdo / Desabafo</label>
                <div className="bg-cyan-50/50 border border-cyan-200/60 rounded-xl px-3 py-2 mb-2 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-cyan-700">Este fÃ³rum Ã© moderado pela equipe Melodias. Seja respeitoso e acolhedor com os colegas.</p>
                </div>
                <textarea id="forum-new-content" rows={5} required
                  placeholder="Sinta-se seguro para descrever seu momento ou sua dÃºvida. Nossa comunidade estÃ¡ aqui para apoiar."
                  value={fContent} onChange={e => setFContent(e.target.value)}
                  className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-moss/30 transition resize-none min-h-[120px]" />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-brand-sand/50">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 border border-brand-sand hover:bg-brand-sand/40 rounded-xl text-xs font-bold text-brand-navy transition">
                  Cancelar
                </button>
                <button id="btn-submit-forum-topic" type="submit"
                  className="px-5 py-2.5 bg-brand-moss hover:bg-brand-moss-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition">
                  Publicar DiscussÃ£o
                </button>
              </div>
            </form>
          </ContentCard>
        </div>
      </PageWrapper>
    );
  }

  // â”€â”€ LIST VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <PageWrapper id="forum-main-section">
      <div className="space-y-5 sm:space-y-6 animate-fadeIn">

        {/* Header */}
        <ContentCard padding="md" id="forum-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-brand-moss/10 rounded-xl shrink-0">
                <MessageSquare className="w-5 h-5 text-brand-moss" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-brand-moss uppercase tracking-widest">Comunidade Ativa</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-moss animate-pulse" />
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">
                  FÃ³rum de DiscussÃ£o e Apoio
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">
                  EspaÃ§o acolhedor para membros desabafarem e psicÃ³logos proverem aconselhamentos orientados.
                </p>
              </div>
            </div>

            <button id="btn-trigger-create-topic" onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-moss hover:bg-brand-moss-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-brand-moss/20 transition shrink-0">
              <Plus className="w-4 h-4" />
              Novo TÃ³pico
            </button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-brand-sand/60">
            {[
              { label: 'TÃ³picos', value: topics.length },
              { label: 'Respostas', value: topics.reduce((s, t) => s + (t.replies_count ?? 0), 0) },
              { label: 'Resolvidos', value: topics.filter(t => t.is_solved).length },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-brand-navy">{s.value}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* Filters */}
        <div id="forum-filters" className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setCatFilter('all')} id="forum-filter-all"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${catFilter === 'all' ? 'bg-brand-moss text-white border-transparent' : 'bg-white text-slate-600 border-brand-sand hover:bg-brand-sand/30'}`}>
              Todas as DiscussÃµes
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat} id={`forum-filter-${cat}`} onClick={() => setCatFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition whitespace-nowrap ${catFilter === cat ? 'bg-brand-moss text-white border-transparent' : 'bg-white text-slate-600 border-brand-sand hover:bg-brand-sand/30'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input id="forum-search" type="text" placeholder="Buscar discussÃµes..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full text-xs text-brand-navy bg-white border border-brand-sand pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-moss transition" />
          </div>
        </div>

        {/* Topic list */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Carregando discussões...</div>
        ) : filtered.length === 0 ? (
          <div id="forum-empty" className="text-center py-16 bg-white border border-brand-sand rounded-2xl">
            <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">Nenhuma discussÃ£o encontrada</p>
            <button onClick={() => { setSearch(''); setCatFilter('all'); }}
              className="mt-3 text-xs text-brand-clay font-bold hover:underline">Limpar filtros</button>
          </div>
        ) : (
          <div id="forum-topics-list" className="space-y-3">
            {filtered.map(topic => (
              <button key={topic.id} id={`topic-card-${topic.id}`}
                onClick={() => openTopic(topic.id)}
                className="w-full text-left bg-white border border-brand-sand/60 rounded-2xl p-4 sm:p-5 hover:border-brand-moss hover:shadow-md transition-all group">

                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  {/* Left: avatar */}
                  <img src={(topic.author_avatar ?? "")} alt={topic.author_name}
                    className="w-9 h-9 rounded-xl object-cover border border-brand-sand shrink-0 hidden sm:block" />

                  {/* Center: content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color={CAT_COLOR[topic.category] ?? 'default'} size="sm">
                        {topic.category}
                      </Badge>
                      {topic.is_solved && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Resolvido
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-brand-navy group-hover:text-brand-moss transition leading-snug">
                      {topic.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {topic.content}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <img src={(topic.author_avatar ?? "")} alt="" className="w-4 h-4 rounded-full object-cover sm:hidden" />
                        <span className="font-semibold text-slate-600">{topic.author_name}</span>
                        <RolePill role={(topic.author_role as UserRole)} />
                      </div>
                      <span>Â·</span>
                      <span>{topic.created_at.split(' ')[0]}</span>
                    </div>
                  </div>

                  {/* Right: counters */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {topic.replies_count ?? topic.repliesCount ?? topic.replies?.length ?? 0}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${likedTopics.has(topic.id) ? 'bg-brand-moss/10 text-brand-moss border border-brand-moss/20' : 'bg-brand-clay/10 text-brand-clay border border-brand-clay/20'}`}>
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {topic.likes}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-moss group-hover:translate-x-0.5 transition-all hidden sm:block" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer callout */}
        <div id="forum-callout" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy to-brand-navy-dark p-5 sm:p-6 text-center border border-brand-navy-light/20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 right-6 text-5xl font-script text-brand-clay/10 select-none">â™©</div>
            <div className="absolute bottom-2 left-6 text-4xl font-script text-brand-moss/10 select-none">â™«</div>
          </div>
          <div className="relative z-10">
            <Music2 className="w-6 h-6 text-brand-clay-light mx-auto mb-2" />
            <p className="font-script text-2xl text-brand-clay-light mb-1">Compartilhar Ã© cuidar!</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Cada palavra de apoio aqui pode ser a nota que alguÃ©m precisava ouvir hoje.
            </p>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
