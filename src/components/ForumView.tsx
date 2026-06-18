import React, { useState, useEffect } from 'react';
import {
  MessageSquare, ThumbsUp, Eye, CheckCircle,
  HeartHandshake, Send, ArrowLeft, Plus, AlertCircle,
  MessageCircle, ChevronRight, Sparkles, Music2, X,
  Pencil, Trash2, TrendingUp, Users, Zap, Award, Clock, MessageSquarePlus,
} from 'lucide-react';
import { AppUser, UserRole } from '../types';
import {
  PageWrapper, SectionTitle, ContentCard, Button, IconButton,
  Input, Textarea, Select, Badge, EmptyState, ConfirmModal,
  FilterLine, FilterLineSection, FilterLineItem, FilterLineSearch,
  useToast,
} from './ui';
import { forumApi, type ForumTopic, type ForumTopicDetail, type ForumReply } from '../lib/api';

interface ForumViewProps {
  currentUser: AppUser;
  initialTopicId?: string;
  onTopicOpen?: (id: string) => void;
  onTopicClose?: () => void;
}

const CATEGORIES = ['Ansiedade', 'Depressão', 'Autocuidado', 'Luto', 'Burnout', 'Geral'] as const;

const CAT_COLOR: Record<string, 'warning' | 'info' | 'success' | 'purple' | 'danger' | 'default'> = {
  'Ansiedade':   'warning',
  'Depressão':   'info',
  'Autocuidado': 'success',
  'Luto':        'purple',
  'Burnout':     'danger',
  'Geral':       'default',
};

function RolePill({ role, specialty, crp }: { role: UserRole; specialty?: string; crp?: string }) {
  if (role === 'super-admin') {
    const label = specialty ?? 'Admin';
    return <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-moss text-white">{label}</span>;
  }
  if (role === 'professional') {
    const label = specialty ?? 'Profissional';
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-700 text-white">
        {label}
        {crp && <span className="opacity-70">· {crp}</span>}
      </span>
    );
  }
  const label = specialty ?? 'Membro';
  return <span className="inline-flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{label}</span>;
}

function AvatarFallback({ name, src, size = 'md' }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  if (src) {
    return <img src={src} alt={name} className={`${sizeClass} rounded-xl object-cover border border-brand-sand shrink-0`} />;
  }
  return (
    <div className={`${sizeClass} rounded-xl border border-brand-sand bg-brand-moss/20 flex items-center justify-center shrink-0`}>
      <span className="text-[10px] font-bold text-brand-moss">{initials}</span>
    </div>
  );
}

