import React, { useState, useEffect, useRef } from 'react';
import { XCircle } from 'lucide-react';
import { professionalsApi, type Professional, type ProfTheme } from '../lib/api';

interface Props {
  userId: string;
}

// ─── Temas ────────────────────────────────────────────────────────────────────

export interface ThemePalette {
  name: string;
  label: string;
  bannerFrom: string;
  bannerMid: string;
  bannerTo: string;
  accent: string;
  accentMuted: string;
  accentLight: string;
  textHeading: string;
  textBody: string;
  pageBg: string;
  navBg: string;
  navBorder: string;
  cardBg: string;
  cardBorder: string;
}

export const THEMES: Record<ProfTheme, ThemePalette> = {
  forest: {
    name: 'forest', label: 'Forest',
    bannerFrom: '#1a2412', bannerMid: '#2d3a1e', bannerTo: '#5a6242',
    accent: '#5a6242', accentMuted: '#808b5e', accentLight: '#e8eddc',
    textHeading: '#1a2412', textBody: '#3d3d30',
    pageBg: 'linear-gradient(160deg, #fbf8f3 0%, #f5ece1 60%, #eee8d8 100%)',
    navBg: 'rgba(251,248,243,0.92)', navBorder: 'rgba(90,98,66,0.12)',
    cardBg: 'rgba(255,255,255,0.72)', cardBorder: 'rgba(255,255,255,0.85)',
  },
  ocean: {
    name: 'ocean', label: 'Ocean',
    bannerFrom: '#0a1628', bannerMid: '#0e3460', bannerTo: '#0891b2',
    accent: '#0891b2', accentMuted: '#22b5d4', accentLight: '#e0f5fa',
    textHeading: '#0a1628', textBody: '#1e3045',
    pageBg: 'linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 55%, #cce8f4 100%)',
    navBg: 'rgba(240,249,255,0.92)', navBorder: 'rgba(8,145,178,0.12)',
    cardBg: 'rgba(255,255,255,0.72)', cardBorder: 'rgba(255,255,255,0.85)',
  },
  rose: {
    name: 'rose', label: 'Rose',
    bannerFrom: '#3b0a18', bannerMid: '#7c1d3a', bannerTo: '#be4a6d',
    accent: '#be4a6d', accentMuted: '#d4748f', accentLight: '#fce8ef',
    textHeading: '#3b0a18', textBody: '#4a2030',
    pageBg: 'linear-gradient(160deg, #fff5f8 0%, #ffe4ec 55%, #ffd6e3 100%)',
    navBg: 'rgba(255,245,248,0.92)', navBorder: 'rgba(190,74,109,0.12)',
    cardBg: 'rgba(255,255,255,0.72)', cardBorder: 'rgba(255,255,255,0.85)',
  },
  gold: {
    name: 'gold', label: 'Gold',
    bannerFrom: '#1c1000', bannerMid: '#5a3800', bannerTo: '#c8860a',
    accent: '#c8860a', accentMuted: '#e0a83a', accentLight: '#fef3d0',
    textHeading: '#1c1000', textBody: '#3d2800',
    pageBg: 'linear-gradient(160deg, #fffbf0 0%, #fff3d0 55%, #ffedb0 100%)',
    navBg: 'rgba(255,251,240,0.92)', navBorder: 'rgba(200,134,10,0.12)',
    cardBg: 'rgba(255,255,255,0.72)', cardBorder: 'rgba(255,255,255,0.85)',
  },
};

export function getTheme(prof: Professional): ThemePalette {
  if (prof.theme && THEMES[prof.theme]) return THEMES[prof.theme];
  const t = { ...THEMES.forest };
  if (prof.accent_color) {
    t.accent      = prof.accent_color;
    t.accentMuted = prof.accent_color + 'cc';
    t.accentLight = prof.accent_color + '18';
  }
  return t;
}

// ─── Página pública ───────────────────────────────────────────────────────────

