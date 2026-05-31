import React, { useState, useEffect } from 'react';
import { RefreshCw, XCircle } from 'lucide-react';
import { professionalsApi, type Professional } from '../lib/api';

// Importa o componente de site público do DirectoryView
// Para evitar duplicar código, renderizamos a mesma UI do ProfessionalPublicSite
// mas sem o botão "Voltar ao diretório" (é uma página pública independente)

interface Props {
  userId: string;
}

export default function ProfessionalPublicPage({ userId }: Props) {
  const [prof, setProf]     = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    professionalsApi.list()
      .then(res => {
        const found = res.data.find(p => p.user_id === userId || p.id === userId);
        if (found) setProf(found);
        else setError('Profissional não encontrado.');
      })
      .catch(() => setError('Erro ao carregar perfil.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5ede3' }}>
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl mx-auto"
            style={{ background: 'linear-gradient(135deg, #3d4a2e, #a75a35)' }}>
            <span className="text-2xl text-white font-serif font-black italic">♩Ψ</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm justify-center">
            <RefreshCw size={13} className="animate-spin" />Carregando perfil...
          </div>
        </div>
      </div>
    );
  }

  if (error || !prof) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f5ede3' }}>
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 text-center">
          <XCircle size={36} className="text-red-400 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-brand-navy mb-2">Perfil não encontrado</h2>
          <p className="text-sm text-slate-500">{error || 'Este link pode estar incorreto.'}</p>
        </div>
      </div>
    );
  }

  // Reusa o mesmo componente visual do DirectoryView mas sem botão "Voltar ao diretório"
  // O componente ProfessionalPublicSite está definido dentro do DirectoryView como função interna,
  // então replicamos o visual aqui de forma standalone.
  // onBack e onSchedule abrem o site da plataforma
  return <StandaloneProfSite prof={prof} />;
}

// ─── Site standalone (sem dependência do DirectoryView) ───────────────────────

