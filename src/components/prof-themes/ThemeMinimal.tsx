// Tema 2 — Minimal Premium: clean, elegante, responsivo e com cara de produto profissional
import React, { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Globe,
  Instagram,
  Linkedin,
  Mail,
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
  variant: 'primary' | 'soft' | 'outline' | 'dark';
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

function withAlpha(hex: string, alpha: string) {
  if (!hex.startsWith('#')) return hex;
  if (hex.length === 4) {
    const r = hex[1];
    const g = hex[2];
    const b = hex[3];
    return `#${r}${r}${g}${g}${b}${b}${alpha}`;
  }
  return `${hex}${alpha}`;
}

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export default function ThemeMinimal({ professional }: Props) {
  const accent = professional.accent_color || '#9b6a4c';
  const accentSoft = withAlpha(accent, '14');
  const accentSofter = withAlpha(accent, '0A');
  const accentBorder = withAlpha(accent, '24');
  const initials = getInitials(professional.name);
  const rating = toNumber(professional.rating);
  const reviews = toNumber(professional.reviews_count);
  const price = toNumber(professional.price_per_session);
  const whatsappUrl = professional.contact_whatsapp ? `https://wa.me/${onlyDigits(professional.contact_whatsapp)}?text=${encodeURIComponent(`Olá, ${professional.name.split(' ')[0]}! Vim através da Rede Espalhe Melodias e gostaria de saber mais sobre seu atendimento.`)}` : '';
  const [menuOpen, setMenuOpen] = useState(false);

  const firstName = professional.name?.split(' ')?.[0] || professional.name;

  const contactLinks = useMemo<ContactLink[]>(() => {
    const links: ContactLink[] = [];

    if (whatsappUrl) {
      links.push({
        label: 'WhatsApp',
        href: whatsappUrl,
        icon: <Phone size={16} />,
        variant: 'primary',
      });
    }

    if (professional.instagram) {
      links.push({
        label: 'Instagram',
        href: professional.instagram.startsWith('http')
          ? professional.instagram
          : `https://instagram.com/${professional.instagram.replace('@', '')}`,
        icon: <Instagram size={16} />,
        variant: 'dark',
      });
    }

    if (professional.linkedin) {
      links.push({
        label: 'LinkedIn',
        href: professional.linkedin.startsWith('http')
          ? professional.linkedin
          : `https://linkedin.com/in/${professional.linkedin}`,
        icon: <Linkedin size={16} />,
        variant: 'outline',
      });
    }

    if (professional.website) {
      links.push({
        label: 'Website',
        href: normalizeUrl(professional.website),
        icon: <Globe size={16} />,
        variant: 'outline',
      });
    }

    return links;
  }, [professional.instagram, professional.linkedin, professional.website, whatsappUrl]);

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-slate-900 antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif" }}
    >
      <style>{`
        html { scroll-behavior: smooth; }

        .minimal-noise {
          background-image:
            radial-gradient(circle at 1px 1px, rgba(15,23,42,.055) 1px, transparent 0);
          background-size: 26px 26px;
        }

        .minimal-grid {
          background-image:
            linear-gradient(rgba(15,23,42,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,.045) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(circle at center, black 0%, transparent 72%);
        }

        .minimal-reveal {
          animation: minimalReveal .8s cubic-bezier(.22,1,.36,1) both;
        }

        .minimal-card-in {
          animation: minimalCardIn .9s cubic-bezier(.22,1,.36,1) .08s both;
        }

        .minimal-float {
          animation: minimalFloat 9s ease-in-out infinite;
        }

        @keyframes minimalReveal {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes minimalCardIn {
          from { opacity: 0; transform: translateY(28px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes minimalFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 minimal-noise opacity-60" />
        <div className="absolute -top-40 right-[-12rem] h-[34rem] w-[34rem] rounded-full blur-3xl" style={{ background: accentSoft }} />
        <div className="absolute bottom-[-18rem] left-[-10rem] h-[34rem] w-[34rem] rounded-full blur-3xl" style={{ background: accentSofter }} />
      </div>

      <div className="relative z-10">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${withAlpha(accent, '88')}, transparent)` }} />

        <nav className="sticky top-0 z-50 border-b border-slate-900/[0.06] bg-[#fbfaf7]/85 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
            <a href="#inicio" className="flex items-center gap-3 no-underline">
              <AvatarMini professional={professional} initials={initials} accent={accent} />
              <div>
                <p className="m-0 text-sm font-black tracking-[-0.02em] text-slate-950">{firstName}</p>
                <p className="m-0 mt-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Perfil público</p>
              </div>
            </a>

            <div className="hidden items-center gap-1 md:flex">
              <NavLink href="#sobre">Sobre</NavLink>
              <NavLink href="#servicos">Serviços</NavLink>
              <NavLink href="#contato">Contato</NavLink>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5"
                  style={{ background: accent, boxShadow: `0 14px 32px ${withAlpha(accent, '30')}` }}
                >
                  Agendar <ChevronRight size={15} />
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-900/10 bg-white text-slate-900 shadow-sm md:hidden"
              aria-label="Abrir menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {menuOpen && (
            <div className="mx-5 mb-4 grid gap-1 rounded-3xl border border-slate-900/10 bg-white p-2 shadow-xl md:hidden">
              <MobileNavLink href="#sobre" onClick={() => setMenuOpen(false)}>Sobre</MobileNavLink>
              <MobileNavLink href="#servicos" onClick={() => setMenuOpen(false)}>Serviços</MobileNavLink>
              <MobileNavLink href="#contato" onClick={() => setMenuOpen(false)}>Contato</MobileNavLink>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white"
                  style={{ background: accent }}
                >
                  <MessageCircle size={17} /> Agendar
                </a>
              )}
            </div>
          )}
        </nav>

        <main id="inicio" className="mx-auto max-w-6xl px-5 md:px-8">
          <section className="relative grid min-h-[calc(100vh-84px)] items-center gap-12 py-16 md:grid-cols-[1.05fr_.95fr] md:py-24">
            <div className="minimal-grid pointer-events-none absolute inset-0 opacity-70" />

            <div className="minimal-reveal relative z-10">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.16em] shadow-sm"
                style={{ borderColor: accentBorder, color: accent }}>
                <BadgeCheck size={14} /> Verificado · Espalhe Melodias
              </div>

              <h1 className="m-0 max-w-4xl text-[3.4rem] font-black leading-[.9] tracking-[-0.075em] text-slate-950 sm:text-7xl lg:text-8xl">
                {professional.name}
              </h1>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                {professional.crp && (
                  <span className="rounded-full border border-slate-900/10 bg-white px-4 py-2 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                    {professional.crp}
                  </span>
                )}

                {rating > 0 && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black text-amber-700">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    {rating.toFixed(1)} {reviews > 0 ? `(${reviews})` : ''}
                  </span>
                )}

                {professional.location && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
                    <MapPin size={14} style={{ color: accent }} />
                    {professional.location}
                  </span>
                )}
              </div>

              {professional.specialties?.length > 0 && (
                <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-500 md:text-xl">
                  {professional.specialties.slice(0, 5).join(' · ')}
                  {professional.specialties.length > 5 ? ` · +${professional.specialties.length - 5}` : ''}
                </p>
              )}

              <div className="mt-10 flex flex-wrap gap-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-black text-white shadow-xl transition hover:-translate-y-1"
                    style={{ background: accent, boxShadow: `0 18px 45px ${withAlpha(accent, '35')}` }}
                  >
                    <MessageCircle size={19} /> Entrar em contato
                    <ChevronRight size={17} className="transition group-hover:translate-x-1" />
                  </a>
                )}

                <a
                  href="#sobre"
                  className="inline-flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-white px-6 py-4 text-sm font-black text-slate-900 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  Conhecer perfil
                </a>
              </div>
            </div>

            <div className="minimal-card-in relative z-10 mx-auto w-full max-w-[430px] md:ml-auto">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-white/70 blur-2xl" />
              <div className="minimal-float relative rounded-[2rem] border border-slate-900/[0.08] bg-white p-3 shadow-[0_30px_90px_rgba(15,23,42,.10)]">
                <div className="overflow-hidden rounded-[1.55rem] bg-slate-100">
                  <ProfilePhoto professional={professional} initials={initials} accent={accent} />
                </div>

                <div className="p-5">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="m-0 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>Profissional</p>
                      <h2 className="m-0 mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">{firstName}</h2>
                    </div>
                    <div className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: accentSoft, color: accent }}>
                      <ShieldCheck size={22} />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {price > 0 && <MiniInfo label="Sessão" value={formatCurrency(price)} accent={accent} />}
                    {professional.services?.length > 0 && <MiniInfo label="Serviços" value={`${professional.services.length} opções`} accent={accent} />}
                    {professional.languages?.length > 0 && <MiniInfo label="Idiomas" value={professional.languages.join(', ')} accent={accent} />}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="sobre" className="grid gap-10 py-20 md:grid-cols-[.75fr_1.25fr] md:py-24">
            <div>
              <SectionLabel accent={accent}>Sobre</SectionLabel>
              <h2 className="mt-4 max-w-sm text-4xl font-black leading-tight tracking-[-0.055em] text-slate-950 md:text-5xl">
                Cuidado profissional com presença e leveza.
              </h2>
            </div>

            <div className="rounded-[2rem] border border-slate-900/[0.08] bg-white p-7 shadow-sm md:p-9">
              {professional.bio ? (
                <p className="m-0 text-lg leading-9 text-slate-600 md:text-xl md:leading-10">{professional.bio}</p>
              ) : (
                <p className="m-0 text-lg leading-9 text-slate-500">Perfil profissional verificado na Rede Espalhe Melodias.</p>
              )}
            </div>
          </section>

          {professional.specialties?.length > 0 && (
            <section className="border-t border-slate-900/[0.06] py-16">
              <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <SectionLabel accent={accent}>Especialidades</SectionLabel>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] text-slate-950 md:text-4xl">Áreas de atuação</h2>
                </div>
                <p className="max-w-md text-sm leading-6 text-slate-500">Temas e demandas que fazem parte da prática profissional cadastrada.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {professional.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm"
                    style={{ borderColor: accentBorder }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                    {specialty}
                  </span>
                ))}
              </div>
            </section>
          )}

          {professional.services?.length > 0 && (
            <section id="servicos" className="border-t border-slate-900/[0.06] py-20">
              <div className="mb-9 max-w-2xl">
                <SectionLabel accent={accent}>Serviços</SectionLabel>
                <h2 className="mt-3 text-4xl font-black leading-tight tracking-[-0.055em] text-slate-950 md:text-5xl">Como posso ajudar</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {professional.services.map((service, index) => (
                  <div
                    key={service}
                    className="group rounded-[1.6rem] border border-slate-900/[0.08] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl" style={{ background: accentSoft, color: accent }}>
                        <Check size={18} />
                      </div>
                      <ChevronRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500" />
                    </div>
                    <h3 className="m-0 text-base font-black tracking-[-0.02em] text-slate-900">{service}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">Atendimento com ética, escuta qualificada e direcionamento profissional.</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {professional.schedule?.length > 0 && (
            <section className="border-t border-slate-900/[0.06] py-16">
              <SectionLabel accent={accent}>Agenda</SectionLabel>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {professional.schedule.map((slot, index) => (
                  <span
                    key={`${slot.day}-${index}`}
                    className="rounded-2xl border bg-white px-4 py-3 text-xs font-black shadow-sm"
                    style={{ borderColor: accentBorder, color: accent }}
                  >
                    {slot.day} {slot.hours}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section id="contato" className="py-20">
            <div className="relative overflow-hidden rounded-[2.4rem] border border-slate-900/[0.08] bg-white p-7 shadow-[0_30px_90px_rgba(15,23,42,.08)] md:p-10">
              <div className="absolute right-[-8rem] top-[-8rem] h-72 w-72 rounded-full blur-3xl" style={{ background: accentSoft }} />
              <div className="relative z-10 grid gap-10 md:grid-cols-[1fr_.9fr] md:items-center">
                <div>
                  <SectionLabel accent={accent}>Contato</SectionLabel>
                  <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight tracking-[-0.055em] text-slate-950 md:text-5xl">
                    Pronto para iniciar uma conversa?
                  </h2>
                  <p className="mt-5 max-w-xl text-base leading-8 text-slate-500">
                    Entre em contato para verificar disponibilidade, tirar dúvidas ou agendar um atendimento.
                  </p>
                </div>

                <div className="grid gap-3">
                  {contactLinks.length > 0 ? (
                    contactLinks.map((link) => <ContactButton key={link.label} link={link} accent={accent} />)
                  ) : (
                    <div className="rounded-2xl border border-slate-900/[0.08] bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                      Nenhum canal de contato cadastrado.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-900/[0.06] px-5 py-8 md:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400 md:justify-start">
              <Sparkles size={14} style={{ color: accent }} />
              Rede Espalhe Melodias
            </div>
            <p className="m-0 text-xs font-semibold text-slate-400">Profissional verificado · Perfil público</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function AvatarMini({ professional, initials, accent }: { professional: Professional; initials: string; accent: string }) {
  if (professional.avatar) {
    return <img src={professional.avatar} alt={professional.name} className="h-10 w-10 rounded-2xl object-cover shadow-sm" />;
  }

  return (
    <div className="grid h-10 w-10 place-items-center rounded-2xl text-xs font-black text-white shadow-sm" style={{ background: accent }}>
      {initials}
    </div>
  );
}

function ProfilePhoto({ professional, initials, accent }: { professional: Professional; initials: string; accent: string }) {
  if (professional.avatar) {
    return <img src={professional.avatar} alt={professional.name} className="aspect-[4/4.4] w-full object-cover" />;
  }

  return (
    <div className="relative grid aspect-[4/4.4] w-full place-items-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${withAlpha(accent, 'CC')}, ${accent})` }}>
      <UserRound className="absolute text-white/10" size={210} />
      <span className="relative z-10 text-7xl font-black text-white">{initials}</span>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="rounded-full px-4 py-2.5 text-xs font-black text-slate-500 no-underline transition hover:bg-white hover:text-slate-950 hover:shadow-sm">
      {children}
    </a>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <a href={href} onClick={onClick} className="rounded-2xl px-4 py-3 text-sm font-black text-slate-700 no-underline transition hover:bg-slate-50">
      {children}
    </a>
  );
}

function SectionLabel({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <p className="m-0 text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: accent }}>
      {children}
    </p>
  );
}

function MiniInfo({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-900/[0.06] bg-slate-50 px-4 py-3">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</span>
      <span className="max-w-[55%] truncate text-sm font-black text-slate-900" style={{ color: label === 'Sessão' ? accent : undefined }}>
        {value}
      </span>
    </div>
  );
}

function ContactButton({ link, accent }: { link: ContactLink; accent: string }) {
  const styles: Record<ContactLink['variant'], string> = {
    primary: 'text-white shadow-xl',
    soft: 'border border-slate-900/[0.08] bg-slate-50 text-slate-900',
    outline: 'border border-slate-900/[0.08] bg-white text-slate-900 shadow-sm',
    dark: 'bg-slate-950 text-white shadow-xl',
  };

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-black no-underline transition hover:-translate-y-1 ${styles[link.variant]}`}
      style={link.variant === 'primary' ? { background: accent, boxShadow: `0 18px 40px ${withAlpha(accent, '30')}` } : undefined}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">{link.icon}</span>
      {link.label}
      <ChevronRight size={17} className="ml-auto opacity-45 transition group-hover:translate-x-1 group-hover:opacity-80" />
    </a>
  );
}
