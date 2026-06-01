import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Globe2,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Menu,
  MessageCircle,
  ShieldCheck,
  Star,
  X,
  XCircle,
} from 'lucide-react';
import { type Professional, type ProfTheme } from '../lib/api';
import ThemeMinimal from './prof-themes/ThemeMinimal';
import ThemeCard    from './prof-themes/ThemeCard';
import ThemeDark    from './prof-themes/ThemeDark';
import { THEME_TO_TEMPLATE } from './prof-themes/index';

interface Props { userId: string }
type SocialLink = { type: string; url: string; label: string };

// ─── Tipos de tema (mantidos para compatibilidade com imports externos) ────────
export type ProfThemeAlias = ProfTheme;
export interface ThemePalette {
  name: string; label: string;
  bannerFrom: string; bannerMid: string; bannerTo: string;
  accent: string; accentMuted: string; accentLight: string;
  textHeading: string; textBody: string; pageBg: string; sectionAlt: string;
  navBg: string; navBorder: string; cardBg: string; cardBorder: string;
}
export const THEMES: Record<ProfTheme, ThemePalette> = {
  forest:   { name:'forest',   label:'Forest',   bannerFrom:'#0b1309', bannerMid:'#172711', bannerTo:'#40552b', accent:'#567736', accentMuted:'#789d54', accentLight:'#edf5e5', textHeading:'#17210e', textBody:'#445036', pageBg:'#f7fbf2', sectionAlt:'#eef5e8', navBg:'rgba(247,251,242,0.88)', navBorder:'rgba(86,119,54,0.16)', cardBg:'#ffffff', cardBorder:'#e1ead6' },
  ocean:    { name:'ocean',    label:'Ocean',    bannerFrom:'#06111f', bannerMid:'#0a2548', bannerTo:'#0477a6', accent:'#057ca5', accentMuted:'#22a7ca', accentLight:'#e2f5fb', textHeading:'#0a1729', textBody:'#263b52', pageBg:'#f3fbff', sectionAlt:'#e4f4fb', navBg:'rgba(243,251,255,0.88)', navBorder:'rgba(5,124,165,0.15)', cardBg:'#ffffff', cardBorder:'#cce8f3' },
  rose:     { name:'rose',     label:'Rose',     bannerFrom:'#210712', bannerMid:'#521129', bannerTo:'#9b3557', accent:'#b73567', accentMuted:'#d16388', accentLight:'#fde8f0', textHeading:'#3d0b1a', textBody:'#552638', pageBg:'#fff7fa', sectionAlt:'#ffe8f0', navBg:'rgba(255,247,250,0.88)', navBorder:'rgba(183,53,103,0.15)', cardBg:'#ffffff', cardBorder:'#f7cfdd' },
  gold:     { name:'gold',     label:'Gold',     bannerFrom:'#120b02', bannerMid:'#3b2404', bannerTo:'#936209', accent:'#ba780d', accentMuted:'#d79931', accentLight:'#fff2cf', textHeading:'#211402', textBody:'#4f3406', pageBg:'#fffaf0', sectionAlt:'#fff1cd', navBg:'rgba(255,250,240,0.88)', navBorder:'rgba(186,120,13,0.15)', cardBg:'#ffffff', cardBorder:'#f1dda5' },
  melodias: { name:'melodias', label:'Melodias', bannerFrom:'#0b1309', bannerMid:'#172711', bannerTo:'#40552b', accent:'#567736', accentMuted:'#789d54', accentLight:'#edf5e5', textHeading:'#17210e', textBody:'#445036', pageBg:'#f7fbf2', sectionAlt:'#eef5e8', navBg:'rgba(247,251,242,0.88)', navBorder:'rgba(86,119,54,0.16)', cardBg:'#ffffff', cardBorder:'#e1ead6' },
  minimal:  { name:'minimal',  label:'Minimal',  bannerFrom:'#1a1a1a', bannerMid:'#2d2d2d', bannerTo:'#a75a35', accent:'#a75a35', accentMuted:'#c4784f', accentLight:'#fdf0e8', textHeading:'#1a1a1a', textBody:'#4a4a4a', pageBg:'#ffffff', sectionAlt:'#f9f9f9', navBg:'rgba(255,255,255,0.95)', navBorder:'rgba(167,90,53,0.15)', cardBg:'#ffffff', cardBorder:'#e8e8e4' },
  card:     { name:'card',     label:'Card',     bannerFrom:'#06111f', bannerMid:'#0a2548', bannerTo:'#0477a6', accent:'#0477a6', accentMuted:'#22a7ca', accentLight:'#e2f5fb', textHeading:'#0a1729', textBody:'#263b52', pageBg:'#f4f4f0', sectionAlt:'#eaeae6', navBg:'rgba(244,244,240,0.95)', navBorder:'rgba(4,119,166,0.15)', cardBg:'#ffffff', cardBorder:'#d0d0cc' },
  dark:     { name:'dark',     label:'Dark',     bannerFrom:'#0a0a0f', bannerMid:'#12121a', bannerTo:'#1a1a28', accent:'#a75a35', accentMuted:'#c4784f', accentLight:'rgba(167,90,53,0.15)', textHeading:'#ffffff', textBody:'rgba(255,255,255,0.7)', pageBg:'#0a0a0f', sectionAlt:'rgba(255,255,255,0.03)', navBg:'rgba(10,10,15,0.9)', navBorder:'rgba(255,255,255,0.06)', cardBg:'rgba(255,255,255,0.04)', cardBorder:'rgba(255,255,255,0.08)' },
};
export function getTheme(prof: Professional): ThemePalette {
  if (prof.theme && THEMES[prof.theme]) return THEMES[prof.theme];
  const fallback = { ...THEMES.forest };
  if (prof.accent_color) { fallback.accent = prof.accent_color; fallback.accentMuted = `${prof.accent_color}cc`; fallback.accentLight = `${prof.accent_color}18`; }
  return fallback;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toNumber(v: unknown) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function getInitials(name = '') { return name.trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
function onlyDigits(v = '') { return v.replace(/\D/g,''); }
function normalizeUrl(v = '') { return v.startsWith('http') ? v : `https://${v}`; }

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useInView(opts = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, opts);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = '', from = 'bottom' }: {
  children: React.ReactNode; delay?: number; className?: string; from?: 'bottom' | 'left' | 'right' | 'scale';
}) {
  const { ref, visible } = useInView();
  const transforms: Record<string, string> = {
    bottom: 'translateY(28px)', left: 'translateX(-28px)', right: 'translateX(28px)', scale: 'scale(0.94) translateY(16px)',
  };
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : transforms[from],
      transition: `opacity .65s cubic-bezier(.22,1,.36,1) ${delay}ms, transform .65s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Social helpers ───────────────────────────────────────────────────────────
function socialColor(type: string) {
  const c: Record<string,string> = {
    whatsapp: 'linear-gradient(135deg,#22c55e,#16a34a)',
    instagram: 'linear-gradient(135deg,#f97316,#db2777,#7c3aed)',
    linkedin: 'linear-gradient(135deg,#0a66c2,#0284c7)',
    facebook: 'linear-gradient(135deg,#1877f2,#1d4ed8)',
    tiktok: 'linear-gradient(135deg,#020617,#334155)',
    twitter: 'linear-gradient(135deg,#0f172a,#38bdf8)',
    website: 'linear-gradient(135deg,#475569,#0f172a)',
    link: 'linear-gradient(135deg,#64748b,#334155)',
  };
  return c[type] || c.link;
}
function socialIcon(type: string) {
  if (type === 'whatsapp') return <MessageCircle size={17} />;
  if (type === 'website')  return <Globe2 size={17} />;
  return <LinkIcon size={17} />;
}
function buildSocialLinks(p: Professional): SocialLink[] {
  const links: SocialLink[] = [];
  const waMsg = encodeURIComponent(`Olá, ${p.name.split(' ')[0]}! Vim através da Rede Espalhe Melodias e gostaria de saber mais sobre seu atendimento.`);
  if (p.contact_whatsapp) links.push({ type:'whatsapp', url:`https://wa.me/${onlyDigits(p.contact_whatsapp)}?text=${waMsg}`, label:'WhatsApp' });
  if (p.instagram)  links.push({ type:'instagram',  url: p.instagram.startsWith('http') ? p.instagram : `https://instagram.com/${p.instagram.replace('@','')}`, label:'Instagram' });
  if (p.linkedin)   links.push({ type:'linkedin',   url: p.linkedin.startsWith('http')  ? p.linkedin  : `https://linkedin.com/in/${p.linkedin}`, label:'LinkedIn' });
  if (p.facebook)   links.push({ type:'facebook',   url: p.facebook.startsWith('http')  ? p.facebook  : `https://facebook.com/${p.facebook}`, label:'Facebook' });
  if (p.tiktok)     links.push({ type:'tiktok',     url: p.tiktok.startsWith('http')    ? p.tiktok    : `https://tiktok.com/@${p.tiktok.replace('@','')}`, label:'TikTok' });
  if (p.twitter)    links.push({ type:'twitter',    url: p.twitter.startsWith('http')   ? p.twitter   : `https://twitter.com/${p.twitter.replace('@','')}`, label:'Twitter/X' });
  if (p.website)    links.push({ type:'website',    url: normalizeUrl(p.website), label:'Site' });
  p.extra_links?.forEach(l => { if (l.url) links.push({ type:'link', url: normalizeUrl(l.url), label: l.label||'Link' }); });
  return links;
}