export default function ProfessionalPublicPage({ userId }: Props) {
  const [prof, setProf]       = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

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
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1a2412 0%, #2d3a1e 50%, #3d2a1e 100%)' }}>
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-white/10 animate-ping" />
            <div className="w-20 h-20 rounded-full border-4 border-t-white/80 border-white/20 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-serif text-white/80 italic">♩</span>
            </div>
          </div>
          <p className="text-white/60 text-sm font-medium tracking-wide">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !prof) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, #1a2412 0%, #2d3a1e 100%)' }}>
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <XCircle size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-white mb-2">Perfil não encontrado</h2>
          <p className="text-sm text-white/60">{error || 'Este link pode estar incorreto.'}</p>
        </div>
      </div>
    );
  }

  return <StandaloneProfSite prof={prof} />;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNum   = (v: unknown) => { const n = Number(v); return isFinite(n) ? n : 0; };
const fmtCurr = (v: unknown) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0 }).format(toNum(v));

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function AnimCard({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity:    visible ? 1 : 0,
      transform:  visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.55s cubic-bezier(.4,0,.2,1) ${delay}ms, transform 0.55s cubic-bezier(.4,0,.2,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Ícones ───────────────────────────────────────────────────────────────────

const WaIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const socialIcons: Record<string, React.ReactNode> = {
  whatsapp: <WaIcon />,
  instagram: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  linkedin: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  facebook: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  tiktok: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/>
    </svg>
  ),
  twitter: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  website: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
  link: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  ),
};

const socialColors: Record<string, { bg: string; text: string; glow: string }> = {
  whatsapp:  { bg: 'linear-gradient(135deg,#25d366,#128c7e)', text: '#fff', glow: 'rgba(37,211,102,0.3)' },
  instagram: { bg: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', text: '#fff', glow: 'rgba(220,39,67,0.3)' },
  linkedin:  { bg: 'linear-gradient(135deg,#0a66c2,#0077b5)', text: '#fff', glow: 'rgba(10,102,194,0.3)' },
  facebook:  { bg: 'linear-gradient(135deg,#1877f2,#166fe5)', text: '#fff', glow: 'rgba(24,119,242,0.3)' },
  tiktok:    { bg: 'linear-gradient(135deg,#010101,#2d2d2d)', text: '#fff', glow: 'rgba(1,1,1,0.3)' },
  twitter:   { bg: 'linear-gradient(135deg,#1d9bf0,#0d8fd9)', text: '#fff', glow: 'rgba(29,155,240,0.3)' },
  website:   { bg: 'linear-gradient(135deg,#5a6242,#3f452e)', text: '#fff', glow: 'rgba(90,98,66,0.3)' },
  link:      { bg: 'linear-gradient(135deg,#64748b,#475569)', text: '#fff', glow: 'rgba(100,116,139,0.3)' },
};

// ─── Site standalone ──────────────────────────────────────────────────────────

function StandaloneProfSite({ prof }: { prof: Professional }) {
  const theme    = getTheme(prof);
  const initials = prof.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const [scrolled, setScrolled]       = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const hasSocial = !!(prof.contact_whatsapp || prof.instagram || prof.linkedin ||
    prof.facebook || prof.tiktok || prof.twitter || prof.website || (prof.extra_links ?? []).length > 0);

  const { accent, accentLight, bannerFrom, bannerMid, bannerTo, textHeading, cardBg, cardBorder } = theme;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: theme.pageBg }}>

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 transition-all duration-300"
        style={{
          background:     scrolled ? theme.navBg : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom:   scrolled ? `1px solid ${theme.navBorder}` : 'none',
          boxShadow:      scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: `linear-gradient(135deg, ${bannerFrom}, ${accent})` }}>
            <span className="text-xs text-white font-black italic font-serif">♩</span>
          </div>
          <div>
            <p className="font-serif text-sm font-black leading-none" style={{ color: textHeading }}>Espalhe</p>
            <p className="font-script text-base leading-none -mt-0.5" style={{ color: accent }}>Melodias</p>
          </div>
        </div>
        <a
          href="/diretorio"
          className="text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
        >
          Ver a rede →
        </a>
      </nav>

      {/* Hero */}
      <div className="relative">
        <div
          className="relative h-64 sm:h-72 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${bannerFrom} 0%, ${bannerMid} 40%, ${bannerTo} 100%)` }}
        >
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            {(['♩','♫','♪','♬','𝄞'] as const).map((note, i) => (
              <span key={i} className="absolute font-serif text-white select-none"
                style={{
                  fontSize: ['3rem','2.5rem','4rem','2rem','3.5rem'][i],
                  top:      ['8%','14%','38%',undefined,'10%'][i],
                  bottom:   [undefined,undefined,undefined,'8%',undefined][i],
                  left:     ['6%',undefined,'17%','48%',undefined][i],
                  right:    [undefined,'9%',undefined,undefined,'7%'][i],
                  opacity:  0.09,
                  animation: `profFloat${i % 3} ${[6,7,8,5,9][i]}s ease-in-out ${[0,1,2,0.5,1.5][i]}s infinite`,
                }}>
                {note}
              </span>
            ))}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/8"
              style={{ animation: 'profSpin 40s linear infinite' }} />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border border-white/6"
              style={{ animation: 'profSpin 60s linear reverse infinite' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
              style={{ background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)` }} />
          </div>

          <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2"
            style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(-14px)', transition: 'all 0.6s ease' }}>
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-xs text-white font-black italic font-serif">♩</span>
            </div>
            <div>
              <p className="font-serif text-sm font-black text-white/90 leading-none">Espalhe</p>
              <p className="font-script text-base text-white leading-none -mt-0.5">Melodias</p>
            </div>
          </div>
        </div>

        {/* Avatar flutuante */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-16"
          style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'scale(1)' : 'scale(0.8)', transition: 'all 0.7s cubic-bezier(.34,1.56,.64,1) 0.2s' }}>
          <div className="relative">
            <div className="absolute -inset-2 rounded-full animate-pulse"
              style={{ background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)` }} />
            {prof.avatar ? (
              <img src={prof.avatar} alt={prof.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl relative z-10"
                style={{ boxShadow: `0 8px 32px ${accent}40, 0 2px 8px rgba(0,0,0,0.2)` }} />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-4xl font-black relative z-10"
                style={{ background: `linear-gradient(135deg, ${accent}30, ${accent}70)`, color: accent,
                  boxShadow: `0 8px 32px ${accent}40, 0 2px 8px rgba(0,0,0,0.2)` }}>
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center z-20 border-2 border-white"
              style={{ boxShadow: `0 2px 12px ${accent}30` }}>
              <svg className="w-5 h-5" style={{ color: accent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-xl mx-auto px-4 pt-24 pb-16">

        {/* Nome */}
        <div className="text-center mb-6"
          style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 0.35s' }}>
          <h1 className="font-serif text-3xl font-black leading-tight" style={{ color: textHeading }}>{prof.name}</h1>
          {prof.crp && (
            <p className="text-xs font-mono font-bold mt-1.5 tracking-widest uppercase" style={{ color: `${accent}cc` }}>
              {prof.crp}
            </p>
          )}
          {toNum(prof.rating) > 0 && (
            <div className="flex items-center justify-center gap-1 mt-3">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className={`w-4 h-4 ${i <= Math.round(toNum(prof.rating)) ? 'fill-amber-400' : 'fill-slate-200'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="text-sm font-bold ml-1.5" style={{ color: accent }}>{toNum(prof.rating).toFixed(1)}</span>
              {toNum(prof.reviews_count) > 0 && (
                <span className="text-xs text-slate-400 ml-0.5">({toNum(prof.reviews_count)} avaliações)</span>
              )}
            </div>
          )}
        </div>

        {/* Especialidades */}
        {prof.specialties?.length > 0 && (
          <AnimCard delay={100} className="flex flex-wrap justify-center gap-2 mb-6">
            {prof.specialties.map(s => (
              <span key={s}
                className="text-xs font-bold px-3.5 py-1.5 rounded-full cursor-default hover:scale-105 transition-transform duration-200"
                style={{ background: accentLight, color: accent, border: `1.5px solid ${accent}35` }}>
                {s}
              </span>
            ))}
          </AnimCard>
        )}

        {/* CTAs */}
        <AnimCard delay={150} className="flex gap-3 mb-6">
          {prof.contact_whatsapp && (
            <a href={`https://wa.me/${prof.contact_whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2.5 py-4 text-white text-sm font-black rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-95 select-none"
              style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)', boxShadow: '0 4px 20px rgba(37,211,102,0.35)' }}>
              <WaIcon /> Entrar em contato
            </a>
          )}
          <a href="/diretorio"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-sm font-black rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-95 select-none shadow-md"
            style={{ border: `2px solid ${accent}35`, color: accent }}>
            Ver todos os membros
          </a>
        </AnimCard>

        {/* Localização e preço */}
        {(prof.location || toNum(prof.price_per_session) > 0) && (
          <AnimCard delay={200} className="mb-4">
            <div className="rounded-2xl overflow-hidden border shadow-md"
              style={{ background: cardBg, backdropFilter: 'blur(12px)', borderColor: cardBorder }}>
              {prof.location && (
                <div className="flex items-center gap-3.5 px-5 py-4 border-b" style={{ borderColor: `${accent}15` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}35)` }}>
                    <svg className="w-4 h-4" style={{ color: accent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Localização</p>
                    <p className="text-sm font-semibold" style={{ color: textHeading }}>{prof.location}</p>
                  </div>
                </div>
              )}
              {toNum(prof.price_per_session) > 0 && (
                <div className="flex items-center gap-3.5 px-5 py-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}35)` }}>
                    <svg className="w-4 h-4" style={{ color: accent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Valor da sessão</p>
                    <p className="text-sm">
                      <span className="text-base font-black" style={{ color: accent }}>R$ {fmtCurr(prof.price_per_session)}</span>
                      <span className="text-slate-400 text-xs ml-1">/ sessão</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </AnimCard>
        )}

        {/* Bio */}
        {prof.bio && (
          <AnimCard delay={250} className="mb-4">
            <div className="rounded-2xl px-5 py-5 border shadow-md"
              style={{ background: cardBg, backdropFilter: 'blur(12px)', borderColor: cardBorder }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${accent}, ${accent}60)` }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>Sobre</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: theme.textBody }}>{prof.bio}</p>
            </div>
          </AnimCard>
        )}

        {/* Serviços */}
        {prof.services?.length > 0 && (
          <AnimCard delay={300} className="mb-4">
            <div className="rounded-2xl px-5 py-5 border shadow-md"
              style={{ background: cardBg, backdropFilter: 'blur(12px)', borderColor: cardBorder }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${accent}, ${accent}60)` }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>Serviços</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {prof.services.map(s => (
                  <div key={s}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:scale-[1.02] transition-transform duration-200"
                    style={{ background: `${accent}08`, border: `1px solid ${accent}18` }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `linear-gradient(135deg, ${accent}40, ${accent}70)` }}>
                      <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: textHeading }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimCard>
        )}

        {/* Idiomas */}
        {prof.languages?.length > 0 && (
          <AnimCard delay={340} className="mb-4">
            <div className="rounded-2xl px-5 py-5 border shadow-md"
              style={{ background: cardBg, backdropFilter: 'blur(12px)', borderColor: cardBorder }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-400 to-blue-600/60" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Idiomas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {prof.languages.map(l => (
                  <span key={l} className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{l}</span>
                ))}
              </div>
            </div>
          </AnimCard>
        )}

        {/* Redes sociais */}
        {hasSocial && (
          <AnimCard delay={380} className="mb-4">
            <div className="rounded-2xl px-5 py-5 border shadow-md"
              style={{ background: cardBg, backdropFilter: 'blur(12px)', borderColor: cardBorder }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full"
                  style={{ background: `linear-gradient(180deg, ${bannerFrom}, ${bannerMid}80)` }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: bannerMid }}>Redes & Links</span>
              </div>
              <SocialGrid prof={prof} />
            </div>
          </AnimCard>
        )}

        {/* Badge Melodias */}
        <AnimCard delay={420} className="mb-6">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-white/20"
            style={{ background: `linear-gradient(135deg, ${bannerFrom} 0%, ${bannerMid} 55%, ${bannerTo} 100%)` }}>
            <div className="px-5 py-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/25"
                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
                <span className="text-2xl font-serif font-black italic text-white leading-none">♩</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-white font-black text-sm">Rede Espalhe Melodias</p>
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <p className="text-white/55 text-[11px] font-medium">Profissional verificado · Membro ativo</p>
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-white/10" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Este profissional é membro verificado da comunidade{' '}
                <strong className="text-white/70">Espalhe Melodias</strong>{' '}
                — uma rede comprometida com saúde mental e conexões humanas.
              </p>
            </div>
          </div>
        </AnimCard>

        {/* Footer */}
        <div className="text-center py-4">
          <div className="inline-flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="font-serif italic text-xl" style={{ color: accent }}>♩</span>
              <span className="font-script text-xl" style={{ color: accent }}>Melodias</span>
            </div>
            <p className="text-[10px] tracking-wide" style={{ color: `${accent}80` }}>Conectando pessoas através da saúde mental</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes profFloat0 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(8deg)} }
        @keyframes profFloat1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(-6deg)} }
        @keyframes profFloat2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(12deg)} }
        @keyframes profSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

// ─── Grid social ──────────────────────────────────────────────────────────────

function SocialGrid({ prof }: { prof: Professional }) {
  const links: Array<{ type: string; url: string; label: string }> = [];
  if (prof.contact_whatsapp) links.push({ type: 'whatsapp', url: `https://wa.me/${prof.contact_whatsapp}`, label: 'WhatsApp' });
  if (prof.instagram)        links.push({ type: 'instagram', url: prof.instagram.startsWith('http') ? prof.instagram : `https://instagram.com/${prof.instagram.replace('@','')}`, label: 'Instagram' });
  if (prof.linkedin)         links.push({ type: 'linkedin',  url: prof.linkedin.startsWith('http') ? prof.linkedin : `https://linkedin.com/in/${prof.linkedin}`, label: 'LinkedIn' });
  if (prof.facebook)         links.push({ type: 'facebook',  url: prof.facebook.startsWith('http') ? prof.facebook : `https://facebook.com/${prof.facebook}`, label: 'Facebook' });
  if (prof.tiktok)           links.push({ type: 'tiktok',    url: prof.tiktok.startsWith('http') ? prof.tiktok : `https://tiktok.com/@${prof.tiktok.replace('@','')}`, label: 'TikTok' });
  if (prof.twitter)          links.push({ type: 'twitter',   url: prof.twitter.startsWith('http') ? prof.twitter : `https://twitter.com/${prof.twitter.replace('@','')}`, label: 'Twitter' });
  if (prof.website)          links.push({ type: 'website',   url: prof.website, label: 'Site' });
  (prof.extra_links ?? []).forEach(l => links.push({ type: 'link', url: l.url, label: l.label }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {links.map((l, i) => {
        const c = socialColors[l.type] ?? socialColors.link;
        return (
          <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl font-bold text-xs transition-all duration-200 hover:scale-105 active:scale-95 hover:-translate-y-0.5 select-none"
            style={{ background: c.bg, color: c.text, boxShadow: `0 4px 12px ${c.glow}` }}>
            {socialIcons[l.type] ?? socialIcons.link}
            <span className="truncate">{l.label}</span>
          </a>
        );
      })}
    </div>
  );
}
