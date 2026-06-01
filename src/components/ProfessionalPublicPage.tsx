import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleDollarSign,
  Globe2,
  Languages,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';
import { professionalsApi, type Professional, type ProfTheme } from '../lib/api';

interface Props {
  userId: string;
}

type SocialLink = {
  type: string;
  url: string;
  label: string;
};

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
  sectionAlt: string;
  navBg: string;
  navBorder: string;
  cardBg: string;
  cardBorder: string;
}

export const THEMES: Record<ProfTheme, ThemePalette> = {
  forest: {
    name: 'forest',
    label: 'Forest',
    bannerFrom: '#0b1309',
    bannerMid: '#172711',
    bannerTo: '#40552b',
    accent: '#567736',
    accentMuted: '#789d54',
    accentLight: '#edf5e5',
    textHeading: '#17210e',
    textBody: '#445036',
    pageBg: '#f7fbf2',
    sectionAlt: '#eef5e8',
    navBg: 'rgba(247,251,242,0.88)',
    navBorder: 'rgba(86,119,54,0.16)',
    cardBg: '#ffffff',
    cardBorder: '#e1ead6',
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean',
    bannerFrom: '#06111f',
    bannerMid: '#0a2548',
    bannerTo: '#0477a6',
    accent: '#057ca5',
    accentMuted: '#22a7ca',
    accentLight: '#e2f5fb',
    textHeading: '#0a1729',
    textBody: '#263b52',
    pageBg: '#f3fbff',
    sectionAlt: '#e4f4fb',
    navBg: 'rgba(243,251,255,0.88)',
    navBorder: 'rgba(5,124,165,0.15)',
    cardBg: '#ffffff',
    cardBorder: '#cce8f3',
  },
  rose: {
    name: 'rose',
    label: 'Rose',
    bannerFrom: '#210712',
    bannerMid: '#521129',
    bannerTo: '#9b3557',
    accent: '#b73567',
    accentMuted: '#d16388',
    accentLight: '#fde8f0',
    textHeading: '#3d0b1a',
    textBody: '#552638',
    pageBg: '#fff7fa',
    sectionAlt: '#ffe8f0',
    navBg: 'rgba(255,247,250,0.88)',
    navBorder: 'rgba(183,53,103,0.15)',
    cardBg: '#ffffff',
    cardBorder: '#f7cfdd',
  },
  gold: {
    name: 'gold',
    label: 'Gold',
    bannerFrom: '#120b02',
    bannerMid: '#3b2404',
    bannerTo: '#936209',
    accent: '#ba780d',
    accentMuted: '#d79931',
    accentLight: '#fff2cf',
    textHeading: '#211402',
    textBody: '#4f3406',
    pageBg: '#fffaf0',
    sectionAlt: '#fff1cd',
    navBg: 'rgba(255,250,240,0.88)',
    navBorder: 'rgba(186,120,13,0.15)',
    cardBg: '#ffffff',
    cardBorder: '#f1dda5',
  },
};

export function getTheme(prof: Professional): ThemePalette {
  if (prof.theme && THEMES[prof.theme]) return THEMES[prof.theme];

  const fallback = { ...THEMES.forest };

  if (prof.accent_color) {
    fallback.accent = prof.accent_color;
    fallback.accentMuted = `${prof.accent_color}cc`;
    fallback.accentLight = `${prof.accent_color}18`;
  }

  return fallback;
}

const toNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatCurrency = (value: unknown) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(toNumber(value));

const onlyDigits = (value = '') => value.replace(/\D/g, '');

const normalizeUrl = (value: string) => {
  if (!value) return '';
  return value.startsWith('http') ? value : `https://${value}`;
};

