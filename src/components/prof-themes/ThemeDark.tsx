// Tema 4 — Dark Luxe: escuro premium, elegante e com estrutura de sistema moderno
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Clock3,
  Globe,
  Instagram,
  Linkedin,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import type { Professional } from '../../lib/api';

interface Props {
  professional: Professional;
}

type ContactLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
  variant: 'whatsapp' | 'instagram' | 'linkedin' | 'website';
};

function onlyDigits(value = '') {
  return value.replace(/\D/g, '');
}

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeUrl(value = '') {
  if (!value) return '';
  return value.startsWith('http') ? value : `https://${value}`;
}

function hexToRgb(hex: string) {
  if (!hex.startsWith('#')) return '184, 132, 92';

  const normalized = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;

  const value = normalized.replace('#', '');
  const number = parseInt(value, 16);

  const r = (number >> 16) & 255;
  const g = (number >> 8) & 255;
  const b = number & 255;

  return `${r}, ${g}, ${b}`;
}

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export default function ThemeDark({ professional }: Props) {
  const accent = professional.accent_color || '#c89b6d';
  const accentRgb = hexToRgb(accent);
  const initials = getInitials(professional.name);
  const firstName = professional.name?.split(' ')?.[0] || professional.name;

  const rating = toNumber(professional.rating);
  const reviews = toNumber(professional.reviews_count);
  const price = toNumber(professional.price_per_session);

  const whatsappUrl = professional.contact_whatsapp
    ? `https://wa.me/${onlyDigits(professional.contact_whatsapp)}?text=${encodeURIComponent(`Olá, ${professional.name.split(' ')[0]}! Vim através da Rede Espalhe Melodias e gostaria de saber mais sobre seu atendimento.`)}`
    : '';

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const contactLinks = useMemo<ContactLink[]>(() => {
    const links: ContactLink[] = [];

    if (whatsappUrl) {
      links.push({
        label: 'WhatsApp',
        href: whatsappUrl,
        icon: <Phone size={17} />,
        variant: 'whatsapp',
      });
    }

    if (professional.instagram) {
      links.push({
        label: 'Instagram',
        href: professional.instagram.startsWith('http')
          ? professional.instagram
          : `https://instagram.com/${professional.instagram.replace('@', '')}`,
        icon: <Instagram size={17} />,
        variant: 'instagram',
      });
    }

    if (professional.linkedin) {
      links.push({
        label: 'LinkedIn',
        href: professional.linkedin.startsWith('http')
          ? professional.linkedin
          : `https://linkedin.com/in/${professional.linkedin}`,
        icon: <Linkedin size={17} />,
        variant: 'linkedin',
      });
    }

    if (professional.website) {
      links.push({
        label: 'Website',
        href: normalizeUrl(professional.website),
        icon: <Globe size={17} />,
        variant: 'website',
      });
    }

    return links;
  }, [professional.instagram, professional.linkedin, professional.website, whatsappUrl]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 42);
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#060608] text-white antialiased"
      style={{
        fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
        ['--accent' as string]: accent,
        ['--accent-rgb' as string]: accentRgb,
      }}
    >
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        .luxe-bg {
          background:
            radial-gradient(circle at 15% 12%, rgba(var(--accent-rgb), .28), transparent 28%),
            radial-gradient(circle at 80% 10%, rgba(255,255,255,.08), transparent 22%),
            radial-gradient(circle at 70% 78%, rgba(var(--accent-rgb), .16), transparent 28%),
            linear-gradient(135deg, #060608 0%, #0b0b12 45%, #050507 100%);
        }

        .luxe-grid {
          background-image:
            linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(circle at 50% 36%, black, transparent 70%);
        }

        .luxe-noise {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,.07) 1px, transparent 0);
          background-size: 22px 22px;
        }

        .luxe-border {
          position: relative;
        }

        .luxe-border::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(255,255,255,.18), rgba(var(--accent-rgb), .28), rgba(255,255,255,.04));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .luxe-reveal {
          animation: luxeReveal .85s cubic-bezier(.22, 1, .36, 1) both;
        }

        .luxe-card-in {
          animation: luxeCardIn .95s cubic-bezier(.22, 1, .36, 1) .08s both;
        }

        .luxe-float {
          animation: luxeFloat 8s ease-in-out infinite;
        }

        .luxe-shimmer {
          position: relative;
          overflow: hidden;
        }

        .luxe-shimmer::after {
          content: '';
          position: absolute;
          inset: -40%;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.11), transparent 70%);
          transform: translateX(-65%);
          transition: transform .9s ease;
        }

        .luxe-shimmer:hover::after {
          transform: translateX(65%);
        }

        @keyframes luxeReveal {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes luxeCardIn {
          from { opacity: 0; transform: translateY(36px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes luxeFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(.6deg); }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 luxe-bg" />
      <div className="pointer-events-none fixed inset-0 luxe-grid opacity-70" />
      <div className="pointer-events-none fixed inset-0 luxe-noise opacity-[.18]" />

      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
        <div
          className="mx-auto flex w-[min(1180px,calc(100%-28px))] items-center justify-between rounded-[28px] px-3 py-3 backdrop-blur-2xl transition-all duration-500 md:px-4"
          style={{
            background: scrolled ? 'rgba(8,8,12,.82)' : 'rgba(255,255,255,.045)',
            border: scrolled ? '1px solid rgba(255,255,255,.10)' : '1px solid rgba(255,255,255,.075)',
            boxShadow: scrolled ? '0 24px 80px rgba(0,0,0,.42)' : '0 12px 42px rgba(0,0,0,.16)',
          }}
        >
          <a href="#inicio" className="group flex items-center gap-3 no-underline">
            <div
              className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-xl transition group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${accent}, rgba(${accentRgb}, .58))`,
                boxShadow: `0 18px 42px rgba(${accentRgb}, .24)`,
              }}
            >
              <Sparkles size={18} />
            </div>

            <div className="hidden sm:block">
              <p className="m-0 text-sm font-black tracking-[-.03em] text-white">Espalhe Melodias</p>
              <p className="m-0 mt-0.5 text-[10px] font-black uppercase tracking-[.2em] text-white/35">Perfil profissional</p>
            </div>
          </a>

          <div className="hidden items-center gap-1 rounded-2xl border border-white/[.07] bg-white/[.035] p-1 md:flex">
            <NavItem href="#sobre">Sobre</NavItem>
            <NavItem href="#servicos">Serviços</NavItem>
            <NavItem href="#autoridade">Autoridade</NavItem>
            <NavItem href="#contato">Contato</NavItem>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="luxe-shimmer inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black text-white no-underline transition hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${accent}, rgba(${accentRgb}, .76))`,
                  boxShadow: `0 18px 42px rgba(${accentRgb}, .24)`,
                }}
              >
                Agendar <ArrowRight size={15} />
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[.055] text-white md:hidden"
            aria-label="Abrir menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="mx-auto mt-2 grid w-[min(1180px,calc(100%-28px))] gap-1 rounded-[28px] border border-white/10 bg-[#09090e]/95 p-3 shadow-2xl backdrop-blur-2xl md:hidden">
            <MobileNavItem href="#sobre" onClick={() => setMenuOpen(false)}>Sobre</MobileNavItem>
            <MobileNavItem href="#servicos" onClick={() => setMenuOpen(false)}>Serviços</MobileNavItem>
            <MobileNavItem href="#autoridade" onClick={() => setMenuOpen(false)}>Autoridade</MobileNavItem>
            <MobileNavItem href="#contato" onClick={() => setMenuOpen(false)}>Contato</MobileNavItem>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white"
                style={{ background: accent }}
              >
                <MessageCircle size={17} /> Agendar conversa
              </a>
            )}
          </div>
        )}
      </nav>

      <main id="inicio" className="relative z-10">
        {/* ── HERO ── */}
        <section className="relative px-5 pb-16 pt-28 md:px-8 md:pt-32">
          <div className="mx-auto w-full max-w-6xl">

            {/* Mobile: avatar + nome empilhados; Desktop: 2 colunas */}
            <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:gap-14 lg:text-left">

              {/* Avatar — aparece ANTES do texto no mobile */}
              <div className="luxe-card-in order-first shrink-0 lg:order-last lg:ml-auto">
                <div className="relative mx-auto w-[220px] sm:w-[280px] lg:w-[340px]">
                  <div className="absolute -inset-6 rounded-[3rem] blur-[70px]"
                    style={{ background: `rgba(${accentRgb}, .22)` }} />
                  <div className="luxe-border relative overflow-hidden rounded-[2.2rem] bg-white/[.055] p-2.5 shadow-[0_40px_120px_rgba(0,0,0,.5)] backdrop-blur-2xl">
                    {professional.avatar ? (
                      <img src={professional.avatar} alt={professional.name}
                        className="aspect-square w-full rounded-[1.8rem] object-cover object-top" />
                    ) : (
                      <div className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-[1.8rem]"
                        style={{ background: `linear-gradient(135deg, rgba(255,255,255,.06), rgba(${accentRgb}, .22))` }}>
                        <UserRound size={120} className="text-white/[.06]" />
                        <span className="absolute text-5xl font-black" style={{ color: accent }}>{initials}</span>
                      </div>
                    )}
                    {/* Info badge abaixo da foto */}
                    <div className="px-3 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="m-0 text-[9px] font-black uppercase tracking-[.22em]" style={{ color: accent }}>Perfil verificado</p>
                          <p className="m-0 mt-0.5 text-base font-black text-white">{firstName}</p>
                        </div>
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border"
                          style={{ borderColor: `rgba(${accentRgb}, .24)`, background: `rgba(${accentRgb}, .10)`, color: accent }}>
                          <ShieldCheck size={18} />
                        </div>
                      </div>
                      {professional.location && (
                        <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-white/[.06] bg-white/[.04] px-3 py-2">
                          <MapPin size={13} style={{ color: accent }} />
                          <span className="truncate text-[11px] font-semibold text-white/55">{professional.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Texto */}
              <div className="luxe-reveal flex-1 min-w-0">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[.16em]"
                  style={{ borderColor: `rgba(${accentRgb}, .28)`, background: `rgba(${accentRgb}, .09)`, color: accent }}>
                  <BadgeCheck size={13} /> Profissional verificado
                </div>

                <h1 className="m-0 text-4xl font-black leading-[.9] tracking-[-.06em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  {professional.name}
                </h1>

                {professional.crp && (
                  <p className="mt-3 font-mono text-[11px] font-black uppercase tracking-[.2em]"
                    style={{ color: `rgba(${accentRgb}, .75)` }}>
                    {professional.crp}
                  </p>
                )}

                {professional.specialties?.length > 0 && (
                  <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
                    {professional.specialties.slice(0, 5).map(s => (
                      <span key={s} className="rounded-full border border-white/[.07] bg-white/[.04] px-3.5 py-1.5 text-xs font-semibold text-white/50">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {professional.bio && (
                  <p className="mt-6 text-sm leading-7 text-white/45 md:text-base md:leading-8 max-w-xl mx-auto lg:mx-0">
                    {professional.bio.slice(0, 200)}{professional.bio.length > 200 ? '...' : ''}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                  {whatsappUrl && (
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                      className="luxe-shimmer group inline-flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-black text-white no-underline transition hover:-translate-y-0.5"
                      style={{ background: `linear-gradient(135deg, ${accent}, rgba(${accentRgb},.72))`, boxShadow: `0 20px 50px rgba(${accentRgb},.28)` }}>
                      <MessageCircle size={17} /> Entrar em contato
                      <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                    </a>
                  )}
                  <a href="#sobre"
                    className="inline-flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[.04] px-6 py-3.5 text-sm font-black text-white/70 no-underline backdrop-blur-xl transition hover:bg-white/[.07]">
                    Ver perfil <ChevronRight size={15} />
                  </a>
                </div>

                {/* Métricas */}
                {(professional.services?.length || rating > 0 || reviews > 0) && (
                  <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
                    {professional.services?.length > 0 && (
                      <HeroMetric value={`${professional.services.length}+`} label="serviços" />
                    )}
                    {rating > 0 && <HeroMetric value={rating.toFixed(1)} label="avaliação" />}
                    {reviews > 0 && <HeroMetric value={`${reviews}+`} label="avaliações" />}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="sobre" className="mx-auto max-w-6xl px-5 py-20 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[.76fr_1.24fr]">
            <div>
              <SectionLabel accent={accent}>Sobre</SectionLabel>
              <h2 className="mt-4 max-w-lg text-4xl font-black leading-tight tracking-[-.055em] text-white md:text-5xl">
                Uma presença profissional para acolher, orientar e cuidar.
              </h2>
            </div>

            <div className="luxe-border rounded-[2.2rem] bg-white/[.04] p-7 backdrop-blur-2xl md:p-9">
              <p className="m-0 text-base leading-8 text-white/55 md:text-lg md:leading-9">
                {professional.bio || 'Perfil profissional verificado na Rede Espalhe Melodias.'}
              </p>
            </div>
          </div>
        </section>

        {professional.services?.length > 0 && (
          <section id="servicos" className="mx-auto max-w-6xl px-5 py-20 md:px-8">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <SectionLabel accent={accent}>Serviços</SectionLabel>
                <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-.055em] text-white md:text-5xl">
                  Como posso ajudar
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-white/42">
                Serviços cadastrados para facilitar o primeiro contato e direcionar sua necessidade.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {professional.services.map((service, index) => (
                <div
                  key={service}
                  className="group rounded-[2rem] border border-white/[.07] bg-white/[.035] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/[.14] hover:bg-white/[.055]"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div
                      className="grid h-12 w-12 place-items-center rounded-2xl border"
                      style={{
                        borderColor: `rgba(${accentRgb}, .26)`,
                        background: `rgba(${accentRgb}, .12)`,
                        color: accent,
                      }}
                    >
                      <Check size={19} />
                    </div>
                    <ChevronRight size={19} className="text-white/18 transition group-hover:translate-x-1 group-hover:text-white/45" />
                  </div>

                  <h3 className="m-0 text-lg font-black tracking-[-.03em] text-white">
                    {service}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/42">
                    Atendimento com ética, acolhimento e direcionamento profissional.
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="autoridade" className="mx-auto max-w-6xl px-5 py-20 md:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {professional.crp && (
              <AuthorityCard icon={<ShieldCheck size={23} />} title="Registro" value={professional.crp} accent={accent} accentRgb={accentRgb} />
            )}
            {professional.location && (
              <AuthorityCard icon={<MapPin size={23} />} title="Localização" value={professional.location} accent={accent} accentRgb={accentRgb} />
            )}
            {professional.schedule?.length > 0 && (
              <AuthorityCard icon={<Clock3 size={23} />} title="Agenda" value={`${professional.schedule.length} horário(s)`} accent={accent} accentRgb={accentRgb} />
            )}
          </div>
        </section>

        {professional.schedule?.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
            <SectionLabel accent={accent}>Horários</SectionLabel>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {professional.schedule.map((slot, index) => (
                <span
                  key={`${slot.day}-${index}`}
                  className="rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs font-black text-white/50 backdrop-blur-xl"
                >
                  {slot.day} {slot.hours}
                </span>
              ))}
            </div>
          </section>
        )}

        <section id="contato" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
          <div
            className="relative overflow-hidden rounded-[2.8rem] border p-7 text-center shadow-[0_45px_150px_rgba(0,0,0,.45)] md:p-12"
            style={{
              borderColor: `rgba(${accentRgb}, .22)`,
              background: `linear-gradient(135deg, rgba(${accentRgb}, .18), rgba(255,255,255,.035))`,
            }}
          >
            <div
              className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[115px]"
              style={{ background: `rgba(${accentRgb}, .28)` }}
            />

            <div className="relative z-10 mx-auto max-w-3xl">
              <SectionLabel accent={accent}>Contato</SectionLabel>
              <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-.06em] text-white md:text-6xl">
                Vamos conversar?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/48">
                O primeiro passo pode ser simples. Entre em contato para verificar disponibilidade, tirar dúvidas ou agendar um atendimento.
              </p>

              <div className="mt-9 flex flex-wrap justify-center gap-3">
                {contactLinks.length > 0 ? (
                  contactLinks.map((link) => (
                    <ContactButton key={link.label} link={link} accent={accent} accentRgb={accentRgb} />
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[.04] px-5 py-4 text-sm font-bold text-white/45">
                    Nenhum canal de contato cadastrado.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[.07] px-5 py-8 text-center">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[.18em] text-white/25">
          Membro verificado · <span style={{ color: accent }}>Rede Espalhe Melodias</span>
        </p>
      </footer>
    </div>
  );
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-2xl px-4 py-2.5 text-xs font-black text-white/45 no-underline transition hover:bg-white/[.07] hover:text-white"
    >
      {children}
    </a>
  );
}

function MobileNavItem({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="rounded-2xl px-4 py-3 text-sm font-bold text-white/65 no-underline transition hover:bg-white/[.06] hover:text-white"
    >
      {children}
    </a>
  );
}

function SectionLabel({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <p className="m-0 text-[10px] font-black uppercase tracking-[.25em]" style={{ color: accent }}>
      {children}
    </p>
  );
}

function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/[.075] bg-white/[.04] p-4 backdrop-blur-xl">
      <p className="m-0 text-2xl font-black tracking-[-.04em] text-white">{value}</p>
      <p className="m-0 mt-1 text-[10px] font-black uppercase tracking-[.18em] text-white/32">{label}</p>
    </div>
  );
}

function MiniInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[.07] bg-white/[.04] px-4 py-3">
      <div className="flex min-w-0 items-center gap-2 text-white/35">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-[.16em]">{label}</span>
      </div>
      <span className="max-w-[48%] truncate text-sm font-black text-white/75">{value}</span>
    </div>
  );
}

function AuthorityCard({
  icon,
  title,
  value,
  accent,
  accentRgb,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  accent: string;
  accentRgb: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/[.075] bg-white/[.035] p-6 backdrop-blur-xl">
      <div
        className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border"
        style={{
          color: accent,
          borderColor: `rgba(${accentRgb}, .24)`,
          background: `rgba(${accentRgb}, .11)`,
        }}
      >
        {icon}
      </div>
      <p className="m-0 text-[10px] font-black uppercase tracking-[.2em] text-white/32">{title}</p>
      <p className="m-0 mt-2 text-lg font-black tracking-[-.03em] text-white">{value}</p>
    </div>
  );
}

function ContactButton({
  link,
  accent,
  accentRgb,
}: {
  link: ContactLink;
  accent: string;
  accentRgb: string;
}) {
  const styleByVariant: Record<ContactLink['variant'], React.CSSProperties> = {
    whatsapp: {
      background: '#25d366',
      boxShadow: '0 18px 42px rgba(37,211,102,.25)',
      color: '#fff',
    },
    instagram: {
      background: 'linear-gradient(135deg,#f97316,#db2777,#7c3aed)',
      color: '#fff',
    },
    linkedin: {
      background: 'linear-gradient(135deg,#0a66c2,#0284c7)',
      color: '#fff',
    },
    website: {
      background: 'rgba(255,255,255,.055)',
      border: '1px solid rgba(255,255,255,.10)',
      color: 'rgba(255,255,255,.86)',
      boxShadow: `0 18px 42px rgba(${accentRgb}, .08)`,
    },
  };

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 rounded-2xl px-6 py-4 text-sm font-black no-underline transition hover:-translate-y-1"
      style={styleByVariant[link.variant] || { background: accent }}
    >
      {link.icon}
      {link.label}
      <ChevronRight size={16} className="transition group-hover:translate-x-1" />
    </a>
  );
}
