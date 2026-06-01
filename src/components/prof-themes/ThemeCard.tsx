// Tema 3 — Card: sidebar fixa à esquerda, conteúdo à direita, estilo "perfil profissional"
import React, { useState } from 'react';
import { MapPin, MessageCircle, ShieldCheck, Star, Globe, Instagram, Linkedin, Phone, Check, Calendar, Languages } from 'lucide-react';
import type { Professional } from '../../lib/api';

function onlyDigits(v = '') { return v.replace(/\D/g, ''); }
function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function toNum(v: unknown) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

interface Props { professional: Professional }

export default function ThemeCard({ professional }: Props) {
  const accent = professional.accent_color || '#a75a35';
  const initials = getInitials(professional.name);
  const rating = toNum(professional.rating);
  const reviews = toNum(professional.reviews_count);
  const whatsappUrl = professional.contact_whatsapp
    ? `https://wa.me/${onlyDigits(professional.contact_whatsapp)}?text=${encodeURIComponent(`Olá, ${professional.name.split(' ')[0]}! Vim através da Rede Espalhe Melodias e gostaria de saber mais sobre seu atendimento.`)}` : '';

  return (
    <div className="min-h-screen" style={{ background: '#f4f4f0', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* Header slim */}
      <div className="w-full py-3 px-6 flex items-center justify-between" style={{ background: '#fff', borderBottom: '1px solid #e8e8e4' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] font-black"
            style={{ background: accent }}>♩</div>
          <span className="text-xs font-black text-slate-600">Espalhe Melodias</span>
        </div>
        <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
          <ShieldCheck size={11} style={{ color: accent }} /> Perfil verificado
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-6">

        {/* Sidebar — card do profissional */}
        <aside className="lg:w-72 shrink-0">
          {/* Card principal */}
          <div className="rounded-3xl overflow-hidden shadow-xl bg-white mb-4">
            {/* Capa */}
            <div className="h-28 relative" style={{ background: `linear-gradient(135deg, ${accent}dd, ${accent}88)` }}>
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, white 0%, transparent 60%)' }} />
            </div>
            {/* Avatar */}
            <div className="flex justify-center -mt-12 mb-3">
              {professional.avatar ? (
                <img src={professional.avatar} alt={professional.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl" />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-2xl font-black text-white"
                  style={{ background: accent }}>{initials}</div>
              )}
            </div>
            <div className="px-5 pb-5 text-center">
              <h1 className="text-lg font-black text-slate-900 leading-tight mb-1">{professional.name}</h1>
              {professional.crp && (
                <p className="font-mono text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">{professional.crp}</p>
              )}
              {rating > 0 && (
                <div className="flex items-center justify-center gap-1 mb-3">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={12} className={i <= Math.round(rating) ? 'fill-amber-400 stroke-amber-400' : 'stroke-slate-200'} />
                  ))}
                  <span className="text-xs font-bold text-amber-600 ml-1">{rating.toFixed(1)}</span>
                  {reviews > 0 && <span className="text-[10px] text-slate-400">({reviews})</span>}
                </div>
              )}
              {professional.location && (
                <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-4">
                  <MapPin size={12} style={{ color: accent }} />{professional.location}
                </div>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black text-white shadow-lg transition active:scale-95"
                  style={{ background: '#25d366', boxShadow: '0 6px 20px rgba(37,211,102,0.3)' }}>
                  <MessageCircle size={17} /> Enviar mensagem
                </a>
              )}
            </div>
          </div>

          {/* Card de info */}
          <div className="rounded-2xl bg-white shadow-sm p-4 mb-4">
            {professional.languages?.length > 0 && (
              <div className="mb-3 pb-3 border-b border-slate-100">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                  <Languages size={10} /> Idiomas
                </p>
                <div className="flex flex-wrap gap-1">
                  {professional.languages.map(l => (
                    <span key={l} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{l}</span>
                  ))}
                </div>
              </div>
            )}
            {professional.specialties?.slice(0,6).map(s => (
              <div key={s} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
                <span className="text-xs text-slate-600 font-medium">{s}</span>
              </div>
            ))}
            {(professional.specialties?.length ?? 0) > 6 && (
              <p className="text-[10px] text-slate-400 mt-1.5">+{professional.specialties.length - 6} mais</p>
            )}
          </div>

          {/* Redes sociais */}
          {(professional.instagram || professional.linkedin || professional.website) && (
            <div className="rounded-2xl bg-white shadow-sm p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Redes</p>
              <div className="space-y-2">
                {professional.instagram && (
                  <a href={professional.instagram.startsWith('http') ? professional.instagram : `https://instagram.com/${professional.instagram.replace('@','')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
                    <Instagram size={14} style={{ color: '#e1306c' }} /> {professional.instagram}
                  </a>
                )}
                {professional.website && (
                  <a href={professional.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
                    <Globe size={14} style={{ color: accent }} /> Website
                  </a>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 space-y-4">

          {/* Bio */}
          {professional.bio && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: accent }}>Sobre mim</p>
              <p className="text-sm text-slate-600 leading-relaxed">{professional.bio}</p>
            </div>
          )}

          {/* Serviços */}
          {professional.services?.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: accent }}>Serviços</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {professional.services.map(s => (
                  <div key={s} className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: `${accent}08`, border: `1px solid ${accent}18` }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: accent }}>
                      <Check size={11} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agenda */}
          {professional.schedule?.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-1.5" style={{ color: accent }}>
                <Calendar size={11} /> Horários disponíveis
              </p>
              <div className="flex flex-wrap gap-2">
                {professional.schedule.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: `${accent}10`, color: accent, border: `1.5px solid ${accent}25` }}>
                    <Calendar size={11} /> {slot.day} {slot.hours}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA final */}
          {whatsappUrl && (
            <div className="rounded-3xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${accent}ee, ${accent}bb)` }}>
              <p className="text-white font-black text-lg mb-1">Pronto para começar?</p>
              <p className="text-white/70 text-sm mb-4">Entre em contato e marque sua primeira sessão.</p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-2xl text-sm font-black shadow-lg transition hover:-translate-y-0.5"
                style={{ color: accent }}>
                <Phone size={16} /> Falar no WhatsApp
              </a>
            </div>
          )}
        </main>
      </div>

      {/* Badge Melodias */}
      <div className="text-center py-6 text-[11px] text-slate-400">
        Membro verificado da <span style={{ color: accent }} className="font-bold">Rede Espalhe Melodias</span>
      </div>
    </div>
  );
}