function formatDate(raw: string): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw.split('T')[0] ?? raw;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ForumView({ currentUser, initialTopicId, onTopicOpen, onTopicClose }: ForumViewProps) {
  const toast = useToast();
  const isAdmin = currentUser.role === 'super-admin';

  // ── List state ─────────────────────────────────────────────────────────────
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');

  // ── Thread state ───────────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string | null>(initialTopicId ?? null);
  const [activeTopic, setActiveTopic] = useState<ForumTopicDetail | null>(null);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [likedTopics, setLikedTopics] = useState<Set<string>>(new Set());

  // ── Reply state ────────────────────────────────────────────────────────────
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // ── Create topic state ─────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [fTitle, setFTitle] = useState('');
  const [fCat, setFCat] = useState('Ansiedade');
  const [fContent, setFContent] = useState('');
  const [submittingTopic, setSubmittingTopic] = useState(false);

  // ── Edit topic state ───────────────────────────────────────────────────────
  const [editingTopic, setEditingTopic] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCat, setEditCat] = useState('Ansiedade');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // ── Edit reply state ───────────────────────────────────────────────────────
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyText, setEditReplyText] = useState('');
  const [savingReply, setSavingReply] = useState(false);

  // ── Delete confirm state ───────────────────────────────────────────────────
  const [confirmDeleteTopic, setConfirmDeleteTopic] = useState(false);
  const [deletingTopic, setDeletingTopic] = useState(false);
  const [confirmDeleteReplyId, setConfirmDeleteReplyId] = useState<string | null>(null);
  const [deletingReply, setDeletingReply] = useState(false);

  // ── Permissions ────────────────────────────────────────────────────────────
  const canEditTopic = activeTopic
    ? activeTopic.author_id === currentUser.id
    : false;
  const canDeleteTopic = activeTopic
    ? activeTopic.author_id === currentUser.id || isAdmin
    : false;

  const canEditReply = (reply: ForumReply) => reply.author_id === currentUser.id;
  const canDeleteReply = (reply: ForumReply) => reply.author_id === currentUser.id || isAdmin;

  // ── Data loading ───────────────────────────────────────────────────────────
  const loadTopics = () => {
    setLoading(true);
    forumApi.list({
      category: catFilter !== 'all' ? catFilter : undefined,
      search: search || undefined,
      limit: 50,
    })
      .then(res => setTopics(res.data))
      .catch(() => toast.error('Erro ao carregar discussões.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTopics(); }, [catFilter, search]);

  useEffect(() => {
    if (initialTopicId && !activeTopic && !loadingTopic) {
      setLoadingTopic(true);
      forumApi.get(initialTopicId)
        .then(setActiveTopic)
        .catch(() => toast.error('Erro ao abrir tópico.'))
        .finally(() => setLoadingTopic(false));
    }
  }, []);

  const openTopic = (id: string) => {
    setSelectedId(id);
    setActiveTopic(null);
    setLoadingTopic(true);
    setEditingTopic(false);
    setEditingReplyId(null);
    onTopicOpen?.(id);
    forumApi.get(id)
      .then(setActiveTopic)
      .catch(() => toast.error('Erro ao abrir tópico.'))
      .finally(() => setLoadingTopic(false));
  };

  const closeTopic = () => {
    setSelectedId(null);
    setActiveTopic(null);
    setEditingTopic(false);
    onTopicClose?.();
  };

  const refreshTopic = (id: string) =>
    forumApi.get(id).then(setActiveTopic).catch(() => {});

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim() || !fContent.trim()) return;
    setSubmittingTopic(true);
    try {
      await forumApi.create({ title: fTitle, category: fCat, content: fContent });
      setFTitle(''); setFContent(''); setShowForm(false);
      toast.success('Tópico publicado com sucesso!');
      loadTopics();
    } catch {
      toast.error('Erro ao publicar tópico.');
    } finally {
      setSubmittingTopic(false);
    }
  };

  const startEditTopic = () => {
    if (!activeTopic) return;
    setEditTitle(activeTopic.title);
    setEditCat(activeTopic.category);
    setEditContent(activeTopic.content);
    setEditingTopic(true);
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTopic || !editTitle.trim() || !editContent.trim()) return;
    setSavingEdit(true);
    try {
      await forumApi.update(activeTopic.id, {
        title: editTitle,
        category: editCat,
        content: editContent,
      });
      toast.success('Tópico atualizado!');
      setEditingTopic(false);
      await refreshTopic(activeTopic.id);
    } catch {
      toast.error('Erro ao salvar edição.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteTopic = async () => {
    if (!activeTopic) return;
    setDeletingTopic(true);
    try {
      await forumApi.delete(activeTopic.id);
      toast.success('Tópico excluído.');
      setConfirmDeleteTopic(false);
      closeTopic();
      loadTopics();
    } catch {
      toast.error('Erro ao excluir tópico.');
    } finally {
      setDeletingTopic(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedId) return;
    setSubmittingReply(true);
    try {
      await forumApi.createReply(selectedId, replyText);
      setReplyText('');
      await refreshTopic(selectedId);
      toast.success('Resposta enviada!');
    } catch {
      toast.error('Erro ao enviar resposta.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const startEditReply = (reply: ForumReply) => {
    setEditingReplyId(reply.id);
    setEditReplyText(reply.content);
  };

  const handleSaveReply = async (replyId: string) => {
    if (!selectedId || !editReplyText.trim()) return;
    setSavingReply(true);
    try {
      await forumApi.updateReply(selectedId, replyId, editReplyText);
      toast.success('Resposta atualizada!');
      setEditingReplyId(null);
      await refreshTopic(selectedId);
    } catch {
      toast.error('Erro ao salvar resposta.');
    } finally {
      setSavingReply(false);
    }
  };

  const handleDeleteReply = async () => {
    if (!selectedId || !confirmDeleteReplyId) return;
    setDeletingReply(true);
    try {
      await forumApi.deleteReply(selectedId, confirmDeleteReplyId);
      toast.success('Resposta excluída.');
      setConfirmDeleteReplyId(null);
      await refreshTopic(selectedId);
    } catch {
      toast.error('Erro ao excluir resposta.');
    } finally {
      setDeletingReply(false);
    }
  };

  const handleLike = async (topicId: string) => {
    if (likedTopics.has(topicId)) return;
    try {
      await forumApi.like(topicId);
      setLikedTopics(prev => new Set([...prev, topicId]));
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, likes: t.likes + 1 } : t));
      if (activeTopic?.id === topicId) {
        setActiveTopic(prev => prev ? { ...prev, likes: prev.likes + 1 } : prev);
      }
    } catch { /* ignore */ }
  };

  // ── THREAD VIEW ────────────────────────────────────────────────────────────
  if (selectedId) {
    if (loadingTopic || !activeTopic) {
      return (
        <PageWrapper mobileBottomPad>
          <div className="space-y-6 sm:space-y-8">
            <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-80 bg-slate-200 rounded-lg animate-pulse" />
                <div className="h-56 bg-slate-200 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-slate-200 rounded-lg animate-pulse" />
                <div className="h-52 bg-slate-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </PageWrapper>
      );
    }

    const activeReplies = activeTopic.replies ?? [];

    return (
      <PageWrapper mobileBottomPad>
        <div className="space-y-6 sm:space-y-8 animate-fadeIn">

          {/* Back Button */}
          <Button
            variant="outline"
            size="sm"
            iconLeft={<ArrowLeft size={16} />}
            onClick={closeTopic}
            className="text-sm"
          >
            Voltar para discussões
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">

            {/* ─ Coluna principal (2/3) ─ */}
            <div className="lg:col-span-2 space-y-5 sm:space-y-6">

              {/* Post principal */}
              <ContentCard padding="lg" className="border border-blue-200/60 bg-gradient-to-br from-white to-blue-50/30">
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-5 pb-5 sm:pb-6 border-b border-blue-200/40">
                  <div className="flex items-start gap-4">
                    <AvatarFallback name={activeTopic.author_name} src={activeTopic.author_avatar} size="lg" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-brand-navy">{activeTopic.author_name}</span>
                        <RolePill role={activeTopic.author_role as UserRole} specialty={activeTopic.author_specialty} crp={activeTopic.author_crp} />
                      </div>
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(activeTopic.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                    <Badge color={CAT_COLOR[activeTopic.category] ?? 'default'} className="text-sm">
                      {activeTopic.category}
                    </Badge>
                    {activeTopic.is_solved && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolvido
                      </span>
                    )}
                    {canEditTopic && !editingTopic && (
                      <IconButton variant="ghost" size="sm" onClick={startEditTopic} title="Editar">
                        <Pencil size={16} className="text-slate-500" />
                      </IconButton>
                    )}
                    {canDeleteTopic && !editingTopic && (
                      <IconButton variant="ghost" size="sm" onClick={() => setConfirmDeleteTopic(true)} title="Deletar">
                        <Trash2 size={16} className="text-red-400" />
                      </IconButton>
                    )}
                  </div>
                </div>

                {/* Modo edição do tópico */}
                {editingTopic ? (
                  <form onSubmit={handleSaveTopic} className="space-y-5 mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Título"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        required
                      />
                      <Select
                        label="Categoria"
                        options={CATEGORIES.map(c => ({ value: c, label: c }))}
                        value={editCat}
                        onChange={e => setEditCat(e.target.value)}
                      />
                    </div>
                    <Textarea
                      label="Conteúdo"
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={6}
                    />
                    <div className="flex justify-end gap-3 pt-3 border-t border-blue-200/40">
                      <Button variant="outline" size="sm" type="button" onClick={() => setEditingTopic(false)}>
                        Cancelar
                      </Button>
                      <Button variant="primary" size="sm" type="submit" loading={savingEdit}>
                        Salvar Alterações
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="pt-5 sm:pt-6">
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy mb-6 leading-snug">
                        {activeTopic.title}
                      </h2>
                      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-7 text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {activeTopic.content}
                      </div>
                    </div>
                  </>
                )}

                {/* Barra de interações */}
                {!editingTopic && (
                  <div className="flex flex-wrap items-center gap-3 mt-7 pt-5 border-t border-blue-200/40">
                    <button
                      onClick={() => handleLike(activeTopic.id)}
                      disabled={likedTopics.has(activeTopic.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition ${
                        likedTopics.has(activeTopic.id)
                          ? 'bg-brand-moss/20 text-brand-moss cursor-default border border-brand-moss/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-brand-moss/15 hover:text-brand-moss border border-slate-200 hover:border-brand-moss/30'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${likedTopics.has(activeTopic.id) ? 'fill-current' : ''}`} />
                      {activeTopic.likes} Curtida{activeTopic.likes !== 1 ? 's' : ''}
                    </button>
                    <span className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg font-medium">
                      <Eye className="w-4 h-4" />
                      {activeTopic.views + 1} Visualizações
                    </span>
                    <span className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg font-medium">
                      <MessageCircle className="w-4 h-4" />
                      {activeReplies.length} {activeReplies.length === 1 ? 'Resposta' : 'Respostas'}
                    </span>
                  </div>
                )}
              </ContentCard>

              {/* Respostas */}
              {activeReplies.length > 0 && (
                <div className="space-y-4 sm:space-y-5 mt-8 sm:mt-10">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg sm:text-xl font-bold text-brand-navy">
                      {activeReplies.length} {activeReplies.length === 1 ? 'Resposta' : 'Respostas'}
                    </h3>
                  </div>

                  {activeReplies.map((reply, idx) => (
                    <div
                      key={reply.id}
                      className={`rounded-lg border p-5 sm:p-6 transition-all ${
                        reply.is_expert_reply
                          ? 'bg-gradient-to-br from-cyan-50 to-blue-50/50 border-cyan-300/60 shadow-sm'
                          : 'bg-white border-slate-200/60 hover:border-slate-300'
                      }`}
                    >
                      {/* Cabeçalho da resposta */}
                      <div className="flex items-start justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-100/60">
                        <div className="flex items-start gap-3">
                          <AvatarFallback name={reply.author_name} src={reply.author_avatar} size="md" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-brand-navy">{reply.author_name}</span>
                              <RolePill role={reply.author_role as UserRole} specialty={reply.author_specialty} crp={reply.author_crp} />
                            </div>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap justify-end">
                          {reply.is_expert_reply && editingReplyId !== reply.id && (
                            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-cyan-600 text-white shadow-md">
                              <HeartHandshake className="w-3.5 h-3.5" />
                              Especialista
                            </span>
                          )}
                          {!reply.is_expert_reply && editingReplyId !== reply.id && (
                            <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-2.5 py-1 rounded-full">#{idx + 1}</span>
                          )}
                          {canEditReply(reply) && editingReplyId !== reply.id && (
                            <IconButton variant="ghost" size="sm" onClick={() => startEditReply(reply)} title="Editar">
                              <Pencil size={14} className="text-slate-500" />
                            </IconButton>
                          )}
                          {canDeleteReply(reply) && editingReplyId !== reply.id && (
                            <IconButton variant="ghost" size="sm" onClick={() => setConfirmDeleteReplyId(reply.id)} title="Deletar">
                              <Trash2 size={14} className="text-red-400" />
                            </IconButton>
                          )}
                        </div>
                      </div>

                      {/* Modo edição da resposta */}
                      {editingReplyId === reply.id ? (
                        <div className="pt-4 space-y-4">
                          <Textarea
                            value={editReplyText}
                            onChange={e => setEditReplyText(e.target.value)}
                            rows={4}
                            placeholder="Editar resposta..."
                          />
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" size="sm" onClick={() => setEditingReplyId(null)}>
                              Cancelar
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              loading={savingReply}
                              disabled={!editReplyText.trim()}
                              onClick={() => handleSaveReply(reply.id)}
                            >
                              Salvar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-base text-slate-700 leading-relaxed pt-4 whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* ─ Sidebar (1/3) ─ */}
            <div className="space-y-5 sm:space-y-6">

              {/* Caixa de resposta */}
              <ContentCard padding="lg" className="border border-blue-200/60 sticky top-8 bg-white">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-blue-200/40">
                  <AvatarFallback name={currentUser.name} src={currentUser.avatar} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-brand-navy truncate">Responder</p>
                    {currentUser.role === 'professional' && (
                      <p className="text-xs text-cyan-600 font-semibold flex items-center gap-1 mt-1">
                        <HeartHandshake className="w-3 h-3" />
                        Especialista
                      </p>
                    )}
                  </div>
                </div>
                <form onSubmit={handleReply} className="space-y-4">
                  <Textarea
                    placeholder="Compartilhe sua opinião, experiência ou palavra de acolhimento..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={5}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="sm"
                    loading={submittingReply}
                    iconLeft={<Send size={14} />}
                    disabled={!replyText.trim()}
                  >
                    Enviar Resposta
                  </Button>
                </form>
              </ContentCard>

              {/* Info do tópico */}
              <ContentCard padding="lg" className="border border-slate-200/60">
                <h4 className="text-sm font-bold text-brand-navy mb-4 pb-3 border-b border-slate-200/60">Sobre este Tópico</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600 font-medium flex items-center gap-2">
                      <Eye className="w-4 h-4 text-slate-500" />
                      Visualizações
                    </span>
                    <span className="text-lg font-black text-brand-navy">{activeTopic.views + 1}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600 font-medium flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-slate-500" />
                      Curtidas
                    </span>
                    <span className="text-lg font-black text-brand-navy">{activeTopic.likes}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600 font-medium flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-slate-500" />
                      Respostas
                    </span>
                    <span className="text-lg font-black text-brand-navy">{activeReplies.length}</span>
                  </div>
                  {activeTopic.is_solved && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-700">Tópico Resolvido</span>
                    </div>
                  )}
                </div>
              </ContentCard>

              {/* Dica */}
              <ContentCard padding="lg" className="border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-50/50">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900 mb-1">Dica</p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Seja respeitoso e acolhedor. Lembre-se que por trás da tela há uma pessoa que pode estar vulnerável.
                    </p>
                  </div>
                </div>
              </ContentCard>

            </div>
          </div>

        </div>

        {/* Confirm delete topic */}
        <ConfirmModal
          isOpen={confirmDeleteTopic}
          onClose={() => setConfirmDeleteTopic(false)}
          onConfirm={handleDeleteTopic}
          title="Excluir tópico"
          message="Todas as respostas também serão removidas. Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          variant="danger"
          loading={deletingTopic}
        />

        {/* Confirm delete reply */}
        <ConfirmModal
          isOpen={!!confirmDeleteReplyId}
          onClose={() => setConfirmDeleteReplyId(null)}
          onConfirm={handleDeleteReply}
          title="Excluir resposta"
          message="Esta resposta será removida permanentemente."
          confirmLabel="Excluir"
          variant="danger"
          loading={deletingReply}
        />

      </PageWrapper>
    );
  }

  // ── CREATE FORM ────────────────────────────────────────────────────────────
  if (showForm) {
    return (
      <PageWrapper mobileBottomPad>
        <div className="animate-scaleUp space-y-6 sm:space-y-8">
          <Button
            variant="outline"
            size="sm"
            iconLeft={<ArrowLeft size={16} />}
            onClick={() => setShowForm(false)}
          >
            Voltar
          </Button>

          <ContentCard padding="lg" className="border border-blue-200/60 bg-gradient-to-br from-white to-blue-50/30">
            <div className="flex items-center justify-between pb-6 border-b border-blue-200/40 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">Publicar Novo Tópico</h2>
                  <p className="text-sm text-slate-600 mt-0.5">Compartilhe com a comunidade Melodias</p>
                </div>
              </div>
              <IconButton variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X size={20} className="text-slate-500" />
              </IconButton>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Título do Tópico"
                  placeholder="Ex: Técnicas rápidas de mindfulness"
                  value={fTitle}
                  onChange={e => setFTitle(e.target.value)}
                  required
                />
                <Select
                  label="Categoria"
                  options={CATEGORIES.map(c => ({ value: c, label: c }))}
                  value={fCat}
                  onChange={e => setFCat(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200/60 rounded-lg px-4 py-3.5 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Este fórum é moderado pela equipe Melodias. Seja respeitoso, acolhedor e solidário com os colegas. Compartilhar vulnerabilidades é um ato de coragem. ❤️
                  </p>
                </div>
                <Textarea
                  label="Conteúdo / Desabafo"
                  placeholder="Sinta-se seguro para compartilhar seu momento, dúvida ou desabafo. Nossa comunidade está aqui para apoiar. Você não está sozinho."
                  value={fContent}
                  onChange={e => setFContent(e.target.value)}
                  rows={7}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-5 border-t border-blue-200/40">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={submittingTopic}
                  disabled={!fTitle.trim() || !fContent.trim()}
                  iconLeft={<Send size={16} />}
                >
                  Publicar Tópico
                </Button>
              </div>
            </form>
          </ContentCard>
        </div>
      </PageWrapper>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <PageWrapper mobileBottomPad>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn">

        {/* ── HERO HEADER ── */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-brand-navy-dark rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-blue-500/30">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-56 h-56 rounded-full bg-cyan-400/10 blur-2xl" />
            <div className="absolute top-8 right-8 text-6xl font-script text-white/10 select-none">♩</div>
          </div>

          <div className="relative z-10 p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/40 rounded-full text-sm font-bold text-white uppercase tracking-wider mb-3">
                  <MessageSquarePlus className="w-4 h-4" />
                  Comunidade Ativa
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-white mb-2">
                  Fórum de Discussão
                </h1>
                <p className="text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">
                  Espaço seguro e acolhedor para compartilhar, apoiar e crescer juntos. Psicólogos credenciados disponíveis para orientações.
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                iconLeft={<Plus size={18} />}
                onClick={() => setShowForm(true)}
                className="bg-white text-blue-700 hover:bg-slate-100 font-bold shadow-xl shrink-0"
              >
                Novo Tópico
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 pt-8 border-t border-white/20">
              {[
                { icon: MessageSquare, label: 'Tópicos', value: topics.length, color: 'text-blue-100' },
                { icon: MessageCircle, label: 'Respostas', value: topics.reduce((s, t) => s + (t.replies_count ?? 0), 0), color: 'text-cyan-100' },
                { icon: CheckCircle, label: 'Resolvidos', value: topics.filter(t => t.is_solved).length, color: 'text-emerald-100' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="p-2.5 bg-white/15 rounded-lg">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-white/80 text-center">{stat.label}</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FILTROS E BUSCA ── */}
        <div className="bg-white border border-brand-sand/60 rounded-lg p-4 sm:p-5 space-y-4">
          <FilterLine>
            <FilterLineSection grow>
              <FilterLineItem grow>
                <FilterLineSearch value={search} onChange={setSearch} placeholder="Busca por título, categoria ou autor..." />
              </FilterLineItem>
            </FilterLineSection>
          </FilterLine>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCatFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${
                catFilter === 'all'
                  ? 'bg-brand-navy text-white border-transparent'
                  : 'bg-white text-slate-700 border-brand-sand/60 hover:border-brand-navy/40'
              }`}
            >
              Todas as Categorias
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition whitespace-nowrap ${
                  catFilter === cat
                    ? 'bg-brand-navy text-white border-transparent'
                    : 'bg-white text-slate-700 border-brand-sand/60 hover:border-brand-navy/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── LISTA DE TÓPICOS ── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <EmptyState
            title="Nenhuma discussão encontrada"
            description="Tente ajustar os filtros ou seja o primeiro a publicar uma discussão!"
            icon={MessageSquare}
            action={
              <Button size="sm" variant="outline" onClick={() => { setSearch(''); setCatFilter('all'); }}>
                Limpar filtros
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {topics.map(topic => {
              const repliesCount = topic.replies_count ?? topic.repliesCount ?? topic.replies?.length ?? 0;
              return (
                <button
                  key={topic.id}
                  onClick={() => openTopic(topic.id)}
                  className="w-full text-left bg-white border border-brand-sand/60 rounded-lg p-5 sm:p-6 hover:border-blue-400 hover:shadow-lg hover:bg-blue-50/30 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
                    {/* Avatar */}
                    <AvatarFallback name={topic.author_name} src={topic.author_avatar} size="md" />

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Category & Status */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge color={CAT_COLOR[topic.category] ?? 'default'}>{topic.category}</Badge>
                        {topic.is_solved && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Resolvido
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold text-brand-navy group-hover:text-blue-600 transition leading-snug line-clamp-2">
                        {topic.title}
                      </h3>

                      {/* Preview */}
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {topic.content}
                      </p>

                      {/* Author Info */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="font-bold text-slate-700">{topic.author_name}</span>
                        <RolePill role={topic.author_role as UserRole} specialty={topic.author_specialty} crp={topic.author_crp} />
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(topic.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-3 shrink-0">
                      <div className="flex flex-col items-center gap-1 px-3 py-2 sm:py-2.5 bg-blue-50 border border-blue-200 rounded-lg group-hover:bg-blue-100 transition">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-black text-blue-700">{repliesCount}</span>
                        <span className="text-[10px] text-blue-600 font-semibold">Respostas</span>
                      </div>

                      <div className={`flex flex-col items-center gap-1 px-3 py-2 sm:py-2.5 rounded-lg border transition ${
                        likedTopics.has(topic.id)
                          ? 'bg-brand-moss/20 border-brand-moss/40 text-brand-moss'
                          : 'bg-brand-clay/10 border-brand-clay/20 text-brand-clay group-hover:bg-brand-moss/15 group-hover:border-brand-moss/30'
                      }`}>
                        <ThumbsUp className={`w-4 h-4 ${likedTopics.has(topic.id) ? 'fill-current' : ''}`} />
                        <span className="text-sm font-black">{topic.likes}</span>
                        <span className="text-[10px] font-semibold">Curtidas</span>
                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all hidden sm:block" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── CALLOUT FINAL ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 p-6 sm:p-8">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-200/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-teal-200/10 blur-2xl" />
            <div className="absolute top-4 right-8 text-6xl font-script text-emerald-300/20 select-none">♩</div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <p className="text-lg sm:text-xl font-bold text-brand-navy">Compartilhar é cuidar! 💚</p>
              <p className="text-sm text-slate-700 max-w-xl leading-relaxed">
                Cada pergunta feita, cada conselho compartilhado e cada palavra de apoio aqui fortalece nossa comunidade Melodias.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-white border border-emerald-200 rounded-lg shrink-0">
              <Users className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs text-slate-600 font-semibold">Membros participando</p>
                <p className="text-2xl font-black text-brand-navy">{topics.length > 0 ? '✓' : '→'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
