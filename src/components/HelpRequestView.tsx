import React, { useState, useEffect } from 'react';
import {
  HeartPulse, AlertOctagon, ShieldCheck, Send, CheckCircle2,
  MessageSquare, X, Phone, Lock, Zap, Clock, User,
  Stethoscope, AlertTriangle, Heart, Wifi, RefreshCw, AlertCircle
} from 'lucide-react';
import { helpApi, type HelpRequest } from '../lib/api';
import { useAuth } from '../lib/auth';
import { PageWrapper, SectionTitle, ContentCard } from './ui/PageWrapper';
import { Badge } from './ui/Badge';

const URGENCY_OPT = [
  { level: 'baixa'   as const, label: 'Leve',     sublabel: 'Ansiedade comum / cansaço',     active: 'bg-slate-700 border-slate-700 text-white',   dot: 'bg-slate-400'   },
  { level: 'media'   as const, label: 'Moderada', sublabel: 'Estresse / tristeza persistente', active: 'bg-blue-700 border-blue-700 text-white',     dot: 'bg-blue-500'    },
  { level: 'alta'    as const, label: 'Alta',      sublabel: 'Insônia / crise ansiosa ativa',  active: 'bg-amber-600 border-amber-600 text-white',   dot: 'bg-amber-500'   },
  { level: 'urgente' as const, label: 'Urgente',   sublabel: 'Pânico / sensação de desamparo', active: 'bg-rose-600 border-rose-600 text-white',     dot: 'bg-rose-500 animate-pulse' },
];

function UrgencyBadge({ level }: { level: string }) {
  const map: Record<string, { color: 'default'|'info'|'warning'|'danger'; label: string }> = {
    baixa:   { color: 'default',  label: 'Leve'     },
    media:   { color: 'info',     label: 'Moderada' },
    alta:    { color: 'warning',  label: 'Alta'     },
    urgente: { color: 'danger',   label: 'Urgente'  },
  };
  const m = map[level] ?? map.baixa;
  return <Badge color={m.color} size="sm">{m.label}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Aberto')
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"/>Aguardando</span>;
  if (status === 'Em Atendimento')
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200"><Wifi className="w-2.5 h-2.5"/>Em Atendimento</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-2.5 h-2.5"/>Concluído</span>;
}