const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useInView();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity .65s ease ${delay}ms, transform .65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function ProfessionalPublicPage({ userId }: Props) {
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError('');

    professionalsApi
      .list()
      .then((response) => {
        if (!mounted) return;

        const found = response.data.find((item) => item.user_id === userId || item.id === userId);

        if (found) {
          setProfessional(found);
          return;
        }

        setError('Profissional não encontrado.');
      })
      .catch(() => {
        if (mounted) setError('Não foi possível carregar este perfil profissional.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [userId]);

  if (loading) return <LoadingScreen />;
  if (error || !professional) return <ErrorScreen message={error} />;

  return <ProfessionalProfile professional={professional} />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-10 py-9 text-center shadow-2xl backdrop-blur-xl">
        <Loader2 className="mx-auto mb-5 h-10 w-10 animate-spin text-white/70" />
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/45">Carregando perfil</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 text-center shadow-2xl backdrop-blur-xl">
        <XCircle className="mx-auto mb-5 h-12 w-12 text-red-300" />
        <h1 className="mb-2 text-2xl font-black tracking-tight text-white">Perfil não encontrado</h1>
        <p className="text-sm leading-6 text-white/55">{message || 'Este link pode estar incorreto ou indisponível.'}</p>
        <a
          href="/diretorio"
          className="mt-7 inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-white/90"
        >
          Voltar para o diretório
        </a>
      </div>
    </div>
  );
}

function ProfessionalProfile({ professional }: { professional: Professional }) {
  const theme = getTheme(professional);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const rating = toNumber(professional.rating);
  const reviews = toNumber(professional.reviews_count);
  const price = toNumber(professional.price_per_session);
  const initials = getInitials(professional.name);

  const socialLinks = useMemo(() => buildSocialLinks(professional), [professional]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const whatsappUrl = professional.contact_whatsapp
    ? `https://wa.me/${onlyDigits(professional.contact_whatsapp)}`
    : '';

  const hasStats = professional.location || price > 0 || rating > 0;

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{
        background: theme.pageBg,
        color: theme.textBody,
      }}
    >
      <style>{profileStyles(theme)}</style>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-3' : 'py-5'
        }`}
      >
        <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] items-center justify-between rounded-3xl border px-4 py-3 shadow-lg backdrop-blur-2xl md:px-5"
          style={{
            background: scrolled ? theme.navBg : 'rgba(255,255,255,0.08)',
            borderColor: scrolled ? theme.navBorder : 'rgba(255,255,255,0.12)',
            boxShadow: scrolled ? '0 16px 50px rgba(15,23,42,0.08)' : 'none',
          }}
        >
          <a href="/" className="flex items-center gap-3 no-underline">
            <div
              className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${theme.bannerFrom}, ${theme.accent})` }}
            >
              <Sparkles size={19} />
            </div>
            <div>
              <p
                className="m-0 text-sm font-black leading-none tracking-tight"
                style={{ color: scrolled ? theme.textHeading : '#fff' }}
              >
                Espalhe Melodias
              </p>
              <p
                className="m-0 mt-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: scrolled ? theme.accent : 'rgba(255,255,255,0.55)' }}
              >
                Perfil profissional
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-2 md:flex">
            <NavItem href="#sobre" label="Sobre" scrolled={scrolled} theme={theme} />
            <NavItem href="#servicos" label="Serviços" scrolled={scrolled} theme={theme} />
            <NavItem href="#contato" label="Contato" scrolled={scrolled} theme={theme} />
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                <MessageCircle size={17} /> Agendar
              </a>
            )}
          </nav>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-2xl border md:hidden"
            style={{
              borderColor: scrolled ? theme.navBorder : 'rgba(255,255,255,0.16)',
              color: scrolled ? theme.textHeading : '#fff',
              background: scrolled ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.08)',
            }}
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="mx-auto mt-2 grid w-[min(1180px,calc(100%-32px))] gap-2 rounded-3xl border bg-white p-3 shadow-2xl md:hidden">
            <MobileNavItem href="#sobre" label="Sobre" onClick={() => setMenuOpen(false)} />
            <MobileNavItem href="#servicos" label="Serviços" onClick={() => setMenuOpen(false)} />
            <MobileNavItem href="#contato" label="Contato" onClick={() => setMenuOpen(false)} />
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white"
              >
                <MessageCircle size={17} /> Agendar consulta
              </a>
            )}
          </div>
        )}
      </header>

      <section
        className="relative flex min-h-screen items-center overflow-hidden px-5 pb-16 pt-32 md:px-8 md:pt-36"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${theme.accent}55, transparent 28%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.12), transparent 24%), linear-gradient(145deg, ${theme.bannerFrom} 0%, ${theme.bannerMid} 48%, ${theme.bannerTo} 100%)`,
        }}
      >
        <div className="profile-grid pointer-events-none absolute inset-0 opacity-[0.08]" />
        <FloatingOrnaments />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.12fr_.88fr]">
          <div className="animate-hero-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/75 backdrop-blur-xl">
              <BadgeCheck size={15} className="text-emerald-300" />
              Profissional verificado
            </div>

            <h1 className="m-0 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-white md:text-7xl">
              {professional.name}
            </h1>

            {professional.crp && (
              <p className="mt-5 inline-flex rounded-full border border-white/12 bg-white/10 px-4 py-2 font-mono text-xs font-black uppercase tracking-[0.18em] text-white/55">
                {professional.crp}
              </p>
            )}

            {professional.specialties?.length > 0 && (
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65 md:text-xl">
                {professional.specialties.slice(0, 4).join(' · ')}
                {professional.specialties.length > 4 ? ` · +${professional.specialties.length - 4}` : ''}
              </p>
            )}

            {rating > 0 && (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Star
                      key={item}
                      size={18}
                      className={item <= Math.round(rating) ? 'fill-amber-300 text-amber-300' : 'text-white/20'}
                    />
                  ))}
                </div>
                <span className="text-sm font-black text-amber-200">{rating.toFixed(1)}</span>
                {reviews > 0 && <span className="text-sm font-semibold text-white/45">({reviews} avaliações)</span>}
              </div>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-6 py-4 text-base font-black text-white shadow-2xl shadow-emerald-500/30 transition hover:-translate-y-1 hover:bg-emerald-600"
                >
                  <MessageCircle size={21} /> Agendar consulta
                  <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                </a>
              ) : null}

              <a
                href="#sobre"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-base font-bold text-white backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/15"
              >
                Conhecer perfil <ChevronDown size={18} />
              </a>
            </div>

            {hasStats && (
              <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
                {professional.location && (
                  <HeroStat icon={<MapPin size={18} />} label="Localização" value={professional.location} />
                )}
                {price > 0 && <HeroStat icon={<CircleDollarSign size={18} />} label="Sessão" value={formatCurrency(price)} />}
                {rating > 0 && <HeroStat icon={<Star size={18} />} label="Avaliação" value={rating.toFixed(1)} />}
              </div>
            )}
          </div>

          <div className="animate-card-in relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-6 rounded-[3rem] bg-white/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/12 p-4 shadow-2xl backdrop-blur-2xl">
              <div className="relative overflow-hidden rounded-[2rem] bg-white">
                <ProfileImage professional={professional} initials={initials} theme={theme} large />

                <div className="p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="m-0 text-xs font-black uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
                        Perfil público
                      </p>
                      <h2 className="m-0 mt-1 text-2xl font-black tracking-tight" style={{ color: theme.textHeading }}>
                        {professional.name.split(' ')[0]}
                      </h2>
                    </div>
                    <div
                      className="grid h-12 w-12 place-items-center rounded-2xl"
                      style={{ background: theme.accentLight, color: theme.accent }}
                    >
                      <ShieldCheck size={24} />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {professional.location && (
                      <InfoLine icon={<MapPin size={17} />} label={professional.location} theme={theme} />
                    )}
                    {professional.languages?.length > 0 && (
                      <InfoLine icon={<Languages size={17} />} label={professional.languages.join(', ')} theme={theme} />
                    )}
                    {professional.services?.length > 0 && (
                      <InfoLine icon={<BriefcaseBusiness size={17} />} label={`${professional.services.length} serviço(s) disponível(is)`} theme={theme} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <Reveal>
            <div className="sticky top-28 rounded-[2rem] border p-5 shadow-xl" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
              <ProfileImage professional={professional} initials={initials} theme={theme} />
              <div className="mt-5">
                <p className="m-0 text-xs font-black uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
                  Identificação profissional
                </p>
                <h2 className="m-0 mt-2 text-2xl font-black tracking-tight" style={{ color: theme.textHeading }}>
                  {professional.name}
                </h2>
                {professional.crp && <p className="mt-2 text-sm font-bold opacity-70">{professional.crp}</p>}
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal delay={80}>
              <SectionEyebrow theme={theme}>Sobre o profissional</SectionEyebrow>
              <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] md:text-5xl" style={{ color: theme.textHeading }}>
                Um espaço de cuidado, escuta e desenvolvimento humano.
              </h2>
              {professional.bio ? (
                <p className="mt-6 max-w-3xl text-lg leading-9" style={{ color: theme.textBody }}>
                  {professional.bio}
                </p>
              ) : (
                <p className="mt-6 max-w-3xl text-lg leading-9 opacity-75">
                  Este perfil reúne as principais informações profissionais, áreas de atuação, serviços e canais de contato.
                </p>
              )}
            </Reveal>

            {professional.specialties?.length > 0 && (
              <Reveal delay={140} className="mt-10">
                <div className="rounded-[2rem] border p-6" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                  <h3 className="mb-5 text-xl font-black tracking-tight" style={{ color: theme.textHeading }}>
                    Especialidades
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {professional.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold"
                        style={{ background: theme.accentLight, borderColor: `${theme.accent}25`, color: theme.textHeading }}
                      >
                        <Check size={15} style={{ color: theme.accent }} />
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <section id="servicos" className="px-5 py-20 md:px-8 md:py-24" style={{ background: theme.sectionAlt }}>
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <SectionEyebrow theme={theme}>Serviços</SectionEyebrow>
              <h2 className="mt-3 text-4xl font-black leading-tight tracking-[-0.04em] md:text-5xl" style={{ color: theme.textHeading }}>
                Atendimentos e possibilidades
              </h2>
              <p className="mt-5 text-base leading-7 opacity-75">
                Conheça os principais serviços oferecidos e escolha o melhor caminho para iniciar o contato.
              </p>
            </div>
          </Reveal>

          {professional.services?.length > 0 ? (
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {professional.services.map((service, index) => (
                <Reveal key={service} delay={index * 60}>
                  <div
                    className="group h-full rounded-[2rem] border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
                  >
                    <div
                      className="mb-5 grid h-12 w-12 place-items-center rounded-2xl transition group-hover:scale-105"
                      style={{ background: theme.accentLight, color: theme.accent }}
                    >
                      <BriefcaseBusiness size={22} />
                    </div>
                    <h3 className="m-0 text-lg font-black tracking-tight" style={{ color: theme.textHeading }}>
                      {service}
                    </h3>
                    <p className="mt-3 text-sm leading-6 opacity-70">
                      Atendimento conduzido com ética, acolhimento e direcionamento profissional.
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyCard theme={theme} text="Nenhum serviço foi cadastrado para este perfil." />
          )}
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {professional.location && (
            <DataCard icon={<MapPin size={24} />} title="Localização" value={professional.location} theme={theme} />
          )}
          {price > 0 && (
            <DataCard icon={<CircleDollarSign size={24} />} title="Valor da sessão" value={formatCurrency(price)} theme={theme} />
          )}
          {professional.languages?.length > 0 && (
            <DataCard icon={<Globe2 size={24} />} title="Idiomas" value={professional.languages.join(', ')} theme={theme} />
          )}
        </div>
      </section>

      <section id="contato" className="px-5 py-20 md:px-8 md:py-28" style={{ background: theme.sectionAlt }}>
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_.9fr]">
          <Reveal>
            <div>
              <SectionEyebrow theme={theme}>Contato</SectionEyebrow>
              <h2 className="mt-3 text-4xl font-black leading-tight tracking-[-0.04em] md:text-5xl" style={{ color: theme.textHeading }}>
                Comece uma conversa de forma simples e segura.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 opacity-75">
                Use os canais disponíveis para tirar dúvidas, verificar horários ou agendar um atendimento.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-6 py-4 text-base font-black text-white shadow-xl shadow-emerald-500/20 transition hover:-translate-y-1 hover:bg-emerald-600"
                  >
                    <MessageCircle size={21} /> Falar pelo WhatsApp
                  </a>
                )}
                <a
                  href="/diretorio"
                  className="inline-flex items-center gap-3 rounded-2xl border bg-white px-6 py-4 text-base font-black transition hover:-translate-y-1"
                  style={{ borderColor: theme.cardBorder, color: theme.textHeading }}
                >
                  Ver outros profissionais
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-[2rem] border p-5 shadow-xl" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
              <h3 className="mb-4 text-xl font-black tracking-tight" style={{ color: theme.textHeading }}>
                Redes e links
              </h3>
              {socialLinks.length > 0 ? <SocialGrid links={socialLinks} theme={theme} /> : <EmptyCard theme={theme} text="Nenhum link cadastrado." compact />}
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="px-5 py-10 md:px-8" style={{ background: theme.bannerFrom }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white">
              <Sparkles size={19} />
            </div>
            <div>
              <p className="m-0 text-sm font-black text-white">Espalhe Melodias</p>
              <p className="m-0 mt-1 text-xs font-semibold text-white/40">Comunidade de saúde mental</p>
            </div>
          </div>

          <p className="m-0 text-xs font-semibold text-white/35">
            © {new Date().getFullYear()} Espalhe Melodias. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}

function NavItem({ href, label, scrolled, theme }: { href: string; label: string; scrolled: boolean; theme: ThemePalette }) {
  return (
    <a
      href={href}
      className="rounded-2xl px-4 py-3 text-sm font-bold no-underline transition hover:bg-white/15"
      style={{ color: scrolled ? theme.textHeading : 'rgba(255,255,255,0.78)' }}
    >
      {label}
    </a>
  );
}

function MobileNavItem({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <a href={href} onClick={onClick} className="rounded-2xl px-4 py-3 text-sm font-black text-slate-700 no-underline hover:bg-slate-50">
      {label}
    </a>
  );
}

function ProfileImage({
  professional,
  initials,
  theme,
  large = false,
}: {
  professional: Professional;
  initials: string;
  theme: ThemePalette;
  large?: boolean;
}) {
  const className = large ? 'aspect-[4/4] w-full' : 'aspect-[4/3] w-full rounded-[1.5rem]';

  if (professional.avatar) {
    return (
      <img
        src={professional.avatar}
        alt={professional.name}
        className={`${className} object-cover`}
        style={{ borderRadius: large ? '2rem 2rem 0 0' : '1.5rem' }}
      />
    );
  }

  return (
    <div
      className={`${className} grid place-items-center text-6xl font-black text-white`}
      style={{
        borderRadius: large ? '2rem 2rem 0 0' : '1.5rem',
        background: `linear-gradient(135deg, ${theme.bannerMid}, ${theme.accent})`,
      }}
    >
      <UserRound className="absolute opacity-10" size={180} />
      <span className="relative z-10">{initials}</span>
    </div>
  );
}

function InfoLine({ icon, label, theme }: { icon: React.ReactNode; label: string; theme: ThemePalette }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: theme.cardBorder, background: theme.pageBg }}>
      <span style={{ color: theme.accent }}>{icon}</span>
      <span className="text-sm font-bold" style={{ color: theme.textHeading }}>
        {label}
      </span>
    </div>
  );
}

function HeroStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/10 p-4 text-white backdrop-blur-xl">
      <div className="mb-2 text-white/55">{icon}</div>
      <p className="m-0 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="m-0 mt-1 line-clamp-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function SectionEyebrow({ children, theme }: { children: React.ReactNode; theme: ThemePalette }) {
  return (
    <p className="m-0 text-xs font-black uppercase tracking-[0.22em]" style={{ color: theme.accent }}>
      {children}
    </p>
  );
}

function DataCard({ icon, title, value, theme }: { icon: React.ReactNode; title: string; value: string; theme: ThemePalette }) {
  return (
    <Reveal>
      <div className="h-full rounded-[2rem] border p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl" style={{ background: theme.accentLight, color: theme.accent }}>
          {icon}
        </div>
        <p className="m-0 text-xs font-black uppercase tracking-[0.18em]" style={{ color: theme.accentMuted }}>
          {title}
        </p>
        <p className="m-0 mt-2 text-2xl font-black tracking-tight" style={{ color: theme.textHeading }}>
          {value}
        </p>
      </div>
    </Reveal>
  );
}

function EmptyCard({ theme, text, compact = false }: { theme: ThemePalette; text: string; compact?: boolean }) {
  return (
    <div
      className={`rounded-[2rem] border text-center ${compact ? 'p-5' : 'mt-12 p-10'}`}
      style={{ background: theme.cardBg, borderColor: theme.cardBorder, color: theme.textBody }}
    >
      <p className="m-0 text-sm font-semibold opacity-70">{text}</p>
    </div>
  );
}

function FloatingOrnaments() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="float-one absolute left-[7%] top-[22%] h-24 w-24 rounded-full border border-white/10" />
      <div className="float-two absolute bottom-[18%] right-[8%] h-32 w-32 rounded-full border border-white/10" />
      <div className="float-three absolute right-[28%] top-[16%] h-3 w-3 rounded-full bg-white/40" />
      <div className="float-two absolute bottom-[24%] left-[35%] h-2 w-2 rounded-full bg-white/30" />
    </div>
  );
}

function buildSocialLinks(professional: Professional): SocialLink[] {
  const links: SocialLink[] = [];

  if (professional.contact_whatsapp) {
    links.push({ type: 'whatsapp', url: `https://wa.me/${onlyDigits(professional.contact_whatsapp)}`, label: 'WhatsApp' });
  }

  if (professional.instagram) {
    links.push({
      type: 'instagram',
      url: professional.instagram.startsWith('http')
        ? professional.instagram
        : `https://instagram.com/${professional.instagram.replace('@', '')}`,
      label: 'Instagram',
    });
  }

  if (professional.linkedin) {
    links.push({
      type: 'linkedin',
      url: professional.linkedin.startsWith('http')
        ? professional.linkedin
        : `https://linkedin.com/in/${professional.linkedin}`,
      label: 'LinkedIn',
    });
  }

  if (professional.facebook) {
    links.push({
      type: 'facebook',
      url: professional.facebook.startsWith('http')
        ? professional.facebook
        : `https://facebook.com/${professional.facebook}`,
      label: 'Facebook',
    });
  }

  if (professional.tiktok) {
    links.push({
      type: 'tiktok',
      url: professional.tiktok.startsWith('http')
        ? professional.tiktok
        : `https://tiktok.com/@${professional.tiktok.replace('@', '')}`,
      label: 'TikTok',
    });
  }

  if (professional.twitter) {
    links.push({
      type: 'twitter',
      url: professional.twitter.startsWith('http')
        ? professional.twitter
        : `https://twitter.com/${professional.twitter.replace('@', '')}`,
      label: 'Twitter / X',
    });
  }

  if (professional.website) {
    links.push({ type: 'website', url: normalizeUrl(professional.website), label: 'Site' });
  }

  professional.extra_links?.forEach((link) => {
    if (link.url) links.push({ type: 'link', url: normalizeUrl(link.url), label: link.label || 'Link' });
  });

  return links;
}