// ─── Entry point ──────────────────────────────────────────────────────────────
export default function ProfessionalPublicPage({ userId }: Props) {
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true); setError('');
    fetch(`http://localhost:3001/profissional/api/${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then((body: { success: boolean; data?: Professional; message?: string }) => {
        if (!mounted) return;
        if (body.success && body.data) setProfessional(body.data);
        else setError(body.message ?? 'Profissional não encontrado.');
      })
      .catch(() => { if (mounted) setError('Não foi possível carregar este perfil.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [userId]);

  if (loading) return <LoadingScreen />;
  if (error || !professional) return <ErrorScreen message={error} />;

  const templateId = THEME_TO_TEMPLATE[professional.theme ?? ''] ?? 'melodias';
  if (templateId === 'minimal') return <ThemeMinimal professional={professional} />;
  if (templateId === 'card')    return <ThemeCard    professional={professional} />;
  if (templateId === 'dark')    return <ThemeDark    professional={professional} />;
  return <ProfessionalProfile professional={professional} />;
}

// ─── Loading / Error ──────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#f9f4ee] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl font-black text-white shadow-xl"
          style={{ background: 'linear-gradient(135deg,#2c1810,#a75a35)' }}>♩</div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[#5a4035]/50">
          <Loader2 size={16} className="animate-spin" /> Carregando perfil...
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#f9f4ee] flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <XCircle className="mx-auto mb-4 text-red-400" size={48} />
        <h1 className="text-xl font-black text-[#2c1810] mb-2">Perfil não encontrado</h1>
        <p className="text-sm text-[#5a4035]/60 mb-6">{message || 'Este link pode estar incorreto.'}</p>
        <a href="/diretorio"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white"
          style={{ background: '#a75a35' }}>
          Ver diretório
        </a>
      </div>
    </div>
  );
}

// ─── Tema Melodias (padrão) ───────────────────────────────────────────────────
function ProfessionalProfile({ professional }: { professional: Professional }) {
  const accent = professional.accent_color || '#a75a35';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const rating     = toNumber(professional.rating);
  const reviews    = toNumber(professional.reviews_count);
  const initials   = getInitials(professional.name);
  const socialLinks = useMemo(() => buildSocialLinks(professional), [professional]);
  const waMsg      = encodeURIComponent(`Olá, ${professional.name.split(' ')[0]}! Vim através da Rede Espalhe Melodias e gostaria de saber mais sobre seu atendimento.`);
  const whatsappUrl = professional.contact_whatsapp
    ? `https://wa.me/${onlyDigits(professional.contact_whatsapp)}?text=${waMsg}` : '';

  // Cores
  const bg     = '#f9f4ee';
  const card   = '#ffffff';
  const border = '#e8ddd3';
  const h1col  = '#2c1810';
  const bodycol = '#5a4035';
  const asoft  = `${accent}14`;
  const aborder = `${accent}26`;

  useEffect(() => {
    const fn = () => { setScrolled(window.scrollY > 50); setScrollY(window.scrollY); };
    fn(); window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const parallax = Math.min(scrollY * 0.12, 48);

  return (
    <main className="min-h-screen overflow-x-hidden antialiased"
      style={{ background: bg, color: bodycol, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        html { scroll-behavior: smooth; }
        ::selection { background: ${accent}; color: #fff; }

        /* Entrada do hero */
        .m-badge  { animation: mIn .6s cubic-bezier(.22,1,.36,1) .05s both; }
        .m-name   { animation: mIn .7s cubic-bezier(.22,1,.36,1) .15s both; }
        .m-sub    { animation: mIn .7s cubic-bezier(.22,1,.36,1) .25s both; }
        .m-btns   { animation: mIn .7s cubic-bezier(.22,1,.36,1) .35s both; }
        .m-photo  { animation: mPhotoIn .9s cubic-bezier(.22,1,.36,1) .1s both; }
        .m-deco   { animation: mDecoIn 1s cubic-bezier(.22,1,.36,1) .05s both; }

        @keyframes mIn {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes mPhotoIn {
          from { opacity:0; transform:translateY(32px) scale(.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes mDecoIn {
          from { opacity:0; transform:scale(.8) rotate(-6deg); }
          to   { opacity:1; transform:scale(1) rotate(0deg); }
        }

        /* Botão WhatsApp pulse */
        .wa-btn { position:relative; overflow:hidden; }
        .wa-btn::after {
          content:''; position:absolute; inset:0; border-radius:inherit;
          background:rgba(255,255,255,.18);
          animation:waPulse 2.4s ease-in-out infinite;
        }
        @keyframes waPulse {
          0%,100% { opacity:0; transform:scale(1); }
          50%     { opacity:1; transform:scale(1.06); }
        }

        /* Shimmer nos cards de serviço */
        .service-card { position:relative; overflow:hidden; }
        .service-card::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.55),transparent 70%);
          transform:translateX(-100%); transition:transform .55s ease;
        }
        .service-card:hover::before { transform:translateX(100%); }

        /* Nav pill hover */
        .nav-pill { transition: background .18s, color .18s, transform .18s; }
        .nav-pill:hover { transform:translateY(-1px); }

        /* Social link hover lift */
        .social-link { transition: transform .2s cubic-bezier(.22,1,.36,1), box-shadow .2s; }
        .social-link:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,.1); }

        /* Foto hover zoom */
        .photo-wrap img { transition: transform .6s cubic-bezier(.22,1,.36,1); }
        .photo-wrap:hover img { transform: scale(1.04); }

        /* Floating badge */
        .float-badge { animation: floatBadge 3.5s ease-in-out infinite; }
        @keyframes floatBadge {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-6px); }
        }

        /* Scroll indicator */
        .scroll-dot { animation:scrollBob 1.5s ease-in-out infinite; }
        @keyframes scrollBob {
          0%,100% { transform:translateY(0); opacity:.6; }
          50%     { transform:translateY(6px); opacity:1; }
        }

        /* Specialty pill hover */
        .spec-pill { transition:background .18s, transform .18s; cursor:default; }
        .spec-pill:hover { transform:translateY(-2px); }
      `}</style>

      {/* ── NAV ── */}
      <nav className="fixed inset-x-0 top-0 z-50 transition-all duration-400"
        style={{ padding: scrolled ? '8px 0' : '16px 0' }}>
        <div className="mx-auto flex w-[min(1100px,calc(100%-20px))] items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-400"
          style={{
            background: scrolled ? 'rgba(249,244,238,.94)' : 'rgba(249,244,238,0)',
            backdropFilter: scrolled ? 'blur(24px) saturate(1.8)' : 'none',
            boxShadow: scrolled ? `0 4px 40px rgba(44,24,16,.08), 0 1px 0 ${border}` : 'none',
            border: `1px solid ${scrolled ? border : 'transparent'}`,
          }}>

          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 no-underline group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base font-black shadow-md transition group-hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${h1col}, ${accent})` }}>♩</div>
            <div>
              <p className="m-0 text-sm font-black leading-tight" style={{ color: h1col }}>Espalhe Melodias</p>
              <p className="m-0 text-[9px] font-bold uppercase tracking-[.2em]" style={{ color: `${h1col}55` }}>Perfil profissional</p>
            </div>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {(['Sobre','Serviços','Contato'] as const).map((label, i) => (
              <a key={label} href={['#sobre','#servicos','#contato'][i]}
                className="nav-pill px-4 py-2 rounded-xl text-xs font-bold"
                style={{ color: bodycol }}>
                {label}
              </a>
            ))}
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="ml-2 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-white transition hover:-translate-y-0.5"
                style={{ background: accent, boxShadow: `0 4px 16px ${accent}40` }}>
                <MessageCircle size={14} /> Agendar
              </a>
            )}
          </div>

          {/* Mobile menu btn */}
          <button type="button" onClick={() => setMenuOpen(v=>!v)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border transition active:scale-95"
            style={{ borderColor: border, color: h1col }}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="mx-auto mt-2 w-[min(1100px,calc(100%-20px))] rounded-2xl p-2 shadow-2xl md:hidden"
            style={{ background: card, border: `1px solid ${border}` }}>
            {(['Sobre','Serviços','Contato'] as const).map((label, i) => (
              <a key={label} href={['#sobre','#servicos','#contato'][i]}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold no-underline transition hover:opacity-70"
                style={{ color: h1col }}>
                {label}
              </a>
            ))}
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="mt-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-black text-white"
                style={{ background: '#25d366' }}>
                <MessageCircle size={16} /> Agendar consulta
              </a>
            )}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden px-5 pt-24 pb-16 md:px-8">

        {/* Fundo com manchas de cor suaves */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-10%] right-[-5%] w-[55vw] h-[55vw] max-w-lg rounded-full blur-[100px] opacity-25"
            style={{ background: accent }} />
          <div className="absolute bottom-[-5%] left-[-8%] w-[40vw] h-[40vw] max-w-sm rounded-full blur-[80px] opacity-15"
            style={{ background: accent }} />
          {/* Dots decorativos */}
          <div className="m-deco absolute top-[18%] left-[12%] w-3 h-3 rounded-full opacity-30" style={{ background: accent }} />
          <div className="m-deco absolute top-[35%] right-[8%] w-2 h-2 rounded-full opacity-20" style={{ background: accent }} />
          <div className="m-deco absolute bottom-[20%] left-[30%] w-4 h-4 rounded-full opacity-15" style={{ background: accent }} />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="flex flex-col items-center gap-10 text-center lg:flex-row lg:items-end lg:gap-16 lg:text-left">

            {/* ── FOTO ── mobile: abaixo do texto; desktop: à direita */}
            <div className="m-photo order-first w-full max-w-[260px] shrink-0 lg:order-last lg:ml-auto lg:max-w-sm xl:max-w-md mx-auto lg:mx-0">
              <div className="relative">
                {/* Sombra decorativa atrás */}
                <div className="absolute -bottom-3 -right-3 w-full h-full rounded-[2.5rem]"
                  style={{ background: asoft, border: `2px dashed ${aborder}` }} />

                {/* Container foto com parallax */}
                <div className="photo-wrap relative overflow-hidden rounded-[2.5rem] shadow-2xl"
                  style={{ boxShadow: `0 40px 80px ${accent}20, 0 16px 40px rgba(0,0,0,.1)`, transform: `translateY(${-parallax}px)`, transition: 'transform .1s linear' }}>
                  {professional.avatar ? (
                    <img
                      src={professional.avatar}
                      alt={professional.name}
                      onLoad={() => setImgLoaded(true)}
                      className="w-full aspect-[3/4] object-cover object-top"
                      style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity .4s' }}
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] flex items-center justify-center text-6xl font-black"
                      style={{ background: `linear-gradient(135deg, ${accent}22, ${accent}55)`, color: accent }}>
                      {initials}
                    </div>
                  )}
                  {/* Overlay sutil no hover */}
                  <div className="absolute inset-0 pointer-events-none rounded-[2.5rem]"
                    style={{ background: `linear-gradient(to top, ${accent}18 0%, transparent 40%)` }} />
                </div>

                {/* Badge verificado flutuante */}
                <div className="float-badge absolute -left-5 top-1/3 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl"
                  style={{ background: card, border: `1px solid ${border}` }}>
                  <ShieldCheck size={15} style={{ color: accent }} />
                  <span className="text-xs font-black" style={{ color: h1col }}>Verificado</span>
                </div>

                {/* Rating flutuante se tiver */}
                {rating > 0 && (
                  <div className="float-badge absolute -right-5 bottom-1/4 flex items-center gap-2 px-3 py-2 rounded-xl shadow-xl"
                    style={{ background: card, border: `1px solid ${border}`, animationDelay: '.8s' }}>
                    <Star size={13} className="fill-amber-400 stroke-amber-400" />
                    <span className="text-xs font-black text-amber-600">{rating.toFixed(1)}</span>
                    {reviews > 0 && <span className="text-[10px] opacity-50">/5</span>}
                  </div>
                )}
              </div>
            </div>

            {/* ── TEXTO ── */}
            <div className="flex-1 min-w-0">

              {/* Badge */}
              <div className="m-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold mb-5 border"
                style={{ background: asoft, borderColor: aborder, color: accent }}>
                <BadgeCheck size={13} /> Profissional verificado · Espalhe Melodias
              </div>

              {/* Nome */}
              <h1 className="m-name m-0 text-[2.8rem] font-black leading-[.9] tracking-[-0.055em] md:text-6xl xl:text-7xl"
                style={{ color: h1col }}>
                {professional.name}
              </h1>

              {/* CRP */}
              {professional.crp && (
                <p className="m-sub mt-3 font-mono text-xs font-bold tracking-[.2em] uppercase opacity-40"
                  style={{ color: h1col }}>{professional.crp}</p>
              )}

              {/* Especialidades como texto */}
              {professional.specialties?.length > 0 && (
                <p className="m-sub mt-4 text-base leading-7" style={{ color: `${bodycol}bb` }}>
                  {professional.specialties.slice(0,5).join(' · ')}
                  {professional.specialties.length > 5 ? ` · +${professional.specialties.length - 5}` : ''}
                </p>
              )}

              {/* Localização */}
              {professional.location && (
                <div className="m-sub mt-3 flex items-center justify-center gap-1.5 text-sm font-medium lg:justify-start"
                  style={{ color: `${bodycol}88` }}>
                  <MapPin size={14} style={{ color: accent }} /> {professional.location}
                </div>
              )}

              {/* CTAs */}
              <div className="m-btns mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="wa-btn group flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-black text-white transition hover:-translate-y-0.5 active:scale-95"
                    style={{ background: '#25d366', boxShadow: '0 8px 28px rgba(37,211,102,.35)' }}>
                    <MessageCircle size={18} /> Agendar consulta
                    <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                  </a>
                )}
                <a href="#sobre"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black border transition hover:bg-black/5 active:scale-95"
                  style={{ borderColor: border, color: h1col }}>
                  Conhecer perfil <ChevronDown size={15} />
                </a>
              </div>

              {/* Idiomas */}
              {professional.languages?.length > 0 && (
                <div className="m-btns mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                  {professional.languages.map(l => (
                    <span key={l} className="text-[11px] font-semibold px-3 py-1.5 rounded-full border"
                      style={{ borderColor: border, color: bodycol, background: card }}>{l}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="hidden md:flex absolute bottom-0 left-1/2 -translate-x-1/2 flex-col items-center gap-2 pb-4">
            <div className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5"
              style={{ borderColor: `${h1col}30` }}>
              <div className="scroll-dot w-1 h-2 rounded-full" style={{ background: accent }} />
            </div>
          </div>
        </div>
      </section>

      {/* Separador */}
      <div className="h-px mx-auto max-w-6xl" style={{ background: `linear-gradient(90deg, transparent, ${border}, transparent)` }} />

      {/* ── SOBRE ── */}
      <section id="sobre" className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-20 lg:items-start">

            <Reveal className="flex-1 min-w-0" delay={0}>
              <p className="text-[10px] font-black uppercase tracking-[.25em] mb-4" style={{ color: accent }}>Sobre</p>
              <h2 className="text-3xl font-black tracking-[-0.04em] md:text-4xl mb-6" style={{ color: h1col }}>
                {professional.name.split(' ')[0]}, em palavras
              </h2>
              <p className="text-base leading-8" style={{ color: `${bodycol}bb` }}>
                {professional.bio || 'Perfil profissional verificado na Rede Espalhe Melodias.'}
              </p>
            </Reveal>

            {professional.specialties?.length > 0 && (
              <Reveal className="lg:w-96 shrink-0" delay={100} from="right">
                <div className="rounded-2xl p-5 border" style={{ background: card, borderColor: border }}>
                  <p className="text-[10px] font-black uppercase tracking-[.22em] mb-4" style={{ color: accent }}>Especialidades</p>
                  <div className="flex flex-wrap gap-2">
                    {professional.specialties.map((s, i) => (
                      <span key={s} className="spec-pill inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border"
                        style={{ background: asoft, borderColor: aborder, color: h1col, transitionDelay: `${i * 30}ms` }}>
                        <Check size={11} style={{ color: accent }} /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ── SERVIÇOS ── */}
      {professional.services?.length > 0 && (
        <section id="servicos" className="px-5 py-20 md:px-8 md:py-24"
          style={{ background: `linear-gradient(180deg, ${asoft} 0%, transparent 100%)`, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-[10px] font-black uppercase tracking-[.25em] mb-2" style={{ color: accent }}>Serviços</p>
              <h2 className="text-3xl font-black tracking-[-0.04em] md:text-4xl mb-10" style={{ color: h1col }}>
                Como posso ajudar
              </h2>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {professional.services.map((s, i) => (
                <Reveal key={s} delay={i * 60} from="bottom">
                  <div className="service-card group rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-xl cursor-default"
                    style={{ background: card, borderColor: border }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: asoft, color: accent }}>
                      <Check size={18} />
                    </div>
                    <h3 className="text-sm font-black mb-1" style={{ color: h1col }}>{s}</h3>
                    <p className="text-xs leading-5 opacity-45">Atendimento com ética e acolhimento profissional.</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── AGENDA ── */}
      {professional.schedule?.length > 0 && (
        <section className="px-5 py-16 md:px-8">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-[10px] font-black uppercase tracking-[.25em] mb-2" style={{ color: accent }}>Agenda</p>
              <h2 className="text-2xl font-black tracking-tight mb-6" style={{ color: h1col }}>Horários disponíveis</h2>
              <div className="flex flex-wrap gap-2">
                {professional.schedule.map((slot, i) => (
                  <span key={i} className="text-xs font-semibold px-4 py-2.5 rounded-xl border transition hover:shadow-sm"
                    style={{ background: card, borderColor: border, color: bodycol }}>
                    {slot.day} {slot.hours}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── CONTATO ── */}
      <section id="contato" className="px-5 py-20 md:px-8 md:py-28"
        style={{ borderTop: `1px solid ${border}` }}>
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">

            <Reveal className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[.25em] mb-3" style={{ color: accent }}>Contato</p>
              <h2 className="text-3xl font-black tracking-[-0.04em] md:text-4xl mb-4" style={{ color: h1col }}>
                Vamos conversar?
              </h2>
              <p className="text-base leading-7 mb-8 max-w-md" style={{ color: `${bodycol}99` }}>
                Entre em contato para verificar disponibilidade, tirar dúvidas ou agendar um atendimento.
              </p>
              <div className="flex flex-wrap gap-3">
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="wa-btn flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-black text-white transition hover:-translate-y-0.5 active:scale-95"
                    style={{ background: '#25d366', boxShadow: '0 8px 28px rgba(37,211,102,.28)' }}>
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                )}
                <a href="/diretorio"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black border transition hover:bg-black/5 active:scale-95"
                  style={{ borderColor: border, color: h1col }}>
                  Ver outros profissionais
                </a>
              </div>
            </Reveal>

            {socialLinks.length > 0 && (
              <Reveal className="lg:w-80 xl:w-96 shrink-0" delay={80} from="right">
                <div className="rounded-2xl border p-5" style={{ background: card, borderColor: border }}>
                  <p className="text-[10px] font-black uppercase tracking-[.22em] mb-4" style={{ color: accent }}>Redes & Links</p>
                  <div className="grid gap-2.5">
                    {socialLinks.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="social-link flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold no-underline"
                        style={{ background: bg, borderColor: border, color: h1col }}>
                        <span className="w-8 h-8 flex items-center justify-center rounded-xl text-white shrink-0 text-[13px]"
                          style={{ background: socialColor(link.type) }}>
                          {socialIcon(link.type)}
                        </span>
                        <span className="truncate">{link.label}</span>
                        <ArrowRight size={14} className="ml-auto opacity-25 transition group-hover:translate-x-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-5 py-8 md:px-8" style={{ background: h1col }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 text-white font-black">♩</div>
            <div>
              <p className="m-0 text-sm font-black text-white">Espalhe Melodias</p>
              <p className="m-0 text-xs text-white/30">Comunidade de saúde mental</p>
            </div>
          </div>
          <p className="m-0 text-xs text-white/25">
            © {new Date().getFullYear()} Espalhe Melodias. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
