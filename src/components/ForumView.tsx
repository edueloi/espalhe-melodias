import React, { useState, useEffect } from 'react';
import {
  MessageSquare, ThumbsUp, Eye, CheckCircle,
  HeartHandshake, Send, ArrowLeft, Plus, AlertCircle,
  MessageCircle, ChevronRight, Sparkles, Music2, X,
  Pencil, Trash2,
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
        <PageWrapper>
          <div className="space-y-4">
            <div className="h-9 w-40 bg-slate-100 rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
                <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
              </div>
              <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
          </div>
        </PageWrapper>
      );
    }

    const activeReplies = activeTopic.replies ?? [];

    return (
      <PageWrapper>
        <div className="space-y-5 animate-fadeIn">

          {/* Back */}
          <Button
            variant="outline"
            size="sm"
            iconLeft={<ArrowLeft size={14} />}
            onClick={closeTopic}
          >
            Voltar para discussões
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

            {/* ─ Coluna principal (2/3) ─ */}
            <div className="lg:col-span-2 space-y-4">

              {/* Post principal */}
              <ContentCard padding="lg">
                {/* Cabeçalho */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <AvatarFallback name={activeTopic.author_name} src={activeTopic.author_avatar} size="lg" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-brand-navy">{activeTopic.author_name}</span>
                        <RolePill role={activeTopic.author_role as UserRole} specialty={activeTopic.author_specialty} crp={activeTopic.author_crp} />
                      </div>
                      <span className="text-[11px] text-slate-400">{formatDate(activeTopic.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge color={CAT_COLOR[activeTopic.category] ?? 'default'}>
                      {activeTopic.category}
                    </Badge>
                    {canEditTopic && !editingTopic && (
                      <IconButton variant="ghost" size="sm" onClick={startEditTopic}>
                        <Pencil size={13} />
                      </IconButton>
                    )}
                    {canDeleteTopic && !editingTopic && (
                      <IconButton variant="ghost" size="sm" onClick={() => setConfirmDeleteTopic(true)}>
                        <Trash2 size={13} className="text-red-400" />
                      </IconButton>
                    )}
                  </div>
                </div>

                {/* Modo edição do tópico */}
                {editingTopic ? (
                  <form onSubmit={handleSaveTopic} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      rows={5}
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <Button variant="outline" size="sm" type="button" onClick={() => setEditingTopic(false)}>
                        Cancelar
                      </Button>
                      <Button variant="primary" size="sm" type="submit" loading={savingEdit}>
                        Salvar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2 className="text-xl font-serif font-bold text-brand-navy mb-4 leading-snug">
                      {activeTopic.title}
                    </h2>
                    <div className="bg-brand-sand/30 border border-brand-sand rounded-2xl p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {activeTopic.content}
                    </div>
                  </>
                )}

                {/* Barra de interações */}
                {!editingTopic && (
                  <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-brand-sand/50">
                    <button
                      onClick={() => handleLike(activeTopic.id)}
                      disabled={likedTopics.has(activeTopic.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                        likedTopics.has(activeTopic.id)
                          ? 'bg-brand-moss/10 text-brand-moss cursor-default'
                          : 'bg-slate-50 text-slate-500 hover:bg-brand-moss/5 hover:text-brand-moss border border-slate-200'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {activeTopic.likes} curtida{activeTopic.likes !== 1 ? 's' : ''}
                    </button>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Eye className="w-3.5 h-3.5" />
                      {activeTopic.views + 1} visualizações
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {activeReplies.length} {activeReplies.length === 1 ? 'resposta' : 'respostas'}
                    </span>
                    {activeTopic.is_solved ? (
                      <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolvido
                      </span>
                    ) : null}
                  </div>
                )}
              </ContentCard>

              {/* Respostas */}
              {activeReplies.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    {activeReplies.length} {activeReplies.length === 1 ? 'resposta' : 'respostas e aconselhamentos'}
                  </p>

                  {activeReplies.map((reply, idx) => (
                    <div
                      key={reply.id}
                      className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                        reply.is_expert_reply
                          ? 'bg-cyan-50/40 border-cyan-200/70'
                          : 'bg-white border-brand-sand/60'
                      }`}
                    >
                      {/* Cabeçalho da resposta */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <AvatarFallback name={reply.author_name} src={reply.author_avatar} size="sm" />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-brand-navy">{reply.author_name}</span>
                              <RolePill role={reply.author_role as UserRole} specialty={reply.author_specialty} crp={reply.author_crp} />
                            </div>
                            <span className="text-[10px] text-slate-400">{formatDate(reply.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {reply.is_expert_reply && editingReplyId !== reply.id && (
                            <span className="flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-cyan-800 text-white shadow-sm">
                              <HeartHandshake className="w-3 h-3" />
                              Especialista
                            </span>
                          )}
                          {!reply.is_expert_reply && editingReplyId !== reply.id && (
                            <span className="text-[10px] text-slate-300 font-medium mr-1">#{idx + 1}</span>
                          )}
                          {canEditReply(reply) && editingReplyId !== reply.id && (
                            <IconButton variant="ghost" size="sm" onClick={() => startEditReply(reply)}>
                              <Pencil size={12} />
                            </IconButton>
                          )}
                          {canDeleteReply(reply) && editingReplyId !== reply.id && (
                            <IconButton variant="ghost" size="sm" onClick={() => setConfirmDeleteReplyId(reply.id)}>
                              <Trash2 size={12} className="text-red-400" />
                            </IconButton>
                          )}
                        </div>
                      </div>

                      {/* Modo edição da resposta */}
                      {editingReplyId === reply.id ? (
                        <div className="pl-[2.75rem] space-y-2">
                          <Textarea
                            value={editReplyText}
                            onChange={e => setEditReplyText(e.target.value)}
                            rows={3}
                          />
                          <div className="flex justify-end gap-2">
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
                        <p className="text-sm text-slate-700 leading-relaxed pl-[2.75rem] whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* ─ Sidebar (1/3) ─ */}
            <div className="space-y-4">

              {/* Caixa de resposta */}
              <ContentCard padding="md">
                <div className="flex items-center gap-2.5 mb-4">
                  <AvatarFallback name={currentUser.name} src={currentUser.avatar} size="sm" />
                  <div>
                    <p className="text-xs font-bold text-brand-navy">Responder como {currentUser.name}</p>
                    {currentUser.role === 'professional' && (
                      <p className="text-[10px] text-cyan-600 font-semibold flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3 h-3" />
                        Resposta marcada como especialista
                      </p>
                    )}
                  </div>
                </div>
                <form onSubmit={handleReply} className="space-y-3">
                  <Textarea
                    placeholder="Escreva sua opinião, dica prática ou palavras de acolhimento..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={4}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={submittingReply}
                    iconLeft={<Send size={13} />}
                    disabled={!replyText.trim()}
                  >
                    Enviar Resposta
                  </Button>
                </form>
              </ContentCard>

              {/* Info do tópico */}
              <ContentCard padding="md">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Sobre este tópico</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5"><Eye size={12} /> Visualizações</span>
                    <span className="font-bold text-brand-navy">{activeTopic.views + 1}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5"><ThumbsUp size={12} /> Curtidas</span>
                    <span className="font-bold text-brand-navy">{activeTopic.likes}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5"><MessageCircle size={12} /> Respostas</span>
                    <span className="font-bold text-brand-navy">{activeReplies.length}</span>
                  </div>
                  {activeTopic.is_solved ? (
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                      <CheckCircle size={12} />
                      Tópico resolvido
                    </div>
                  ) : null}
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
      <PageWrapper>
        <div className="animate-scaleUp">
          <ContentCard padding="lg">
            <div className="flex items-center justify-between pb-4 border-b border-brand-sand mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-moss/10 rounded-xl">
                  <Plus className="w-4 h-4 text-brand-moss" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-navy">Publicar Novo Tópico</h3>
                  <p className="text-[10px] text-slate-400">Compartilhe com a comunidade Melodias</p>
                </div>
              </div>
              <IconButton variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X size={15} />
              </IconButton>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Título do Tópico"
                  placeholder="Ex: Técnicas rápidas de mindfulness diária"
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

              <div className="space-y-2">
                <div className="bg-cyan-50/60 border border-cyan-200/70 rounded-xl px-3.5 py-2.5 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-cyan-700 leading-relaxed">
                    Este fórum é moderado pela equipe Melodias. Seja respeitoso e acolhedor com os colegas.
                  </p>
                </div>
                <Textarea
                  label="Conteúdo / Desabafo"
                  placeholder="Sinta-se seguro para descrever seu momento ou sua dúvida. Nossa comunidade está aqui para apoiar."
                  value={fContent}
                  onChange={e => setFContent(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-brand-sand/50">
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  loading={submittingTopic}
                  disabled={!fTitle.trim() || !fContent.trim()}
                  iconLeft={<Send size={14} />}
                >
                  Publicar Discussão
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
    <PageWrapper>
      <div className="space-y-5 sm:space-y-6 animate-fadeIn">

        <SectionTitle
          title="Fórum de Discussão e Apoio"
          description="Espaço acolhedor para membros compartilharem e psicólogos proverem orientações."
          icon={MessageSquare}
          action={
            <Button variant="primary" size="sm" iconLeft={<Plus size={14} />} onClick={() => setShowForm(true)}>
              Novo Tópico
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <ContentCard padding="sm">
            <p className="text-2xl font-black text-brand-navy">{topics.length}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Tópicos</p>
          </ContentCard>
          <ContentCard padding="sm">
            <p className="text-2xl font-black text-brand-moss">{topics.reduce((s, t) => s + (t.replies_count ?? 0), 0)}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Respostas</p>
          </ContentCard>
          <ContentCard padding="sm">
            <p className="text-2xl font-black text-emerald-600">{topics.filter(t => t.is_solved).length}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Resolvidos</p>
          </ContentCard>
        </div>

        {/* Filtros */}
        <FilterLine>
          <FilterLineSection grow>
            <FilterLineItem grow>
              <FilterLineSearch value={search} onChange={setSearch} placeholder="Buscar discussões..." />
            </FilterLineItem>
          </FilterLineSection>
        </FilterLine>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCatFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              catFilter === 'all' ? 'bg-brand-moss text-white border-transparent' : 'bg-white text-slate-600 border-brand-sand hover:bg-brand-sand/30'
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition whitespace-nowrap ${
                catFilter === cat ? 'bg-brand-moss text-white border-transparent' : 'bg-white text-slate-600 border-brand-sand hover:bg-brand-sand/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : topics.length === 0 ? (
          <EmptyState
            title="Nenhuma discussão encontrada"
            description="Tente ajustar os filtros ou seja o primeiro a publicar!"
            icon={MessageSquare}
            action={
              <Button size="sm" variant="outline" onClick={() => { setSearch(''); setCatFilter('all'); }}>
                Limpar filtros
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => openTopic(topic.id)}
                className="w-full text-left bg-white border border-brand-sand/60 rounded-2xl p-4 sm:p-5 hover:border-brand-moss hover:shadow-md transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <AvatarFallback name={topic.author_name} src={topic.author_avatar} size="md" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color={CAT_COLOR[topic.category] ?? 'default'} size="sm">{topic.category}</Badge>
                      {topic.is_solved ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Resolvido
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-sm font-bold text-brand-navy group-hover:text-brand-moss transition leading-snug">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{topic.content}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                      <span className="font-semibold text-slate-600">{topic.author_name}</span>
                      <RolePill role={topic.author_role as UserRole} specialty={topic.author_specialty} crp={topic.author_crp} />
                      <span>·</span>
                      <span>{formatDate(topic.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {topic.replies_count ?? topic.repliesCount ?? topic.replies?.length ?? 0}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      likedTopics.has(topic.id)
                        ? 'bg-brand-moss/10 text-brand-moss border border-brand-moss/20'
                        : 'bg-brand-clay/10 text-brand-clay border border-brand-clay/20'
                    }`}>
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

        {/* Callout */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy to-brand-navy-dark p-5 sm:p-6 text-center border border-brand-navy-light/20">
          <div className="absolute inset-0 pointer-events-none select-none">
            <div className="absolute top-2 right-6 text-5xl font-script text-brand-clay/10">♩</div>
            <div className="absolute bottom-2 left-6 text-4xl font-script text-brand-moss/10">♫</div>
          </div>
          <div className="relative z-10">
            <Music2 className="w-6 h-6 text-brand-clay-light mx-auto mb-2" />
            <p className="font-script text-2xl text-brand-clay-light mb-1">Compartilhar é cuidar!</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Cada palavra de apoio aqui pode ser a nota que alguém precisava ouvir hoje.
            </p>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