function SocialGrid({ links, theme }: { links: SocialLink[]; theme: ThemePalette }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {links.map((link, index) => (
        <a
          key={`${link.type}-${index}`}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-2xl border px-4 py-4 text-sm font-black no-underline transition hover:-translate-y-0.5 hover:shadow-lg"
          style={{ background: theme.pageBg, borderColor: theme.cardBorder, color: theme.textHeading }}
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl text-white" style={{ background: socialColor(link.type) }}>
            {socialIcon(link.type)}
          </span>
          <span>{link.label}</span>
          <ArrowRight className="ml-auto opacity-40 transition group-hover:translate-x-1 group-hover:opacity-80" size={17} />
        </a>
      ))}
    </div>
  );
}

function socialColor(type: string) {
  const colors: Record<string, string> = {
    whatsapp: 'linear-gradient(135deg,#22c55e,#16a34a)',
    instagram: 'linear-gradient(135deg,#f97316,#db2777,#7c3aed)',
    linkedin: 'linear-gradient(135deg,#0a66c2,#0284c7)',
    facebook: 'linear-gradient(135deg,#1877f2,#1d4ed8)',
    tiktok: 'linear-gradient(135deg,#020617,#334155)',
    twitter: 'linear-gradient(135deg,#0f172a,#38bdf8)',
    website: 'linear-gradient(135deg,#475569,#0f172a)',
    link: 'linear-gradient(135deg,#64748b,#334155)',
  };

  return colors[type] || colors.link;
}