function StandaloneProfSite({ prof }: { prof: Professional }) {
  const accent   = prof.accent_color ?? '#a75a35';
  const initials = prof.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const toNum = (v: unknown) => { const n = Number(v); return isFinite(n) ? n : 0; };
  const fmtCurr = (v: unknown) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0 }).format(toNum(v));

  const hasSocial = !!(prof.contact_whatsapp || prof.instagram || prof.linkedin ||
    prof.facebook || prof.tiktok || prof.twitter || prof.website || (prof.extra_links ?? []).length > 0);

  const WA = (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );

  return (
    <div className="min-h-screen" style={{ background: '#f5ede3' }}>

      {/* Navbar simples */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[#e8d8c8] px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, #3d4a2e, ${accent})` }}>
            <span className="text-[10px] text-white font-black italic">♩Ψ</span>
          </div>
          <div>
            <p className="font-serif text-sm font-black text-[#2d3a1e] leading-none">Espalhe</p>
            <p className="font-script text-base text-[#a75a35] leading-none -mt-0.5">Melodias</p>
          </div>
        </div>
        <a href="/" className="text-xs font-bold text-slate-500 hover:text-[#a75a35] transition">
          Conhecer a rede →
        </a>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-12">

        {/* Hero */}
        <div className="relative mb-6">
          <div className="h-52 rounded-b-[2.5rem] overflow-hidden relative"
            style={{ background: `linear-gradient(135deg, #2d3a1e 0%, ${accent} 50%, #4a5530 100%)` }}>
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
              <span className="absolute top-3 left-5 text-5xl font-serif text-white/10">♩</span>
              <span className="absolute top-6 right-8 text-4xl font-serif text-white/10">♫</span>
              <span className="absolute bottom-8 left-1/3 text-6xl font-serif text-white/8">♪</span>
              <span className="absolute bottom-4 right-6 text-3xl font-serif text-white/10">♬</span>
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full border border-white/10" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full border border-white/10" />
            </div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                <span className="text-[10px] text-white font-black italic">♩Ψ</span>
              </div>
              <div>
                <p className="font-serif text-xs font-black text-white/90 leading-none">Espalhe</p>
                <p className="font-script text-sm text-white leading-none -mt-0.5">Melodias</p>
              </div>
            </div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-14">
            {prof.avatar ? (
              <img src={prof.avatar} alt={prof.name} className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-2xl" />
            ) : (
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-3xl font-black"
                style={{ background: `linear-gradient(135deg, ${accent}40, ${accent}80)`, color: accent }}>
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
              <svg className="w-4 h-4 text-[#5a6242]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Nome */}
        <div className="text-center pt-16 pb-5 px-4">
          <h1 className="font-serif text-2xl font-black text-[#2d3a1e] leading-tight">{prof.name}</h1>
          {prof.crp && <p className="text-xs font-mono font-semibold mt-1 tracking-wider" style={{ color: accent }}>{prof.crp}</p>}
          {toNum(prof.rating) > 0 && (
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(toNum(prof.rating)) ? 'fill-amber-400' : 'fill-slate-200'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
              <span className="text-xs font-bold text-slate-500 ml-1">{toNum(prof.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Especialidades */}
        {prof.specialties?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 px-4 mb-5">
            {prof.specialties.map(s => (
              <span key={s} className="text-[11px] font-bold px-3 py-1.5 rounded-full border-2"
                style={{ background: `${accent}12`, color: accent, borderColor: `${accent}30` }}>{s}</span>
            ))}
          </div>
        )}

        {/* Bio */}
        {prof.bio && (
          <div className="bg-white/70 backdrop-blur rounded-2xl px-5 py-4 mb-4 mx-1 border border-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-0.5 h-4 rounded-full" style={{ background: accent }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>Sobre</span>
            </div>
            <p className="text-sm text-[#3d3d3d] leading-relaxed">{prof.bio}</p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-3 px-1 mb-4">
          {prof.contact_whatsapp && (
            <a href={`https://wa.me/${prof.contact_whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white text-sm font-black rounded-2xl transition-all active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', boxShadow: '0 4px 15px rgba(37,211,102,0.3)' }}>
              {WA}Entrar em contato
            </a>
          )}
          <a href={`/diretorio`}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white text-sm font-black rounded-2xl transition-all active:scale-95 shadow-md border-2"
            style={{ borderColor: `${accent}50`, color: accent }}>
            Ver todos os membros
          </a>
        </div>

        {/* Detalhes */}
        {(prof.location || toNum(prof.price_per_session) > 0) && (
          <div className="bg-white/70 backdrop-blur rounded-2xl overflow-hidden mb-4 mx-1 border border-white shadow-sm">
            {prof.location && (
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f0e4d4]">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}15` }}>
                  <svg className="w-4 h-4" style={{ color: accent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <span className="text-sm text-[#3d3d3d] font-medium">{prof.location}</span>
              </div>
            )}
            {toNum(prof.price_per_session) > 0 && (
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}15` }}>
                  <svg className="w-4 h-4" style={{ color: accent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <span className="text-sm text-[#3d3d3d] font-medium">R$ {fmtCurr(prof.price_per_session)} por sessão</span>
              </div>
            )}
          </div>
        )}

        {/* Serviços */}
        {prof.services?.length > 0 && (
          <div className="bg-white/70 backdrop-blur rounded-2xl px-5 py-4 mb-4 mx-1 border border-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-0.5 h-4 rounded-full" style={{ background: '#5a6242' }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#5a6242]">Serviços</span>
            </div>
            <div className="space-y-2.5">
              {prof.services.map(s => (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${accent}15` }}>
                    <svg className="w-3 h-3" style={{ color: accent }} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-sm text-[#3d3d3d]">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Redes sociais */}
        {hasSocial && (
          <div className="bg-white/70 backdrop-blur rounded-2xl px-5 py-4 mb-4 mx-1 border border-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-0.5 h-4 rounded-full" style={{ background: '#182638' }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#182638]">Redes & Links</span>
            </div>
            <SocialChips prof={prof} />
          </div>
        )}

        {/* Badge Melodias */}
        <div className="mx-1 mb-4 rounded-2xl overflow-hidden shadow-lg border border-white">
          <div className="px-5 py-4 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #2d3a1e 0%, #3d4a2e 50%, #182638 100%)' }}>
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex flex-col items-center justify-center shrink-0 border border-white/20">
              <span className="text-lg font-serif font-black italic text-white leading-none">♩Ψ</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-white font-black text-sm leading-tight">Rede Espalhe Melodias</p>
                <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <p className="text-white/60 text-[11px] font-medium">Profissional verificado</p>
            </div>
          </div>
          <div className="px-5 py-3.5" style={{ background: '#f9f3ec' }}>
            <p className="text-[11px] text-[#6b5a4a] leading-relaxed">
              Este profissional é membro verificado da comunidade <strong>Espalhe Melodias</strong> — uma rede comprometida com saúde mental e conexões humanas.
            </p>
          </div>
        </div>

        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 text-[10px] text-[#9a8a7a] font-semibold">
            <span className="font-serif italic text-sm">♩Ψ</span>
            Espalhe Melodias
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialChips({ prof }: { prof: Professional }) {
  const links: Array<{ type: string; url: string; label: string }> = [];
  if (prof.contact_whatsapp) links.push({ type: 'whatsapp', url: `https://wa.me/${prof.contact_whatsapp}`, label: 'WhatsApp' });
  if (prof.instagram) links.push({ type: 'instagram', url: prof.instagram.startsWith('http') ? prof.instagram : `https://instagram.com/${prof.instagram.replace('@','')}`, label: 'Instagram' });
  if (prof.linkedin)  links.push({ type: 'linkedin',  url: prof.linkedin.startsWith('http') ? prof.linkedin : `https://linkedin.com/in/${prof.linkedin}`, label: 'LinkedIn' });
  if (prof.facebook)  links.push({ type: 'facebook',  url: prof.facebook.startsWith('http') ? prof.facebook : `https://facebook.com/${prof.facebook}`, label: 'Facebook' });
  if (prof.tiktok)    links.push({ type: 'tiktok',    url: prof.tiktok.startsWith('http') ? prof.tiktok : `https://tiktok.com/@${prof.tiktok.replace('@','')}`, label: 'TikTok' });
  if (prof.twitter)   links.push({ type: 'twitter',   url: prof.twitter.startsWith('http') ? prof.twitter : `https://twitter.com/${prof.twitter.replace('@','')}`, label: 'Twitter' });
  if (prof.website)   links.push({ type: 'website',   url: prof.website, label: 'Site' });
  (prof.extra_links ?? []).forEach(l => links.push({ type: 'link', url: l.url, label: l.label }));

  const colors: Record<string, string> = {
    whatsapp:  'bg-emerald-500 text-white',
    instagram: 'bg-pink-500 text-white',
    linkedin:  'bg-blue-600 text-white',
    facebook:  'bg-blue-700 text-white',
    tiktok:    'bg-black text-white',
    twitter:   'bg-sky-500 text-white',
    website:   'bg-[#5a6242] text-white',
    link:      'bg-slate-600 text-white',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l, i) => (
        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition hover:opacity-90 ${colors[l.type] ?? colors.link}`}>
          {l.label}
        </a>
      ))}
    </div>
  );
}
