import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, Clock, BookOpen, MessageSquare, Lightbulb,
  ArrowRight, Sparkles, Share2, Calendar, Send, ChevronRight,
  HeartPulse, GraduationCap, Bell, Star, TrendingUp, Music2, Zap
} from 'lucide-react';
import { AppUser } from '../types';
import { StatCard } from './ui/StatCard';
import { PageWrapper, SectionTitle, StatGrid, ContentCard } from './ui/PageWrapper';
import { usersApi, suggestionsApi, type UserStats, type Suggestion } from '../lib/api';

interface DashboardViewProps {
  currentUser: AppUser;
  onsetTab: (tabId: string) => void;
}

const QUOTES = [
  { text: "A cura não significa que o dano nunca existiu. Significa que o dano não controla mais a nossa vida.", author: "TCC" },
  { text: "Suas falhas não definem você. Seus recomeços corajosos sim.", author: "Mindfulness" },
  { text: "Há uma fresta em tudo. É por onde a luz consegue entrar.", author: "Leonard Cohen" },
];

export default function DashboardView({ currentUser, onsetTab }: DashboardViewProps) {
  const [suggestionText, setSuggestionText] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [quoteIdx] = useState(() => Math.floor(Date.now() % QUOTES.length));
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentSuggestions, setRecentSuggestions] = useState<Suggestion[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setCurrentTime(`${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  // Carrega stats reais do backend
  useEffect(() => {
    setLoadingStats(true);
    Promise.all([
      usersApi.stats(),
      suggestionsApi.list({ page: 1 }),
    ])
      .then(([userStats, sugs]) => {
        setStats(userStats);
        setRecentSuggestions(sugs.data);
      })
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, []);

  const handleSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    try {
      await suggestionsApi.create(suggestionText);
      setSuggestionText('');
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 3000);
      // Atualiza lista
      const res = await suggestionsApi.list({ page: 1 });
      setRecentSuggestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const roleLabel = {
    'super-admin': 'Super Administrador · Acesso Total',
    professional:  'Profissional de Saúde · Credenciado',
    member:        'Associado · Melodias Care',
  }[currentUser.role];

  const total    = stats?.total    ?? 0;
  const approved = stats?.approved ?? 0;
  const pending  = stats?.pending  ?? 0;
  const activeRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <PageWrapper id="dashboard-view" mobileBottomPad>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn">

        {/* ── HERO BANNER ── */}
        <div className="relative bg-gradient-to-br from-brand-navy via-[#1e3346] to-brand-navy-dark rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-brand-navy-light/30">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand-clay/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-brand-moss/10 blur-2xl" />
            <div className="absolute top-4 right-8 text-6xl font-script text-brand-clay/10 select-none">♩</div>
            <div className="absolute bottom-4 left-6 text-5xl font-script text-brand-moss/10 select-none">♪</div>
          </div>
          <div className="relative z-10 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-semibold text-brand-clay-light uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Portal de Acolhimento
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white leading-tight">
                Olá, {currentUser.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
                Bem-vindo ao <span className="text-white font-semibold">Sistema Espalhe Melodias</span>. Aqui está o panorama da comunidade hoje.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {roleLabel}
              </div>
            </div>
            <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center backdrop-blur-sm min-w-[160px]">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
                <Clock className="w-4 h-4 text-brand-clay-light" />
                <span className="text-[10px] uppercase tracking-widest font-semibold">Brasília</span>
              </div>
              <span className="text-4xl font-mono font-bold text-white tabular-nums">{currentTime}</span>
              <p className="text-[11px] text-slate-400 mt-1">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
              </p>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <section>
          <SectionTitle
            title="Panorama da Plataforma"
            description={loadingStats ? 'Carregando métricas...' : 'Métricas em tempo real do ecossistema Espalhe Melodias'}
            icon={TrendingUp}
            divider
          />
          <StatGrid cols={4}>
            <StatCard title="Total Membros"   value={loadingStats ? '—' : total}    icon={Users}    color="info"
              description={loadingStats ? '' : `${approved} ativos · ${pending} pend.`} delay={0} />
            <StatCard title="Membros Ativos"  value={loadingStats ? '—' : approved} icon={UserCheck} color="success"
              trend={{ value: activeRate, isUp: true }} description={`${activeRate}% aprovados`} delay={0.05} />
            <StatCard title="Profissionais"   value={loadingStats ? '—' : (stats?.professionals ?? 0)} icon={GraduationCap} color="purple"
              description="Psicólogos credenciados" delay={0.1} />
            <StatCard title="Aguardando"      value={loadingStats ? '—' : pending}  icon={Bell}     color="danger"
              description={pending > 0 ? 'Clique para aprovar' : 'Nenhum pendente'} delay={0.15} />
          </StatGrid>
        </section>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-5">

            {/* Ações Rápidas */}
            <ContentCard padding="md">
              <SectionTitle title="Ações Rápidas" description="Atalhos mais acessados" icon={Zap} divider />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                {[
                  { tab: 'materiais-apoio',   icon: BookOpen,      color: 'bg-rose-50 text-brand-clay',    label: 'Biblioteca de Apoio',     sub: 'E-books, áudios e manuais' },
                  { tab: 'forum',             icon: MessageSquare, color: 'bg-blue-50 text-blue-600',      label: 'Fórum Oficial',           sub: 'Debater e tirar dúvidas' },
                  { tab: 'encontros-eventos', icon: Calendar,      color: 'bg-brand-moss/10 text-brand-moss', label: 'Encontros & Eventos',   sub: 'Próximos agendados' },
                  { tab: 'aprendizados',      icon: GraduationCap, color: 'bg-amber-50 text-amber-600',    label: 'Blog Científico',         sub: 'Artigos e aprendizados' },
                  currentUser.role !== 'member'
                    ? { tab: 'admin-solicitacoes', icon: Users,    color: 'bg-rose-50 text-rose-600',     label: `Solicitações (${pending})`, sub: 'Cadastros pendentes' }
                    : { tab: 'preciso-ajuda',      icon: HeartPulse, color: 'bg-red-50 text-red-500',    label: 'Preciso de Ajuda',         sub: 'Falar com um profissional' },
                  currentUser.role !== 'member'
                    ? { tab: 'admin-materiais',    icon: BookOpen, color: 'bg-brand-navy/5 text-brand-navy', label: 'Inserir Material',      sub: 'Publicar e-book ou áudio' }
                    : { tab: 'diretorio-membros',  icon: Users,    color: 'bg-teal-50 text-teal-600',    label: 'Buscar Psicólogo',         sub: 'Ver diretório e perfis' },
                ].map(item => (
                  <button
                    key={item.tab}
                    onClick={() => onsetTab(item.tab)}
                    className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-50 hover:bg-brand-sand/40 border border-slate-100 hover:border-brand-sand rounded-xl transition text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`p-2 rounded-lg ${item.color} shrink-0`}>
                        <item.icon className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-brand-clay transition">{item.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 group-hover:translate-x-0.5 group-hover:text-brand-clay transition-all" />
                  </button>
                ))}
              </div>
            </ContentCard>

            {/* Quote */}
            <ContentCard padding="md">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-clay/10 rounded-xl shrink-0">
                  <Music2 className="w-5 h-5 text-brand-clay" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Reflexão da Comunidade</p>
                  <p className="text-sm italic font-serif text-brand-navy leading-relaxed">
                    "{QUOTES[quoteIdx].text}"
                  </p>
                  <p className="text-xs text-brand-clay font-bold mt-2">— {QUOTES[quoteIdx].author}</p>
                </div>
              </div>
            </ContentCard>

            {/* Mini blog preview */}
            <ContentCard padding="md">
              <div className="flex items-center justify-between mb-4">
                <SectionTitle title="Últimas Publicações" icon={GraduationCap} />
                <button
                  onClick={() => onsetTab('aprendizados')}
                  className="text-xs font-bold text-brand-clay hover:underline flex items-center gap-1 shrink-0"
                >
                  Ver todos <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  {
                    src: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=500&auto=format&fit=crop',
                    cat: 'Informação', catColor: 'bg-rose-50 text-rose-700',
                    title: 'A diferença crucial entre Tristeza e Depressão Clínica',
                    excerpt: 'Ficar triste é uma resposta saudável. A depressão profunda envolve exaustão mental prolongada...',
                  },
                  {
                    src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=500&auto=format&fit=crop',
                    cat: 'Estilo de Vida', catColor: 'bg-emerald-50 text-emerald-700',
                    title: 'Desintoxicação Dopaminérgica: Como resetar seu foco',
                    excerpt: 'Smartphones liberam microdosagem de dopamina a cada deslize. Como restaurar a gratificação natural...',
                  },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => onsetTab('aprendizados')}
                    className="flex gap-3 hover:bg-slate-50 p-2.5 rounded-xl transition text-left w-full group"
                  >
                    <img src={item.src} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.catColor}`}>{item.cat}</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-1 leading-snug group-hover:text-brand-clay transition line-clamp-1">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{item.excerpt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ContentCard>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">

            {/* Caixa de ideias */}
            <ContentCard padding="md">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <Lightbulb className="w-4.5 h-4.5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Caixa de Ideias</h3>
                  <p className="text-[10px] text-slate-400">Sugira temas para os próximos encontros</p>
                </div>
              </div>

              <form onSubmit={handleSuggestion} className="space-y-3">
                <textarea
                  value={suggestionText}
                  onChange={e => setSuggestionText(e.target.value)}
                  placeholder="✍️ Sua ideia ou proposta..."
                  rows={4}
                  className="w-full text-xs text-slate-700 bg-brand-cream border border-brand-sand rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-clay/30 focus:border-brand-clay transition resize-none min-h-[90px]"
                />
                <button
                  type="submit"
                  className="w-full h-10 bg-brand-moss hover:bg-brand-moss-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Sugestão
                </button>
              </form>

              {justSubmitted && (
                <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold text-center animate-fadeIn">
                  🎉 Enviado com sucesso!
                </div>
              )}

              {recentSuggestions.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Últimas ideias:</p>
                  <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                    {recentSuggestions.map(sug => (
                      <div key={sug.id} className="p-2.5 bg-brand-cream border border-brand-sand/60 rounded-xl">
                        <p className="text-xs text-slate-700 italic line-clamp-2">"{sug.content}"</p>
                        <p className="text-[10px] font-bold text-brand-clay mt-1.5">— {sug.author_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ContentCard>

            {/* Taxa de atividade */}
            <ContentCard padding="md">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-moss" />
                Taxa de Atividade
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Membros Ativos</span>
                  <span className="text-brand-moss font-bold">{activeRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-moss to-brand-moss-light h-full rounded-full transition-all duration-700"
                    style={{ width: `${activeRate}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
                    <span className="block text-xl font-black text-emerald-700">{approved}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Ativos</span>
                  </div>
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-center">
                    <span className="block text-xl font-black text-amber-700">{pending}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Pendentes</span>
                  </div>
                </div>
                {pending > 0 && (
                  <button
                    onClick={() => onsetTab('admin-solicitacoes')}
                    className="w-full mt-1 py-2 text-xs font-bold text-brand-clay border border-brand-clay/30 rounded-xl hover:bg-brand-clay/5 transition flex items-center justify-center gap-1.5"
                  >
                    Aprovar pendentes <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </ContentCard>

            {/* WhatsApp */}
            <ContentCard padding="sm">
              <a
                href="https://wa.me/5511999990001"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="p-2.5 bg-emerald-50 rounded-xl shrink-0">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition">WhatsApp Suporte</p>
                  <p className="text-[10px] text-slate-400">Canal direto Melodias</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
              </a>
            </ContentCard>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
