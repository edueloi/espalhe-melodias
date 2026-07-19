import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, Users, Check, ChevronRight,
  RefreshCw, AlertCircle, Share2, Copy, Phone, UserX,
  CheckCircle2, XCircle, Minus, Plus as PlusIcon, ExternalLink,
} from 'lucide-react';
import logoEspalheMelodias from '../images/logo-espalhe-melodias.png';
import { API_ORIGIN } from '../lib/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface EventItem {
  id: string;
  name: string;
  claimedBy: { name: string }[];
}

interface PublicEventData {
  id: string;
  title: string;
  description: string;
  category: string;
  event_date: string;
  event_time: string;
  location: string;
  map_link?: string;
  cover_url?: string;
  instructor_name: string;
  instructor_avatar?: string;
  rsvp_enabled: boolean;
  allow_guests: boolean;
  item_division: boolean;
  items: EventItem[];
  participants_count: number;
  is_open: boolean;        // false = encerrado (após data+hora do evento)
  ended: boolean;          // true = evento já passou
}

interface RsvpSuccess {
  name: string;
  guests: number;
  item: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatWhatsapp(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function parseEventDateTime(date: string, time: string): Date {
  // date pode vir como "2026-05-30T00:00:00.000Z" ou "2026-05-30" — normaliza para YYYY-MM-DD
  const dateOnly = date.includes('T') ? date.split('T')[0] : date;
  // time pode ser "19:00" ou "19:00 - 20:30" — pega só o início
  const t = time.includes('-') ? time.split('-')[0].trim() : time.trim();
  const hhmm = /^\d{2}:\d{2}$/.test(t) ? t : '00:00';
  return new Date(`${dateOnly}T${hhmm}:00`);
}

function formatDateOnly(date: string): string {
  const dateOnly = date.includes('T') ? date.split('T')[0] : date;
  const [year, month, day] = dateOnly.split('-');
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

// Paleta Espalhe Melodias: musgo escuro + clay/terra como base
const CAT_GRADIENT: Record<string, string> = {
  'Grupo de Apoio':     'from-[#3d4a2e] to-[#4a5530]',
  'Palestra Vivencial': 'from-[#1e2d4a] to-[#2c3e53]',
  'Workshop':           'from-[#b5571a] to-[#814324]',
  'Meditação Coletiva': 'from-[#4a5530] to-[#2d3a1e]',
};
const DEFAULT_GRADIENT = 'from-[#3d4a2e] to-[#4a5530]';

function copyLink() {
  navigator.clipboard.writeText(window.location.href).catch(() => {});
}

// ─── Card de item da divisão ──────────────────────────────────────────────────

function ItemChip({
  item,
  selected,
  onClick,
}: {
  item: EventItem;
  selected: boolean;
  onClick: () => void;
}) {
  const taken = item.claimedBy.length > 0 && !selected;
  // Pega primeiro nome de cada pessoa
  const names = item.claimedBy.map(c => c.name.split(' ')[0]).join(', ');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={taken}
      className={[
        'relative flex flex-col items-center gap-0.5 px-4 py-3 rounded-2xl border-2 text-sm font-bold transition-all text-center min-w-[80px]',
        selected
          ? 'border-[#b5571a] bg-[#b5571a] text-white shadow-lg scale-[1.02]'
          : taken
            ? 'border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed opacity-75'
            : 'border-zinc-200 bg-white text-zinc-800 hover:border-[#b5571a] hover:bg-[#fdf6f0] cursor-pointer',
      ].join(' ')}
    >
      {/* Badge de reservado */}
      {taken && (
        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm">✓</span>
      )}

      {/* Nome do item — riscado se tomado */}
      <span className={taken ? 'line-through decoration-zinc-400' : ''}>
        {item.name}
      </span>

      {/* Quem vai levar */}
      {names && (
        <span className={[
          'text-[10px] font-semibold leading-tight',
          selected ? 'text-white/80' : 'text-emerald-600',
        ].join(' ')}>
          {taken ? `↳ ${names}` : `✓ Você!`}
        </span>
      )}
    </button>
  );
}

// ─── View principal ───────────────────────────────────────────────────────────

interface Props {
  eventId: string;
}

export default function EventPublicView({ eventId }: Props) {
  const [event, setEvent]   = useState<PublicEventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  // form RSVP
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [guests, setGuests]     = useState(0);
  const [selectedItem, setSelectedItem] = useState('');
  const [obs, setObs]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [success, setSuccess]       = useState<RsvpSuccess | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`${API_ORIGIN}/api/events/public/${eventId}`)
      .then(r => r.json())
      .then(body => {
        if (body.success) setEvent(body.data);
        else setError(body.message ?? 'Evento não encontrado.');
      })
      .catch(() => setError('Erro ao carregar o evento. Tente novamente.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) { setFormError('Informe seu nome.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_ORIGIN}/api/events/public/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone || undefined,
          guests,
          itemId: selectedItem || undefined,
          observation: obs || undefined,
        }),
      });
      const body = await res.json();
      if (!body.success) { setFormError(body.message ?? 'Erro ao confirmar presença.'); return; }

      setSuccess({ name: name.trim(), guests, item: selectedItem });
      // Recarrega para atualizar itens tomados
      load();
    } catch {
      setFormError('Falha na conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5ede3] flex items-center justify-center">
        <div className="text-center space-y-3">
          <img src={logoEspalheMelodias} alt="Espalhe Melodias" className="w-14 h-14 rounded-2xl object-cover shadow-xl mx-auto" />
          <div className="flex items-center gap-2 text-slate-400 text-sm justify-center">
            <RefreshCw size={13} className="animate-spin" />Carregando evento...
          </div>
        </div>
      </div>
    );
  }

  // ── Erro ───────────────────────────────────────────────────────────────────
  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#f5ede3] flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 text-center">
          <img src={logoEspalheMelodias} alt="Espalhe Melodias" className="w-14 h-14 rounded-2xl object-cover shadow-lg mx-auto mb-6" />
          <XCircle size={36} className="text-red-400 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-[#1a1a2e] mb-2">Evento não encontrado</h2>
          <p className="text-sm text-slate-500">Este link pode estar incorreto ou o evento foi removido.</p>
        </div>
      </div>
    );
  }

  const gradient = CAT_GRADIENT[event.category] ?? DEFAULT_GRADIENT;
  const eventDt  = parseEventDateTime(event.event_date, event.event_time);
  const now      = new Date();
  // Calcula localmente — não confia no `ended` do backend (pode estar bugado)
  const isEnded  = eventDt < now;
  const isClosed = isEnded;

  // Usa formatDateOnly para evitar Invalid Date com strings ISO do MySQL
  const formattedDate = formatDateOnly(event.event_date);
  const formattedTime = event.event_time;

  // ── Sucesso ────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#f5ede3] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${gradient}`} />
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={30} className="text-emerald-500" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1a1a2e] mb-1">Presença confirmada!</h2>
              <p className="text-slate-500 text-sm mb-6">
                Ótimo, <strong>{success.name}</strong>! Te esperamos no evento.
              </p>

              <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 text-left text-white mb-6`}>
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Resumo</p>
                <p className="font-bold text-sm">{event.title}</p>
                <p className="text-xs opacity-80 mt-1">{formattedDate}</p>
                <p className="text-xs opacity-80">{formattedTime} — {event.location}</p>
                {success.guests > 0 && (
                  <p className="text-xs opacity-80 mt-1">+{success.guests} acompanhante{success.guests > 1 ? 's' : ''}</p>
                )}
                {success.item && (
                  <p className="text-xs opacity-80">Você vai trazer: <strong>{event.items.find(i => i.id === success.item)?.name}</strong></p>
                )}
              </div>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: event.title, url: window.location.href }).catch(() => {});
                  } else {
                    copyLink();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#b5571a] text-[#b5571a] font-bold text-sm rounded-2xl hover:bg-[#fdf6f0] transition"
              >
                <Share2 size={15} />Compartilhar evento
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
            Realização: <strong className="text-[#b5571a]">Espalhe Melodias</strong>
          </p>
        </div>
      </div>
    );
  }

  // ── Página principal ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5ede3]">

      {/* ── HERO ── */}
      <div className={`relative bg-gradient-to-br ${gradient} overflow-hidden`}>
        {/* Decorações musicais */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <span className="absolute top-4 left-4 text-6xl text-white/10 font-serif">♩</span>
          <span className="absolute bottom-4 right-6 text-5xl text-white/10 font-serif">♫</span>
          <span className="absolute top-1/2 right-12 text-4xl text-white/8 font-serif">♪</span>
        </div>

        {/* Imagem de capa se existir */}
        {event.cover_url && (
          <div className="absolute inset-0">
            <img src={event.cover_url} alt="" className="w-full h-full object-cover opacity-30" />
            <div className={`absolute inset-0 bg-gradient-to-b ${gradient} opacity-80`} />
          </div>
        )}

        <div className="relative z-10 max-w-2xl mx-auto px-5 pt-10 pb-12 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <img src={logoEspalheMelodias} alt="Espalhe Melodias" className="w-10 h-10 rounded-xl object-cover shadow" />
            <div className="text-left">
              <div className="font-serif text-base font-black text-white/90 leading-none">Espalhe</div>
              <div className="font-script text-xl text-white leading-none -mt-1">Melodias</div>
            </div>
          </div>

          {/* Badge RSVP ou Encerrado */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {isClosed ? (
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">
                <XCircle size={12} />
                {isEnded ? 'EVENTO ENCERRADO' : 'INSCRIÇÕES ENCERRADAS'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                <Calendar size={12} />CONFIRME SUA PRESENÇA
              </span>
            )}
          </div>

          {/* Título */}
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-5">
            {event.title}
          </h1>

          {/* Data e local */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <Calendar size={11} />
              {formattedDate} às {formattedTime}
            </span>
            {event.location && (
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                <MapPin size={11} />{event.location}
              </span>
            )}
          </div>

          {/* Partilhar */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold transition"
            >
              <Copy size={12} />Copiar link
            </button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={() => navigator.share({ title: event.title, url: window.location.href }).catch(() => {})}
                className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold transition"
              >
                <Share2 size={12} />Compartilhar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTEÚDO ── */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Imagem / flyer se existir */}
        {event.cover_url && (
          <div className="rounded-3xl overflow-hidden shadow-lg">
            <img src={event.cover_url} alt={event.title} className="w-full object-cover max-h-[480px]" />
          </div>
        )}

        {/* Descrição */}
        {event.description && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-zinc-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full bg-[#b5571a]" />
              <span className="text-xs font-bold text-[#b5571a] uppercase tracking-widest">Sobre o evento</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        )}

        {/* Detalhes */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-zinc-100">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#fdf6f0] flex items-center justify-center shrink-0">
                <Calendar size={14} className="text-[#b5571a]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Data</p>
                <p className="text-sm font-bold text-zinc-800 capitalize">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#fdf6f0] flex items-center justify-center shrink-0">
                <Clock size={14} className="text-[#b5571a]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Horário</p>
                <p className="text-sm font-bold text-zinc-800">{formattedTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#fdf6f0] flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-[#b5571a]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Local</p>
                <p className="text-sm font-bold text-zinc-800">{event.location || '—'}</p>
                {event.map_link && (
                  <a
                    href={event.map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#b5571a] font-semibold hover:underline mt-0.5"
                  >
                    <ExternalLink size={10} />Ver no mapa
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#fdf6f0] flex items-center justify-center shrink-0">
                <Users size={14} className="text-[#b5571a]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Confirmados</p>
                <p className="text-sm font-bold text-zinc-800">{event.participants_count} pessoa{event.participants_count !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ENCERRADO ── */}
        {isClosed && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 text-center">
            <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              {isEnded ? <UserX size={26} className="text-zinc-400" /> : <XCircle size={26} className="text-zinc-400" />}
            </div>
            <h3 className="font-serif text-lg font-bold text-zinc-700 mb-1">
              {isEnded ? 'Este evento já aconteceu' : 'Inscrições encerradas'}
            </h3>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
              {isEnded
                ? 'Agradecemos a todos que participaram! Fique de olho nos próximos eventos do Espalhe Melodias.'
                : 'As inscrições para este evento foram encerradas. Entre em contato com os organizadores para mais informações.'}
            </p>
          </div>
        )}

        {/* ── FORMULÁRIO RSVP ── */}
        {!isClosed && event.rsvp_enabled && (
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
            {/* Header do form */}
            <div className={`bg-gradient-to-r ${gradient} px-5 py-4`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-white" />
                <span className="text-white font-bold text-sm">Seus Dados</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">

              {/* Nome */}
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">
                  Nome Completo <span className="text-[#b5571a]">*</span>
                </label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Como devemos te chamar?"
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#b5571a]/20 focus:border-[#b5571a] transition"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">
                  WhatsApp / Telefone <span className="text-zinc-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="tel" value={phone}
                    onChange={e => setPhone(formatWhatsapp(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className="w-full pl-9 pr-4 py-3 rounded-2xl border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#b5571a]/20 focus:border-[#b5571a] transition"
                  />
                </div>
              </div>

              {/* Acompanhantes */}
              {event.allow_guests && (
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5">Vai levar acompanhantes?</label>
                  <div className="flex items-center rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-50">
                    <button
                      type="button"
                      onClick={() => setGuests(g => Math.max(0, g - 1))}
                      className="w-12 h-12 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition font-bold text-lg"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="flex-1 text-center text-base font-black text-zinc-800">{guests}</div>
                    <button
                      type="button"
                      onClick={() => setGuests(g => g + 1)}
                      className="w-12 h-12 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition font-bold text-lg"
                    >
                      <PlusIcon size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Divisão de itens */}
              {event.item_division && event.items.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-2">
                    Deseja contribuir com algum item? <span className="text-zinc-400 font-normal">(opcional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {/* Opção "Nenhum" */}
                    <button
                      type="button"
                      onClick={() => setSelectedItem('')}
                      className={[
                        'flex flex-col items-center px-4 py-2.5 rounded-2xl border-2 text-sm font-bold transition-all',
                        !selectedItem
                          ? 'border-[#b5571a] bg-[#b5571a] text-white shadow-md'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300',
                      ].join(' ')}
                    >
                      <span>🚫 Nenhum</span>
                    </button>

                    {event.items.map(item => (
                      <React.Fragment key={item.id}>
                      <ItemChip
                        item={item}
                        selected={selectedItem === item.id}
                        onClick={() => {
                          if (item.claimedBy.length > 0 && selectedItem !== item.id) return;
                          setSelectedItem(selectedItem === item.id ? '' : item.id);
                        }}
                      />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Observação */}
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">
                  Deseja trazer algo diferente ou deixar uma observação?
                </label>
                <textarea
                  value={obs} onChange={e => setObs(e.target.value)} rows={3}
                  placeholder="Ex: Vou levar também um suco natural..."
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#b5571a]/20 focus:border-[#b5571a] transition resize-none"
                />
              </div>

              {/* Erro */}
              {formError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[#b5571a] to-[#814324] hover:opacity-95 active:scale-[0.99] transition-all shadow-lg shadow-[#b5571a]/25 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting
                  ? <><RefreshCw size={15} className="animate-spin" />Confirmando...</>
                  : <><Check size={16} />Confirmar Presença</>
                }
              </button>

              <p className="text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1">
                <ChevronRight size={10} />Seus dados são usados apenas para gestão deste evento.
              </p>
            </form>
          </div>
        )}

      </div>

      {/* ── FOOTER ── */}
      <div className="py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs">
          <img src={logoEspalheMelodias} alt="Espalhe Melodias" className="w-7 h-7 rounded-lg object-cover shadow" />
          <span>Realização: <strong className="text-[#b5571a]">Espalhe Melodias</strong></span>
        </div>
      </div>

    </div>
  );
}