function socialIcon(type: string) {
  if (type === 'whatsapp') return <MessageCircle size={18} />;
  if (type === 'website') return <Globe2 size={18} />;
  return <LinkIcon size={18} />;
}

function profileStyles(theme: ThemePalette) {
  return `
    html { scroll-behavior: smooth; }

    .profile-grid {
      background-image:
        linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px);
      background-size: 64px 64px;
      mask-image: radial-gradient(circle at 50% 42%, black, transparent 72%);
    }

    .animate-hero-in {
      animation: heroIn .85s cubic-bezier(.22,1,.36,1) both;
    }

    .animate-card-in {
      animation: cardIn .95s cubic-bezier(.22,1,.36,1) .12s both;
    }

    .float-one { animation: floatOne 9s ease-in-out infinite; }
    .float-two { animation: floatTwo 11s ease-in-out infinite; }
    .float-three { animation: floatThree 7s ease-in-out infinite; }

    ::selection {
      background: ${theme.accent};
      color: white;
    }

    @keyframes heroIn {
      from { opacity: 0; transform: translateY(28px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes cardIn {
      from { opacity: 0; transform: translateY(36px) scale(.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes floatOne {
      0%, 100% { transform: translate3d(0,0,0) rotate(0deg); }
      50% { transform: translate3d(18px,-24px,0) rotate(12deg); }
    }

    @keyframes floatTwo {
      0%, 100% { transform: translate3d(0,0,0) rotate(0deg); }
      50% { transform: translate3d(-18px,20px,0) rotate(-10deg); }
    }

    @keyframes floatThree {
      0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: .35; }
      50% { transform: translate3d(0,-18px,0) scale(1.5); opacity: .75; }
    }
  `;
}