// ── WORKSPACE (profissional/admin) ────────────────────────────────────────────
function WorkspaceView() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<'all'|'Aberto'|'Em Atendimento'|'Concluído'>('all');
  const [chatId, setChatId]     = useState<string|null>(null);
  const [chatMsg, setChatMsg]   = useState('');
  const [chatLog, setChatLog]   = useState([
    { from: 'patient',   text: 'Olá, obrigado por aceitar meu caso. Me sinto muito cansado...' },
    { from: 'therapist', text: 'Fique calmo. Estou lendo suas informações. Vamos conversar sem pressões.' },
  ]);
  const [error, setError] = useState<string|null>(null);

  const load = () => {
    setLoading(true);
    helpApi.list({ status: filter !== 'all' ? filter : undefined })
      .then(res => { setRequests(res.data); setError(null); })
      .catch(() => setError('Não foi possível carregar os chamados.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const accept = async (id: string) => {
    await helpApi.update(id, { status: 'Em Atendimento', assigned_professional: user?.name });
    load();
  };
  const resolve = async (id: string) => {
    await helpApi.update(id, { status: 'Concluído' });
    load();
  };

  const sendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setChatLog(p => [...p, { from: 'therapist', text: chatMsg }]);
    setChatMsg('');
    setTimeout(() => {
      setChatLog(p => [...p, { from: 'patient', text: 'Obrigado pelo direcionamento. Já me sinto mais calmo.' }]);
    }, 2000);
  };

  const chatReq = requests.find(r => r.id === chatId);
  const counts = {
    Aberto: requests.filter(r => r.status === 'Aberto').length,
    'Em Atendimento': requests.filter(r => r.status === 'Em Atendimento').length,
    Concluído: requests.filter(r => r.status === 'Concluído').length,
  };

  return (
    <PageWrapper id="help-desk-workspace">
      <div className="space-y-5 sm:space-y-6 animate-fadeIn">

        <ContentCard padding="md" id="workspace-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-50 rounded-xl shrink-0">
                <HeartPulse className="w-5 h-5 text-rose-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">Workspace de Triagem e Acolhimento</h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">
                  Logado como <span className="font-bold text-brand-navy">{user?.name}</span>. Gerencie chamados abertos com ética e empatia.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {counts['Aberto'] > 0 && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <AlertTriangle className="w-4 h-4" />{counts['Aberto']} aguardando
                </div>
              )}
              <button onClick={load} className="p-2 text-slate-400 hover:text-brand-clay rounded-lg transition" title="Atualizar">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-brand-sand/60">
            {[
              { label: 'Abertos',         value: counts['Aberto'],           color: 'text-rose-600'    },
              { label: 'Em Atendimento',  value: counts['Em Atendimento'],   color: 'text-cyan-700'    },
              { label: 'Concluídos',      value: counts['Concluído'],         color: 'text-emerald-600' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </ContentCard>

        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
            <button onClick={load} className="ml-auto text-xs font-bold underline">Tentar novamente</button>
          </div>
        )}

        {/* Chat overlay */}
        {chatId && chatReq && (
          <ContentCard padding="lg" id={`chat-${chatId}`}>
            <div className="flex items-center justify-between pb-4 border-b border-brand-sand mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 -ml-4" />
                <p className="text-sm font-bold text-brand-navy ml-1">Sessão Virtual Conectada</p>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">AO VIVO</span>
              </div>
              <button onClick={() => setChatId(null)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-clay bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition">
                <X className="w-3.5 h-3.5" />Sair da sala
              </button>
            </div>
            <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-xl mb-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs font-bold text-rose-800">{chatReq.patient_name}</span>
                <UrgencyBadge level={chatReq.urgency} />
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">"{chatReq.description}"</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[160px] max-h-72 overflow-y-auto space-y-3 custom-scrollbar">
              {chatLog.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'therapist' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl max-w-xs text-xs leading-relaxed ${
                    msg.from === 'therapist' ? 'bg-brand-navy text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-bl-none'
                  }`}>
                    <p className="text-[9px] font-bold opacity-60 mb-1">{msg.from === 'therapist' ? `${user?.name} (Psicólogo)` : chatReq.patient_name}</p>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMsg} className="flex gap-2 mt-3">
              <input type="text" placeholder="Escreva sua orientação..." value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                className="flex-1 text-xs bg-white border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-navy/20 transition" />
              <button type="submit" className="px-4 py-2.5 bg-brand-navy hover:bg-brand-navy-dark text-white rounded-xl transition shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </ContentCard>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5">
          {([
            { val: 'all'            as const, label: `Todos (${requests.length})` },
            { val: 'Aberto'         as const, label: `Abertos (${counts['Aberto']})` },
            { val: 'Em Atendimento' as const, label: `Em Atendimento (${counts['Em Atendimento']})` },
            { val: 'Concluído'      as const, label: 'Concluídos' },
          ] as const).map(f => (
            <button key={f.val} onClick={() => setFilter(f.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${filter === f.val ? 'bg-brand-navy text-white border-transparent' : 'bg-white text-slate-600 border-brand-sand hover:bg-brand-sand/30'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />Carregando chamados...
          </div>
        ) : requests.length === 0 ? (
          <ContentCard padding="lg">
            <div className="text-center py-6">
              <CheckCircle2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-semibold">Nenhum caso com este filtro</p>
            </div>
          </ContentCard>
        ) : (
          <div id="requests-list" className="space-y-3">
            {requests.map(req => (
              <div key={req.id} id={`request-card-${req.id}`}>
              <ContentCard padding="md">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-brand-navy">{req.patient_name}</span>
                      <span className="text-[10px] text-slate-400">{req.patient_email}</span>
                      <UrgencyBadge level={req.urgency} />
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-xs text-slate-600 italic leading-relaxed border-l-2 border-brand-sand pl-3">"{req.description}"</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(req.created_at).toLocaleString('pt-BR')}</span>
                      {req.assigned_professional && (
                        <span className="flex items-center gap-1 text-cyan-700 font-semibold">
                          <Stethoscope className="w-3 h-3" />{req.assigned_professional}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col gap-2 min-w-[160px]">
                    {req.status === 'Aberto' && (
                      <button id={`btn-accept-${req.id}`} onClick={() => accept(req.id)}
                        className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 bg-brand-clay hover:bg-brand-clay-dark text-white text-xs font-bold uppercase rounded-xl shadow-md transition">
                        <Heart className="w-3.5 h-3.5" />Acolher Chamado
                      </button>
                    )}
                    {req.status === 'Em Atendimento' && (
                      <>
                        <button id={`btn-chat-${req.id}`} onClick={() => setChatId(req.id)}
                          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-brand-navy hover:bg-brand-navy-dark text-white text-xs font-bold rounded-xl transition">
                          <MessageSquare className="w-3.5 h-3.5" />Chat Ativo
                        </button>
                        <button id={`btn-resolve-${req.id}`} onClick={() => resolve(req.id)}
                          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">
                          <CheckCircle2 className="w-3.5 h-3.5" />Encerrar Caso
                        </button>
                      </>
                    )}
                    {req.status === 'Concluído' && (
                      <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-xs font-bold py-2">
                        <CheckCircle2 className="w-4 h-4" />Resolvido
                      </div>
                    )}
                  </div>
                </div>
              </ContentCard>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

// ── MEMBER VIEW ───────────────────────────────────────────────────────────────
function MemberHelpView() {
  const [urgency, setUrgency] = useState<'baixa'|'media'|'alta'|'urgente'>('media');
  const [desc, setDesc]       = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState<string|null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    setSending(true);
    try {
      await helpApi.create({ urgency, description: desc });
      setDesc('');
      setSent(true);
      setError(null);
      setTimeout(() => setSent(false), 6000);
    } catch {
      setError('Erro ao enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <PageWrapper id="help-request-member-view">
      <div className="space-y-5 sm:space-y-6 animate-fadeIn max-w-4xl mx-auto">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-navy via-[#1e2f44] to-brand-navy-dark border border-brand-navy-light/20 p-6 sm:p-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/8 rounded-full blur-3xl" />
            <div className="absolute top-4 right-8 text-6xl font-script text-brand-clay/10 select-none">♡</div>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 bg-rose-500/15 border border-rose-500/20 rounded-2xl shrink-0">
              <HeartPulse className="w-7 h-7 text-rose-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">Canal de Ajuda e Acolhimento</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Está passando por um momento difícil? Descreva como se sente. Um psicólogo homologado irá acolher seu caso com sigilo e ética.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ContentCard padding="lg" id="help-form-card" className="lg:col-span-2">
            <SectionTitle title="Enviar Solicitação" icon={Send} divider />
            <form id="help-request-form" onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Como você está se sentindo agora?</label>
                <div className="grid grid-cols-2 gap-2">
                  {URGENCY_OPT.map(u => (
                    <button key={u.level} type="button" id={`urgency-${u.level}`}
                      onClick={() => setUrgency(u.level)}
                      className={`relative p-3.5 rounded-xl border-2 text-left transition-all ${
                        urgency === u.level ? u.active : `bg-white border-slate-200 hover:border-slate-300 text-brand-navy`
                      }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${urgency === u.level ? 'bg-white/80' : u.dot}`} />
                        <span className="text-xs font-bold uppercase tracking-wide">{u.label}</span>
                      </div>
                      <p className={`text-[10px] leading-tight ${urgency === u.level ? 'opacity-80' : 'text-slate-500'}`}>{u.sublabel}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Descreva o que está sentindo</label>
                <div className="bg-brand-moss/5 border border-brand-moss/20 rounded-xl px-3 py-2 flex items-start gap-2 mb-2">
                  <Lock className="w-3.5 h-3.5 text-brand-moss shrink-0 mt-0.5" />
                  <p className="text-[11px] text-brand-moss-dark">Canal privado — visível apenas a psicólogos credenciados.</p>
                </div>
                <textarea id="help-description" rows={5} required
                  placeholder="Sinta-se à vontade. Descreva sua situação..."
                  value={desc} onChange={e => setDesc(e.target.value)}
                  className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition resize-none min-h-[130px]" />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              <button id="btn-submit-help" type="submit" disabled={sending}
                className="w-full py-3.5 bg-brand-clay hover:bg-brand-clay-dark disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-brand-clay/20 transition flex items-center justify-center gap-2">
                {sending ? <><RefreshCw className="w-4 h-4 animate-spin" />Enviando...</> : <><Send className="w-4 h-4" />Enviar para Psicólogo Disponível</>}
              </button>
            </form>
            {sent && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">Chamado enviado com sucesso!</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Um psicólogo homologado irá acolher seu caso em instantes.</p>
                </div>
              </div>
            )}
          </ContentCard>

          <div className="space-y-4">
            <ContentCard padding="md">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 bg-brand-moss/10 rounded-xl"><ShieldCheck className="w-4 h-4 text-brand-moss" /></div>
                <h4 className="text-xs font-bold text-brand-navy">Privacidade Garantida</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                O Melodias segue a LGPD e o Código de Ética do CFP/CRP. Nenhum dado é exposto a outros membros.
              </p>
            </ContentCard>
            <ContentCard padding="md">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 bg-rose-50 rounded-xl"><AlertOctagon className="w-4 h-4 text-rose-500" /></div>
                <h4 className="text-xs font-bold text-brand-navy">Emergência Imediata?</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">Caso esteja em risco de vida, ligue para o CVV gratuitamente.</p>
              <a href="tel:188" className="flex items-center justify-center gap-2 w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md">
                <Phone className="w-3.5 h-3.5" />CVV — Disque 188 (gratuito)
              </a>
            </ContentCard>
            <ContentCard padding="md">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 bg-brand-clay/10 rounded-xl"><Zap className="w-4 h-4 text-brand-clay" /></div>
                <h4 className="text-xs font-bold text-brand-navy">Como funciona</h4>
              </div>
              <div className="space-y-2.5">
                {[
                  { n:'1', text: 'Você descreve como está se sentindo' },
                  { n:'2', text: 'Um psicólogo é notificado pelo sistema' },
                  { n:'3', text: 'O profissional acolhe e inicia o chat' },
                  { n:'4', text: 'Caso encerrado com acompanhamento' },
                ].map(step => (
                  <div key={step.n} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-clay/10 text-brand-clay text-[10px] font-black flex items-center justify-center shrink-0">{step.n}</span>
                    <p className="text-[11px] text-slate-500 leading-snug pt-0.5">{step.text}</p>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

// ── EXPORT ────────────────────────────────────────────────────────────────────
export default function HelpRequestView() {
  const { user } = useAuth();
  const isSpecialist = user?.role === 'professional' || user?.role === 'super-admin';
  if (isSpecialist) return <WorkspaceView />;
  return <MemberHelpView />;
}
