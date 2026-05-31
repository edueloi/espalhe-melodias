import React, { useState, useEffect } from 'react';
import {
  Users, Search, Star, MapPin, MessageSquare, Coins,
  ArrowLeft, ChevronRight, ShieldCheck, Check, Globe,
  Settings, Plus, Trash2, Phone, RefreshCw, AlertCircle,
  Stethoscope, Calendar, X, Edit3, ExternalLink
} from 'lucide-react';
import { professionalsApi, type Professional } from '../lib/api';
import { useAuth } from '../lib/auth';
import { PageWrapper, SectionTitle, ContentCard } from './ui/PageWrapper';
import { Badge } from './ui/Badge';

const toNumericValue = (value: unknown, fallback = 0) => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const formatCurrency = (value: unknown) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(toNumericValue(value));

const SPECIALTIES = ['Ansiedade', 'Depressão', 'Burnout', 'Stress Ocupacional', 'Autoconhecimento', 'TCC', 'Mindfulness', 'Autoestima', 'Transtorno Pânico', 'Luto', 'Relacionamentos'];

export default function DirectoryView() {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [selected, setSelected] = useState<Professional | null>(null);
  const [view, setView]         = useState<'list' | 'detail' | 'edit' | 'public-site'>('list');
  const [error, setError]       = useState<string | null>(null);

  // booking sim
  const [timeSlot, setTimeSlot] = useState('');
  const [bookMsg, setBookMsg]   = useState('');
  const [booked, setBooked]     = useState(false);

  // edit form
  const [eName, setEName]       = useState('');
  const [eCrp, setECrp]         = useState('');
  const [eBio, setEBio]         = useState('');
  const [ePrice, setEPrice]     = useState(140);
  const [eLocation, setELocation] = useState('');
  const [eWhatsapp, setEWhatsapp] = useState('');
  const [eColor, setEColor]     = useState('#a75a35');
  const [eSpecialties, setESpecialties] = useState<string[]>([]);
  const [eServices, setEServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');
  const [saving, setSaving]     = useState(false);
  const [step, setStep]         = useState(1);

  const load = () => {
    setLoading(true);
    professionalsApi.list({
      specialty: specialty !== 'all' ? specialty : undefined,
      search: search || undefined,
    })
      .then(res => { setProfessionals(res.data); setError(null); })
      .catch(() => setError('Não foi possível carregar o diretório.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, specialty]);

  const isOwn = (prof: Professional) => prof.user_id === user?.id;
  const isPro = user?.role === 'professional' || user?.role === 'super-admin';
  const topRatedCount = professionals.filter(p => toNumericValue(p.rating) >= 4.8).length;

  const openEdit = (prof: Professional) => {
    setEName(prof.name);
    setECrp(prof.crp);
    setEBio(prof.bio);
    setEPrice(toNumericValue(prof.price_per_session, 140));
    setELocation(prof.location);
    setEWhatsapp(prof.contact_whatsapp ?? '');
    setEColor(prof.accent_color ?? '#a75a35');
    setESpecialties(prof.specialties);
    setEServices(prof.services);
    setStep(1);
    setSelected(prof);
    setView('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await professionalsApi.updateMe({
        name: eName, crp: eCrp, bio: eBio,
        price_per_session: ePrice, location: eLocation,
        contact_whatsapp: eWhatsapp, accent_color: eColor,
        specialties: eSpecialties, services: eServices,
      });
      load();
      setView('list');
    } catch { setError('Erro ao salvar perfil.'); }
    finally { setSaving(false); }
  };

  // ── LIST ──────────────────────────────────────────────────────────────────────
  if (view === 'list') return (
    <PageWrapper id="directory-list-view">
      <div className="space-y-5 sm:space-y-6 animate-fadeIn">

        <ContentCard padding="md" id="directory-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-brand-clay/10 rounded-xl shrink-0">
                <Users className="w-5 h-5 text-brand-clay" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-brand-clay uppercase tracking-widest">Comunidade</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-clay animate-pulse" />
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">Diretório de Profissionais</h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">Encontre psicólogos credenciados da nossa rede para indicações e parcerias profissionais.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={load} className="p-2 text-slate-400 hover:text-brand-clay rounded-lg transition">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {isPro && (
                <button onClick={() => { const own = professionals.find(p => p.user_id === user?.id); if (own) openEdit(own); else setView('edit'); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-brand-clay hover:bg-brand-clay-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition">
                  <Edit3 className="w-4 h-4" />Meu Perfil
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-brand-sand/60">
            <div className="text-center">
              <p className="text-2xl font-black text-brand-navy">{professionals.length}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Profissionais</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-brand-moss">{topRatedCount}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Top Avaliados</p>
            </div>
          </div>
        </ContentCard>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
            <button onClick={load} className="ml-auto text-xs font-bold underline">Tentar novamente</button>
          </div>
        )}

        {/* Filters */}
        <div id="directory-filters" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input id="directory-search" type="text" placeholder="Buscar por nome ou especialidade..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full text-xs text-brand-navy bg-white border border-brand-sand pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-clay transition" />
          </div>
          <select id="directory-specialty" value={specialty} onChange={e => setSpecialty(e.target.value)}
            className="sm:w-52 text-xs text-brand-navy bg-white border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-clay transition">
            <option value="all">Todas as especialidades</option>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />Carregando diretório...
          </div>
        ) : professionals.length === 0 ? (
          <ContentCard padding="lg">
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-400">Nenhum profissional encontrado.</p>
            </div>
          </ContentCard>
        ) : (
          <div id="directory-grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {professionals.map(prof => (
              <div key={prof.id} id={`prof-card-${prof.id}`}
                className="bg-white border border-brand-sand/60 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">

                <div className="h-1.5 w-full" style={{ background: `linear-gradient(to right, ${prof.accent_color ?? '#a75a35'}, ${prof.accent_color ?? '#a75a35'}88)` }} />

                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <img src={prof.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(prof.name)}&size=80`}
                      alt={prof.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-sand shadow-sm shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-sm font-bold text-brand-navy truncate group-hover:text-brand-clay transition">{prof.name}</h3>
                        {isOwn(prof) && <span className="text-[9px] bg-brand-moss/10 text-brand-moss px-1.5 py-0.5 rounded font-bold shrink-0">Você</span>}
                      </div>
                      <p className="text-[10px] font-mono text-slate-400">{prof.crp}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                        <span className="text-xs font-bold text-slate-700">{toNumericValue(prof.rating).toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400">({toNumericValue(prof.reviews_count)} av.)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {prof.specialties.slice(0, 3).map(s => (
                      <span key={s} className="text-[10px] font-semibold bg-brand-sand/60 text-brand-clay-dark px-2 py-0.5 rounded-full border border-brand-sand">{s}</span>
                    ))}
                    {prof.specialties.length > 3 && <span className="text-[10px] text-slate-400">+{prof.specialties.length - 3}</span>}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-4">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{prof.location}</span>
                    <span className="flex items-center gap-1 font-bold text-brand-navy"><Coins className="w-3 h-3 text-brand-clay" />R$ {formatCurrency(prof.price_per_session)}/h</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-brand-sand/50">
                    <button id={`btn-profile-${prof.id}`}
                      onClick={() => { setSelected(prof); setView('detail'); setBooked(false); setTimeSlot(''); setBookMsg(''); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-clay hover:bg-brand-clay-dark text-white text-xs font-bold rounded-xl transition">
                      <ChevronRight className="w-3.5 h-3.5" />Ver Perfil
                    </button>
                    <button id={`btn-site-${prof.id}`}
                      onClick={() => { setSelected(prof); setView('public-site'); }}
                      className="p-2 bg-slate-50 hover:bg-brand-sand/50 border border-brand-sand text-slate-500 hover:text-brand-navy rounded-xl transition">
                      <Globe className="w-4 h-4" />
                    </button>
                    {isOwn(prof) && (
                      <button id={`btn-edit-${prof.id}`} onClick={() => openEdit(prof)}
                        className="p-2 bg-brand-moss/10 hover:bg-brand-moss/20 border border-brand-moss/20 text-brand-moss rounded-xl transition">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );

  // ── DETAIL ────────────────────────────────────────────────────────────────────
  if (view === 'detail' && selected) return (
    <PageWrapper id={`directory-detail-${selected.id}`}>
      <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn">
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-clay bg-white border border-brand-sand px-4 py-2 rounded-xl transition">
          <ArrowLeft className="w-4 h-4" />Voltar ao diretório
        </button>

        <ContentCard padding="lg">
          {/* Hero */}
          <div className="flex flex-col sm:flex-row gap-5 mb-6 pb-6 border-b border-brand-sand/60">
            <img src={selected.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.name)}&size=160`}
              alt={selected.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-brand-sand shadow-md shrink-0" />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-navy">{selected.name}</h2>
                <button onClick={() => setView('public-site')} className="flex items-center gap-1.5 text-xs text-brand-moss hover:text-brand-moss-dark font-bold shrink-0">
                  <Globe className="w-4 h-4" />Site
                </button>
              </div>
              <p className="text-xs font-mono text-slate-400 mb-2">{selected.crp}</p>
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(toNumericValue(selected.rating)) ? 'fill-amber-400 stroke-amber-400' : 'stroke-slate-200'}`} />
                ))}
                <span className="text-sm font-bold text-slate-700 ml-1">{toNumericValue(selected.rating).toFixed(1)}</span>
                <span className="text-xs text-slate-400">({selected.reviews_count} avaliações)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selected.specialties.map(s => (
                  <span key={s} className="text-[10px] font-semibold bg-brand-sand/60 text-brand-clay-dark px-2.5 py-1 rounded-full border border-brand-sand">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sobre</p>
              <p className="text-sm text-slate-600 leading-relaxed">{selected.bio}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-brand-sand/30 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Localização</p>
                <p className="text-xs font-bold text-brand-navy flex items-center gap-1"><MapPin className="w-3 h-3 text-brand-clay" />{selected.location}</p>
              </div>
              <div className="bg-brand-sand/30 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Sessão</p>
                <p className="text-xs font-bold text-brand-navy flex items-center gap-1"><Coins className="w-3 h-3 text-brand-clay" />R$ {formatCurrency(selected.price_per_session)}/h</p>
              </div>
            </div>
          </div>

          {/* Services */}
          {selected.services.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Serviços</p>
              <div className="space-y-1.5">
                {selected.services.map(s => (
                  <div key={s} className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="w-3.5 h-3.5 text-brand-moss shrink-0" />{s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule */}
          {selected.schedule.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Agenda Disponível</p>
              <div className="flex flex-wrap gap-2">
                {selected.schedule.map(slot => (
                  <button key={`${slot.day}-${slot.hours}`}
                    onClick={() => setTimeSlot(`${slot.day} ${slot.hours}`)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition ${
                      timeSlot === `${slot.day} ${slot.hours}` ? 'bg-brand-clay text-white border-transparent' : 'bg-white text-slate-600 border-brand-sand hover:border-brand-clay'
                    }`}>
                    {slot.day} {slot.hours}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Booking */}
          {booked ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-fadeIn">
              <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-800">Sessão solicitada com sucesso!</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">Um psicólogo irá confirmar via WhatsApp em breve.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-4 border-t border-brand-sand/50">
              <textarea rows={3} placeholder="Mensagem inicial (opcional)..." value={bookMsg} onChange={e => setBookMsg(e.target.value)}
                className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition resize-none" />
              <div className="flex flex-col sm:flex-row gap-2">
                {selected.contact_whatsapp && (
                  <a href={`https://wa.me/${selected.contact_whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex-1">
                    <Phone className="w-4 h-4" />WhatsApp
                  </a>
                )}
                <button onClick={() => { if (!timeSlot) return; setBooked(true); }}
                  disabled={!timeSlot}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-clay hover:bg-brand-clay-dark disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex-1">
                  <Calendar className="w-4 h-4" />Agendar {timeSlot ? `(${timeSlot})` : 'Sessão'}
                </button>
              </div>
            </div>
          )}
        </ContentCard>
      </div>
    </PageWrapper>
  );

  // ── PUBLIC SITE ───────────────────────────────────────────────────────────────
  if (view === 'public-site' && selected) {
    const accentColor = selected.accent_color ?? '#a75a35';
    return (
      <PageWrapper id={`public-site-${selected.id}`}>
        <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-clay bg-white border border-brand-sand px-4 py-2 rounded-xl transition">
            <ArrowLeft className="w-4 h-4" />Voltar
          </button>

          {/* Site hero */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-brand-sand shadow-xl">
            <div className="h-32 sm:h-40" style={{ background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}15)` }}>
              <div className="absolute inset-0 flex items-end p-5">
                <img src={selected.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.name)}&size=120`}
                  alt={selected.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" />
              </div>
            </div>
            <div className="bg-white px-6 pt-4 pb-6 space-y-3">
              <div>
                <h2 className="text-xl font-serif font-bold text-brand-navy">{selected.name}</h2>
                <p className="text-xs text-slate-400 font-mono">{selected.crp}</p>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(toNumericValue(selected.rating)) ? 'fill-amber-400 stroke-amber-400' : 'stroke-slate-200'}`} />
                ))}
                <span className="text-sm font-bold ml-1">{toNumericValue(selected.rating).toFixed(1)}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{selected.bio}</p>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-brand-sand/50">
                {selected.specialties.map(s => (
                  <span key={s} style={{ background: `${accentColor}20`, color: accentColor, borderColor: `${accentColor}40` }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full border">{s}</span>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                {selected.contact_whatsapp && (
                  <a href={`https://wa.me/${selected.contact_whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white text-xs font-bold rounded-xl transition"
                    style={{ background: accentColor }}>
                    <Phone className="w-4 h-4" />Contatar
                  </a>
                )}
                <button onClick={() => setView('detail')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-brand-sand text-slate-700 hover:bg-brand-sand/30 text-xs font-bold rounded-xl transition">
                  <Calendar className="w-4 h-4" />Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── EDIT PROFILE ──────────────────────────────────────────────────────────────
  return (
    <PageWrapper id="profile-edit-view">
      <div className="max-w-2xl mx-auto space-y-5 animate-scaleUp">
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-clay bg-white border border-brand-sand px-4 py-2 rounded-xl transition">
          <ArrowLeft className="w-4 h-4" />Cancelar
        </button>

        {/* Steps */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(n => (
            <React.Fragment key={n}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition ${step >= n ? 'bg-brand-clay text-white' : 'bg-slate-100 text-slate-400'}`}>
                {step > n ? <Check className="w-4 h-4" /> : n}
              </div>
              {n < 3 && <div className={`flex-1 h-0.5 rounded-full ${step > n ? 'bg-brand-clay' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <ContentCard padding="lg">
          <form onSubmit={handleSave} className="space-y-5">
            {step === 1 && (
              <>
                <SectionTitle title="Informações Básicas" icon={Stethoscope} divider />
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
                      <input value={eName} onChange={e => setEName(e.target.value)} required
                        className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CRP</label>
                      <input value={eCrp} onChange={e => setECrp(e.target.value)} placeholder="Ex: CRP 06/123456"
                        className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bio / Apresentação</label>
                    <textarea value={eBio} onChange={e => setEBio(e.target.value)} rows={4}
                      className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Especialidades</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SPECIALTIES.map(s => (
                        <button key={s} type="button"
                          onClick={() => setESpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition ${eSpecialties.includes(s) ? 'bg-brand-clay text-white border-transparent' : 'bg-white text-slate-600 border-brand-sand hover:border-brand-clay'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <SectionTitle title="Serviços & Valores" icon={Coins} divider />
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valor/Sessão (R$)</label>
                      <input type="number" value={ePrice} onChange={e => setEPrice(Number(e.target.value))} min={0}
                        className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Localização</label>
                      <input value={eLocation} onChange={e => setELocation(e.target.value)} placeholder="Ex: remoto / Tatuí - SP"
                        className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WhatsApp</label>
                      <input value={eWhatsapp} onChange={e => setEWhatsapp(e.target.value)} placeholder="5511999990000"
                        className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Serviços Oferecidos</label>
                    <div className="space-y-2">
                      {eServices.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 bg-brand-cream border border-brand-sand rounded-xl px-3 py-2">
                          <Check className="w-3.5 h-3.5 text-brand-moss shrink-0" />
                          <span className="text-xs text-slate-600 flex-1">{s}</span>
                          <button type="button" onClick={() => setEServices(prev => prev.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input value={newService} onChange={e => setNewService(e.target.value)} placeholder="Adicionar serviço..."
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newService.trim()) { setEServices(p => [...p, newService.trim()]); setNewService(''); } } }}
                          className="flex-1 text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-clay transition" />
                        <button type="button" onClick={() => { if (newService.trim()) { setEServices(p => [...p, newService.trim()]); setNewService(''); } }}
                          className="px-3 py-2 bg-brand-clay/10 text-brand-clay border border-brand-clay/20 rounded-xl text-xs font-bold hover:bg-brand-clay/20 transition">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <SectionTitle title="Aparência do Site" icon={Globe} divider />
                <div className="space-y-4 mt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cor de Destaque</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={eColor} onChange={e => setEColor(e.target.value)}
                        className="w-12 h-10 rounded-xl border border-brand-sand cursor-pointer" />
                      <span className="text-xs font-mono text-slate-600">{eColor}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['#a75a35', '#5a6242', '#182638', '#6d28d9', '#0891b2', '#dc2626'].map(c => (
                        <button key={c} type="button" onClick={() => setEColor(c)}
                          className={`w-8 h-8 rounded-lg border-2 transition ${eColor === c ? 'border-brand-navy scale-110' : 'border-transparent'}`}
                          style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 p-4 rounded-xl border" style={{ borderColor: `${eColor}40`, background: `${eColor}08` }}>
                    <p className="text-xs font-bold mb-1" style={{ color: eColor }}>Preview da cor selecionada</p>
                    <p className="text-[11px] text-slate-500">Esta cor aparece no seu site público como destaque de especialidades e botões de contato.</p>
                  </div>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-brand-sand/50">
              {step > 1 ? (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="px-4 py-2.5 border border-brand-sand hover:bg-brand-sand/40 rounded-xl text-xs font-bold text-brand-navy transition">
                  Voltar
                </button>
              ) : <div />}
              {step < 3 ? (
                <button type="button" onClick={() => setStep(s => s + 1)}
                  className="px-5 py-2.5 bg-brand-clay hover:bg-brand-clay-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition">
                  Continuar →
                </button>
              ) : (
                <button type="submit" disabled={saving}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-moss hover:bg-brand-moss-dark disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition">
                  {saving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Salvando...</> : <><Check className="w-3.5 h-3.5" />Salvar Perfil</>}
                </button>
              )}
            </div>
          </form>
        </ContentCard>
      </div>
    </PageWrapper>
  );
}
