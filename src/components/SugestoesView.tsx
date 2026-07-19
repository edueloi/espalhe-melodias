import React, { useState, useEffect } from 'react';
import {
  Lightbulb, Send, ThumbsUp, Sparkles, Clock,
  User, CheckCircle2, Heart, RefreshCw, AlertCircle
} from 'lucide-react';
import { suggestionsApi, type Suggestion } from '../lib/api';
import { useAuth } from '../lib/auth';
import { PageWrapper, SectionTitle, ContentCard } from './ui/PageWrapper';

const SUGGESTION_TIPS = [
  'Tema para o próximo encontro mensal',
  'Nova funcionalidade para a plataforma',
  'Dinâmica ou atividade para o grupo',
  'Palestra ou convidado especial',
];

const STATUS_META: Record<string, { label: string; color: string }> = {
  'open':       { label: 'Aberta',       color: 'bg-slate-50 text-slate-600 border-slate-200' },
  'in-progress':{ label: 'Em análise',   color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'done':       { label: 'Implementada', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'rejected':   { label: 'Recusada',     color: 'bg-red-50 text-red-600 border-red-200' },
};

interface SugestoesViewProps {
  isAdmin?: boolean;
}

export default function SugestoesView({ isAdmin = false }: SugestoesViewProps) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [liked, setLiked]       = useState<Set<string>>(new Set());
  const [filter, setFilter]     = useState<'todas' | 'minhas'>('todas');
  const [error, setError]       = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    suggestionsApi.list()
      .then(res => { setSuggestions(res.data); setError(null); })
      .catch(() => setError('Não foi possível carregar as sugestões.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await suggestionsApi.create(text);
      setText('');
      setSent(true);
      setTimeout(() => setSent(false), 4000);
      load();
    } catch {
      setError('Erro ao enviar sugestão. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const handleLike = async (id: string) => {
    if (liked.has(id)) return;
    try {
      await suggestionsApi.like(id);
      setLiked(prev => new Set([...prev, id]));
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, likes: s.likes + 1 } : s));
    } catch { /* silencioso */ }
  };

  const displayed = suggestions.filter(s =>
    filter === 'todas' ? true : s.author_name === user?.name
  );

  const total     = suggestions.length;
  const myCount   = suggestions.filter(s => s.author_name === user?.name).length;
  const totalLikes = suggestions.reduce((sum, s) => sum + s.likes, 0);

  return (
    <PageWrapper id="sugestoes-view" mobileBottomPad>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn">

        {/* ── HEADER ── */}
        <ContentCard padding="md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-50 rounded-xl shrink-0">
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Comunidade Ativa</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">
                  {isAdmin ? 'Sugestões dos Associados' : 'Caixa de Sugestões'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">
                  {isAdmin
                    ? 'Acompanhe e gerencie as ideias enviadas pelos membros da comunidade.'
                    : 'Compartilhe ideias para fortalecer nossa comunidade. Cada sugestão contribui para a sinfonia coletiva.'}
                </p>
              </div>
            </div>
            <button onClick={load} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition shrink-0" title="Atualizar">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-brand-sand/60">
            {[
              { label: 'Total', value: total, color: 'text-brand-navy' },
              { label: 'Minhas', value: myCount, color: 'text-amber-600' },
              { label: 'Curtidas', value: totalLikes, color: 'text-brand-clay' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </ContentCard>

        {error && (
          <div className="flex items-center gap-2.5 p-4 sm:p-5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={load} className="text-xs font-bold underline whitespace-nowrap ml-2">Tentar novamente</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* ── FORM (apenas para membros não-admin) ── */}
          {!isAdmin && (
            <ContentCard padding="lg" id="sugestoes-form-card" className="lg:col-span-1 bg-white border border-brand-sand/60">
              <SectionTitle title="Nova Sugestão" icon={Send} divider />
              <form id="sugestoes-form" onSubmit={handleSubmit} className="space-y-5 mt-5">
                <textarea
                  id="sugestao-textarea"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Descreva sua ideia aqui..."
                  rows={5}
                  className="w-full text-sm text-brand-navy bg-white border border-brand-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition resize-none px-4 py-3"
                />
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Inspirações:</p>
                  <div className="space-y-2">
                    {SUGGESTION_TIPS.map(tip => (
                      <button key={tip} type="button"
                        onClick={() => setText(tip)}
                        className="w-full text-left text-sm text-brand-clay hover:text-brand-clay-dark py-2.5 px-3 rounded-lg hover:bg-brand-clay/5 border border-brand-sand/40 hover:border-brand-clay/30 transition flex items-center gap-2">
                        <Sparkles className="w-4 h-4 shrink-0" />{tip}
                      </button>
                    ))}
                  </div>
                </div>
                <button id="btn-submit-suggestion" type="submit" disabled={sending}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold uppercase tracking-wider rounded-lg shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2">
                  {sending ? <><RefreshCw className="w-4 h-4 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar</>}
                </button>
              </form>
              {sent && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Enviada com sucesso!</p>
                    <p className="text-xs text-emerald-600 mt-1">Sua ideia está visível para a comunidade.</p>
                  </div>
                </div>
              )}
            </ContentCard>
          )}

          {/* ── LIST ── */}
          <div className={`space-y-4 sm:space-y-5 ${!isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'}`} id="sugestoes-list-section">
            {/* Filter */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {(['todas', 'minhas'] as const).map(f => (
                <button key={f} id={`filter-sugestoes-${f}`}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition ${
                    filter === f
                      ? 'bg-brand-navy text-white border-transparent'
                      : 'bg-white text-slate-700 border-brand-sand/60 hover:bg-brand-sand/20'
                  }`}>
                  {f === 'todas' ? `Todas (${total})` : `Minhas (${myCount})`}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400 text-base gap-3">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Carregando sugestões...
              </div>
            ) : displayed.length === 0 ? (
              <ContentCard padding="lg" className="text-center py-12 bg-brand-sand/10 border border-brand-sand/40">
                <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-base font-semibold text-slate-500">
                  {filter === 'minhas' ? 'Você ainda não enviou sugestões.' : 'Nenhuma sugestão ainda.'}
                </p>
              </ContentCard>
            ) : (
              <div id="sugestoes-list" className="space-y-4">
                {[...displayed].reverse().map((sug, i) => {
                  const isOwn   = sug.author_name === user?.name;
                  const hasLiked = liked.has(sug.id);
                  const meta    = STATUS_META[sug.status] ?? STATUS_META['open'];
                  return (
                    <div key={sug.id} id={`suggestion-card-${sug.id}`}
                      className={`bg-white border rounded-lg p-5 sm:p-6 transition hover:shadow-md hover:border-amber-200/50 ${
                        isOwn ? 'border-amber-200 bg-amber-50/40' : 'border-brand-sand/60'
                      }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="relative shrink-0">
                            {sug.author_avatar ? (
                              <img
                                src={sug.author_avatar}
                                alt={sug.author_name}
                                className="w-10 h-10 rounded-xl object-cover border border-brand-sand"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl border border-brand-sand bg-brand-moss/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-brand-moss">
                                  {sug.author_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white ${
                              i === 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {displayed.length - i}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base text-slate-800 leading-relaxed">{sug.content}</p>
                            {sug.admin_note && (
                              <p className="mt-3 text-xs sm:text-sm text-brand-moss bg-brand-moss/5 border border-brand-moss/20 rounded-lg px-3 py-2 italic">
                                <strong>Nota da equipe:</strong> {sug.admin_note}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                              <span className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
                                <User className="w-4 h-4 shrink-0" />
                                <span className="font-semibold text-slate-700">{sug.author_name}</span>
                              </span>
                              {isOwn && <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">Você</span>}
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${meta.color}`}>{meta.label}</span>
                              <span className="flex items-center gap-1 text-xs sm:text-sm text-slate-500 ml-auto sm:ml-0">
                                <Clock className="w-4 h-4 shrink-0" />
                                {new Date(sug.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          id={`btn-like-sug-${sug.id}`}
                          onClick={() => handleLike(sug.id)}
                          disabled={hasLiked}
                          className={`flex flex-col items-center gap-1 px-3.5 py-2.5 rounded-lg border transition shrink-0 ${
                            hasLiked
                              ? 'bg-amber-50 border-amber-200 text-amber-600 cursor-default'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600'
                          }`}>
                          <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-amber-500 stroke-amber-500' : ''}`} />
                          <span className="text-xs font-bold">{sug.likes}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER / CALLOUT ── */}
        <ContentCard padding="md" id="sugestoes-callout" className="bg-amber-50/40 border border-amber-200/60">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-100/70 rounded-xl shrink-0">
              <Heart className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-navy">Sua voz fortalece nossa conexão!</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
                Cada ideia compartilhada é uma nota que contribui para a sinfonia coletiva do Espalhe Melodias.
              </p>
            </div>
          </div>
        </ContentCard>

      </div>
    </PageWrapper>
  );
}
