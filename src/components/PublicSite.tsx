import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  Music,
  Heart,
  Users,
  Star,
  Calendar,
  BookOpen,
  Image,
  ChevronRight,
  ChevronLeft,
  X,
  Menu,
  LogIn,
  ExternalLink,
  MapPin,
  Clock,
  Eye,
  Tag,
  Target,
  Instagram,
  Mail,
  Globe,
  Sparkles,
  Play,
  Quote,
  CheckCircle2,
  Loader2,
  Send,
  Award,
  MessageSquare,
  TrendingUp,
  Smile,
  Smartphone,
  AlertCircle,
  Frown,
  ShieldCheck,
  HeartHandshake,
  Check,
  Facebook,
  Twitter,
  Copy,
} from 'lucide-react';
import { PublicBlogPost, HealthEvent } from '../types';
import { memberRequestsApi, newsletterApi, contactApi, resolveUploadUrl, blogsApi } from '../lib/api';
import { usePublicSiteData, convertBlogPost } from '../hooks/usePublicSiteData';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { InstagramStories } from './InstagramStories';
import { GoogleMap } from './ui/GoogleMap';
import { useToast } from './ui';
import logoFundoClaro from '../images/logo-para-fundo-claro.png';
import logoFundoEscuro from '../images/logo-para-fundo-escuro.png';
import espalheMelodias01 from '../images/espalhe-melodias-01.png';
import espalheMelodias02 from '../images/espalhe-melodias-02.png';
import espalheMelodias03 from '../images/espalhe-melodias-03.png';
import espalheMelodias04 from '../images/espalhe-melodias-04.png';
import fotoJessica from '../images/jessica.jpg';
import fotoKaren from '../images/karen_gomes.jpg';
import logoPsiflux from '../images/logo-psiflux.png';

/**
 * Faz parse de uma data "ingênua" (sem timezone) vinda da API, evitando o
 * deslocamento de ±1 dia que `new Date(stringISO)` sofre ao converter para o
 * timezone local do browser. Aceita "YYYY-MM-DD" ou "YYYY-MM-DDTHH:MM:SS...".
 */
function parseLocalDate(value: string): Date {
  const iso = value.includes('T') ? value.split('T')[0] : value;
  const [y, m, day] = iso.split('-').map(Number);
  return new Date(y, m - 1, day);
}

type PublicSection = 'home' | 'blog' | 'gallery' | 'events' | 'about' | 'contact';

const PUBLIC_SECTION_PATHS: Record<PublicSection, string> = {
  home: '/',
  about: '/quem-somos',
  blog: '/blog',
  gallery: '/galeria',
  events: '/eventos',
  contact: '/contato',
};

interface PublicSiteProps {
  blogs?: PublicBlogPost[];
  events?: HealthEvent[];
  initialSection?: PublicSection;
  onSectionChange?: (section: PublicSection) => void;
  onGoToLogin: () => void;
}

const ESPECIALIDADES_PUBLIC = [
  { value: 'Psicólogo(a)',            label: 'Psicólogo(a)' },
  { value: 'Psicopedagogo(a)',        label: 'Psicopedagogo(a)' },
  { value: 'Pediatra',               label: 'Pediatra' },
  { value: 'Psiquiatra',             label: 'Psiquiatra' },
  { value: 'Terapeuta Ocupacional',  label: 'Terapeuta Ocupacional' },
  { value: 'Médico(a)',              label: 'Médico(a)' },
  { value: 'outro',                  label: 'Outro...' },
];


interface RequestForm {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  specialtyCustom: string;
  gender: string;
  observation: string;
}

export default function PublicSite({ blogs: blogsProp, events: eventsProp, initialSection, onSectionChange, onGoToLogin }: PublicSiteProps) {
  // ── Hook para dados dinâmicos do site público ───────────────────────────────
  const publicSiteData = usePublicSiteData();
  const { show: showToast } = useToast();

  // ── Usar dados dinâmicos com fallback para props ────────────────────────────
  const blogs = blogsProp && blogsProp.length > 0 ? blogsProp : publicSiteData.blogs;
  const events = eventsProp && eventsProp.length > 0 ? eventsProp : publicSiteData.events;
  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  const pastEvents = events.filter(event => event.status === 'past');
  const instagramPosts = publicSiteData.instagramPosts;
  const stories: any[] = publicSiteData.stories;
  const galleryImages = publicSiteData.galleryPhotos.map((photo) => ({
    id: photo.id,
    url: resolveUploadUrl(photo.image_url),
    caption: photo.caption || 'Publicação da comunidade Espalhe Melodias',
    event: new Date(photo.created_at).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }));

  const [activeSection, setActiveSection] = useState<PublicSection>(initialSection ?? 'home');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState<string>('Todos');
  const [selectedBlog, setSelectedBlog] = useState<PublicBlogPost | null>(null);
  const [blogPostId, setBlogPostId] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/blog\/([^/]+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  });
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [igCarouselIndex, setIgCarouselIndex] = useState(0);

  // Trava o scroll da página enquanto o menu mobile/tablet está aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [mobileMenuOpen]);

  // ── Newsletter form states ───────────────────────────────────────────────────
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  // ── Contact form states ──────────────────────────────────────────────────────
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // ── Formulário de solicitação de membros ──────────────────────────────────
  const [requestForm, setRequestForm] = useState<RequestForm>({
    name: '', email: '', phone: '', specialty: '', specialtyCustom: '', gender: '', observation: '',
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.name.trim() || !requestForm.email.trim()) {
      setRequestError('Nome e e-mail são obrigatórios.');
      return;
    }
    setRequestLoading(true);
    setRequestError(null);
    try {
      const specialtyFinal = requestForm.specialty === 'outro'
        ? requestForm.specialtyCustom.trim()
        : requestForm.specialty;
      await memberRequestsApi.create({
        name:        requestForm.name.trim(),
        email:       requestForm.email.trim(),
        phone:       requestForm.phone.trim() || undefined,
        specialty:   specialtyFinal || undefined,
        gender:      requestForm.gender || undefined,
        observation: requestForm.observation.trim() || undefined,
      });
      setRequestSuccess(true);
    } catch (err: unknown) {
      setRequestError(err instanceof Error ? err.message : 'Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setRequestLoading(false);
    }
  };

  const setF = (key: keyof RequestForm, value: string) =>
    setRequestForm(prev => ({ ...prev, [key]: value }));

  const navLinks = [
    { id: 'home', label: 'Início' },
    { id: 'about', label: 'Quem Somos' },
    { id: 'blog', label: 'Blog' },
    { id: 'gallery', label: 'Galeria' },
    { id: 'events', label: 'Eventos' },
    { id: 'contact', label: 'Contato' },
  ] as const;

  const scrollTo = (section: PublicSection) => {
    setActiveSection(section);
    setBlogPostId(null);
    onSectionChange?.(section);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBlogPost = (post: PublicBlogPost) => {
    setSelectedBlog(post);
    setBlogPostId(post.slug || post.id);
    window.history.pushState(null, '', `/blog/${encodeURIComponent(post.slug || post.id)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeBlogPost = () => {
    setSelectedBlog(null);
    setBlogPostId(null);
    const fallbackPath = activeSection === 'blog' ? '/blog' : PUBLIC_SECTION_PATHS[activeSection];
    window.history.pushState(null, '', fallbackPath);
  };

  // Sincroniza com navegação externa (botão voltar/avançar do browser)
  useEffect(() => {
    if (initialSection && initialSection !== activeSection) {
      setActiveSection(initialSection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSection]);

  // Detecta URL /blog/:id no load e ao navegar via voltar/avançar do browser
  useEffect(() => {
    const syncFromUrl = () => {
      const match = window.location.pathname.match(/^\/blog\/([^/]+)$/);
      setBlogPostId(match ? decodeURIComponent(match[1]) : null);
    };
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  // Busca o post completo (com content) quando blogPostId muda (ex: acesso direto à URL)
  // blogPostId pode ser um slug (novo padrão) ou um UUID (links antigos já compartilhados)
  useEffect(() => {
    if (!blogPostId) { setSelectedBlog(null); return; }
    if ((selectedBlog?.id === blogPostId || selectedBlog?.slug === blogPostId) && selectedBlog.content) return;

    // Mostra a versão resumida (já carregada na listagem) enquanto busca a completa
    const found = blogs.find(b => b.id === blogPostId || b.slug === blogPostId);
    if (found) setSelectedBlog(found);

    let cancelled = false;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(blogPostId);
    const fetcher = isUuid ? blogsApi.get(blogPostId) : blogsApi.getBySlug(blogPostId);
    fetcher
      .then(full => { if (!cancelled) setSelectedBlog(convertBlogPost(full)); })
      .catch(() => { /* mantém a versão resumida ou null se falhar */ });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogPostId, blogs]);

  useDocumentMeta(
    blogPostId && selectedBlog
      ? {
          title: selectedBlog.title,
          description: selectedBlog.excerpt,
          image: selectedBlog.imageUrl || undefined,
          url: window.location.href,
          type: 'article',
          publishedAt: selectedBlog.date,
          author: selectedBlog.authorName,
        }
      : null,
  );

  // ── Validação de e-mail ─────────────────────────────────────────────────────
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // ── Máscara de telefone (11) 99999-9999 ──────────────────────────────────────
  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();

    if (!email) {
      setNewsletterError('Por favor, insira seu e-mail.');
      return;
    }

    if (!validateEmail(email)) {
      setNewsletterError('Por favor, insira um e-mail válido.');
      return;
    }

    setNewsletterLoading(true);
    setNewsletterError(null);

    try {
      await newsletterApi.subscribe(email);
      setNewsletterSuccess(true);
      showToast('E-mail cadastrado com sucesso! Você receberá atualizações nossas.', 'success');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar e-mail. Tente novamente.';
      setNewsletterError(message);
      showToast(message, 'error');
    } finally {
      setNewsletterLoading(false);
    }
  };

  // ── Contact form handler ─────────────────────────────────────────────────────
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!contactForm.name.trim()) {
      setContactError('Por favor, insira seu nome.');
      return;
    }
    if (!validateEmail(contactForm.email)) {
      setContactError('Por favor, insira um e-mail válido.');
      return;
    }
    if (!contactForm.subject.trim()) {
      setContactError('Por favor, insira um assunto.');
      return;
    }
    if (contactForm.message.trim().length < 10) {
      setContactError('A mensagem deve ter no mínimo 10 caracteres.');
      return;
    }

    setContactLoading(true);
    setContactError(null);

    try {
      await contactApi.send({
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        phone: contactForm.phone.trim() || undefined,
        subject: contactForm.subject.trim(),
        message: contactForm.message.trim(),
      });

      showToast('Mensagem enviada com sucesso! Responderemos em breve.', 'success');

      setContactForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar mensagem. Tente novamente.';
      setContactError(message);
      showToast(message, 'error');
    } finally {
      setContactLoading(false);
    }
  };

  // ===== PÁGINA DE ARTIGO INDIVIDUAL (URL própria /blog/:id) =====
  if (blogPostId) {
    return (
      <div className="min-h-screen bg-brand-cream font-sans">
        {/* NAVBAR (simplificada, reaproveitando o mesmo logo) */}
        <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <button onClick={() => scrollTo('home')} className="flex items-center group">
              <img
                src={logoFundoClaro}
                alt="Espalhe Melodias"
                className="h-11 w-auto object-contain"
              />
            </button>
            <button
              onClick={onGoToLogin}
              className="flex items-center space-x-2 bg-gradient-to-r from-brand-clay to-brand-clay-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition shadow-md shadow-brand-clay/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Área de Membros</span>
            </button>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 py-16">
          {!selectedBlog ? (
            <div className="text-center py-24 text-slate-400">
              <BookOpen className="w-14 h-14 mx-auto mb-4 opacity-30" />
              <p className="font-serif text-xl font-bold text-brand-navy">Artigo não encontrado</p>
              <p className="text-sm mt-2">Ele pode ter sido removido ou o link está incorreto.</p>
              <button
                onClick={closeBlogPost}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-clay hover:underline"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar para o blog</span>
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_300px] gap-10 items-start">
              <div className="min-w-0">
                {/* Breadcrumb */}
                <nav className="flex items-center flex-wrap gap-1.5 text-xs text-slate-400 mb-6">
                  <button onClick={() => scrollTo('home')} className="hover:text-brand-clay transition">Início</button>
                  <ChevronRight className="w-3 h-3" />
                  <button onClick={() => scrollTo('blog')} className="hover:text-brand-clay transition">Blog</button>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-slate-500">{selectedBlog.category}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-slate-600 font-semibold truncate max-w-[200px]">{selectedBlog.title}</span>
                </nav>

                <article className="bg-white rounded-3xl shadow-lg border border-brand-sand overflow-hidden">
                  {selectedBlog.imageUrl && (
                    <img src={selectedBlog.imageUrl} alt={selectedBlog.title} className="w-full h-64 sm:h-80 object-cover" />
                  )}
                  <div className="p-8 sm:p-10">
                    <div className="flex items-center space-x-3 mb-5">
                      <span className="text-xs bg-brand-sand text-brand-clay font-bold px-3 py-1 rounded-full">{selectedBlog.category}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {selectedBlog.readTime} de leitura
                      </span>
                    </div>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy mb-5 leading-tight">{selectedBlog.title}</h1>
                    <div className="flex items-center space-x-3 mb-8 pb-8 border-b border-slate-100">
                      <img src={selectedBlog.authorAvatar} alt={selectedBlog.authorName} className="w-11 h-11 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{selectedBlog.authorName}</p>
                        <p className="text-sm text-slate-400">{new Date(selectedBlog.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-lg italic border-l-4 border-brand-clay pl-5 mb-6">{selectedBlog.excerpt}</p>
                    <div
                      className="text-slate-700 leading-relaxed text-base prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                    />

                    {/* Compartilhar */}
                    <div className="flex items-center flex-wrap gap-3 mt-10 pt-8 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Compartilhar</span>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-brand-clay hover:text-white text-slate-500 flex items-center justify-center transition"
                        title="Compartilhar no Facebook"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(selectedBlog.title)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-brand-clay hover:text-white text-slate-500 flex items-center justify-center transition"
                        title="Compartilhar no Twitter/X"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${selectedBlog.title} — ${window.location.href}`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-brand-clay hover:text-white text-slate-500 flex items-center justify-center transition"
                        title="Compartilhar no WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          showToast('Link copiado!', 'success');
                        }}
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-brand-clay hover:text-white text-slate-500 flex items-center justify-center transition"
                        title="Copiar link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sobre o autor */}
                    <div className="flex items-start gap-4 mt-8 p-6 bg-brand-cream/40 rounded-2xl border border-brand-sand">
                      <img src={selectedBlog.authorAvatar} alt={selectedBlog.authorName} className="w-14 h-14 rounded-full object-cover shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-brand-clay uppercase tracking-wide mb-1">Sobre o autor</p>
                        <p className="font-serif text-lg font-bold text-brand-navy">{selectedBlog.authorName}</p>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                          Profissional da comunidade Espalhe Melodias, dedicado a fortalecer conexões e cuidado em saúde mental.
                        </p>
                      </div>
                    </div>
                  </div>
                </article>

                <button
                  onClick={closeBlogPost}
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-clay transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Voltar para o blog</span>
                </button>
              </div>

              {/* Sidebar: artigos relacionados */}
              <aside className="lg:sticky lg:top-24 space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Artigos relacionados</p>
                {blogs.filter(b => b.category === selectedBlog.category && b.id !== selectedBlog.id).slice(0, 4).map(related => (
                  <button
                    key={related.id}
                    onClick={() => openBlogPost(related)}
                    className="text-left flex gap-3 bg-white rounded-xl p-3 border border-brand-sand hover:shadow-md transition w-full"
                  >
                    {related.imageUrl && (
                      <img src={related.imageUrl} alt={related.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-brand-navy leading-snug line-clamp-2">{related.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{related.readTime}</p>
                    </div>
                  </button>
                ))}
                {blogs.filter(b => b.category === selectedBlog.category && b.id !== selectedBlog.id).length === 0 && (
                  <p className="text-sm text-slate-400 italic">Nenhum outro artigo nesta categoria ainda.</p>
                )}
              </aside>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="bg-brand-navy-dark border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-12 mb-14">
              {/* Brand */}
              <div>
                <img
                  src={logoFundoEscuro}
                  alt="Espalhe Melodias"
                  className="h-14 w-auto object-contain mb-5"
                />
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs">Uma comunidade multidisciplinar de profissionais da saúde mental construindo cuidados mais humanos e integrados.</p>
              </div>

              {/* Navigation */}
              <div>
                <h4 className="font-semibold text-white text-sm tracking-wide uppercase mb-5">Navegação</h4>
                <ul className="space-y-3">
                  {navLinks.map(link => (
                    <li key={link.id}>
                      <button onClick={() => scrollTo(link.id)} className="text-sm text-slate-400 hover:text-brand-clay-light transition">
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social */}
              <div>
                <h4 className="font-semibold text-white text-sm tracking-wide uppercase mb-5">Redes Sociais</h4>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="https://instagram.com/espalhemelodias"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-brand-clay-light transition"
                    >
                      <Instagram className="w-4 h-4" strokeWidth={1.75} />
                      <span>Instagram</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:contato@espalhemelodias.com.br"
                      className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-brand-clay-light transition"
                    >
                      <Mail className="w-4 h-4" strokeWidth={1.75} />
                      <span>E-mail</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 pt-10 mb-10">
              <div className="text-center">
                <p className="font-script text-2xl md:text-3xl text-brand-clay-light/70">Cada conexão é uma nota que, junta com outras, cria uma linda melodia. ♡</p>
              </div>
            </div>

            {/* Bottom */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-5">
              <p className="text-sm text-slate-500 text-center md:text-left">© 2026 Espalhe Melodias – Conexões em Saúde Mental. Tatuí, SP. Todos os direitos reservados.</p>
              <button
                onClick={onGoToLogin}
                className="flex items-center space-x-2 bg-brand-clay/20 border border-brand-clay/40 text-brand-clay-light px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-clay/30 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Área de Membros</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream font-sans">
      {/* LIGHTBOX */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-2 hover:bg-white/20 transition">
            <X className="w-6 h-6" />
          </button>
          <img src={lightboxImage} alt="" className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => scrollTo('home')} className="flex items-center group">
            <img
              src={logoFundoClaro}
              alt="Espalhe Melodias"
              className="h-11 w-auto object-contain"
            />
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                  activeSection === link.id
                    ? 'text-brand-clay bg-brand-clay/10'
                    : 'text-slate-600 hover:text-brand-clay hover:bg-brand-clay/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {/* Social icons - Desktop */}
            <div className="hidden lg:flex items-center">
              <a
                href="https://instagram.com/espalhemelodias"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-500 rounded-lg transition hover:text-[#E1306C] hover:bg-[#E1306C]/10"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            <button
              onClick={onGoToLogin}
              className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-brand-clay to-brand-clay-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition shadow-md shadow-brand-clay/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Área de Membros</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-brand-clay"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </nav>

      {/* Mobile menu — drawer lateral (direita), fora da <nav> via portal para não herdar o containing block do sticky/backdrop-blur */}
      {mobileMenuOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40 drawer-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Painel */}
          <div className="md:hidden fixed inset-y-0 right-0 z-50 w-[82%] max-w-xs bg-white shadow-2xl flex flex-col drawer-panel">
            <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
              <div className="flex items-center">
                <img
                  src={logoFundoClaro}
                  alt="Espalhe Melodias"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-brand-clay rounded-lg transition"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className={`w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition ${
                    activeSection === link.id
                      ? 'text-brand-clay bg-brand-clay/10'
                      : 'text-slate-700 hover:bg-brand-sand/60'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-slate-100">
              <a
                href="https://instagram.com/espalhemelodias"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-[#E1306C] transition"
              >
                <Instagram className="w-5 h-5" />
                <span>@espalhemelodias</span>
              </a>
            </div>

            <div className="px-5 pb-6 pt-1">
              <button
                onClick={onGoToLogin}
                className="w-full bg-gradient-to-r from-brand-clay to-brand-clay-dark text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-md shadow-brand-clay/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Área de Membros</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ===== HOME ===== */}
      {activeSection === 'home' && (
        <div>
          {/* Hero */}
          <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-gradient-to-br from-white via-brand-cream to-brand-sand">
            {/* Animated gradient background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-tl from-brand-clay/20 via-brand-clay/10 to-transparent blur-3xl animate-pulse" />
              <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-brand-moss/20 via-brand-moss/10 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

              {/* Musical decorations */}
              <div className="absolute top-16 right-20 text-8xl text-brand-clay/10 font-script rotate-12">♩</div>
              <div className="absolute top-1/3 right-10 text-6xl text-brand-moss/10 font-script -rotate-6">♪</div>
              <div className="absolute bottom-24 right-1/3 text-7xl text-brand-clay/8 font-script rotate-6">♫</div>
              <div className="absolute top-1/4 left-8 text-5xl text-brand-moss/8 font-script -rotate-12">♬</div>
              <div className="absolute bottom-1/3 left-16 text-9xl text-brand-clay/5 font-script rotate-3">𝄞</div>
            </div>

            <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 py-20">
              <div>
                <div className="inline-flex items-center space-x-2 bg-brand-moss/10 border border-brand-moss/20 text-brand-moss-dark px-4 py-2 rounded-full text-sm font-bold mb-7">
                  <Sparkles className="w-4 h-4" />
                  <span>Conexões em Saúde Mental</span>
                </div>

                <h1 className="font-serif text-5xl lg:text-6xl font-bold text-brand-navy leading-tight mb-7">
                  Conectando<br />
                  <span className="text-brand-clay font-script text-6xl lg:text-7xl">profissionais.</span><br />
                  Fortalecendo<br />
                  <span className="text-brand-moss font-script text-5xl lg:text-6xl">cuidados.</span>
                </h1>

                <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-lg">
                  O Espalhe Melodias é uma comunidade multidisciplinar de profissionais da saúde mental que acreditam no poder das conexões para construir um cuidado mais humano e integrado.
                </p>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={onGoToLogin}
                    className="flex items-center space-x-2 bg-gradient-to-r from-brand-clay to-brand-clay-dark text-white px-6 py-3.5 rounded-xl font-bold hover:shadow-xl transition-all shadow-lg shadow-brand-clay/30"
                  >
                    <LogIn className="w-4.5 h-4.5" />
                    <span>Entrar na Comunidade</span>
                  </button>
                  <button
                    onClick={() => scrollTo('about')}
                    className="flex items-center space-x-2 bg-white border-2 border-brand-clay/20 text-brand-navy px-6 py-3.5 rounded-xl font-bold hover:bg-brand-sand/20 hover:border-brand-clay/40 transition shadow-sm"
                  >
                    <span>Conheça o projeto</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <a
                    href="https://instagram.com/espalhemelodias"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-brand-clay text-white px-6 py-3.5 rounded-xl font-bold hover:shadow-lg transition shadow-md"
                  >
                    <Instagram className="w-4.5 h-4.5" />
                    <span>Seguir no Instagram</span>
                  </a>
                </div>
              </div>

              {/* Right visual */}
              <div className="hidden lg:block relative">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-brand-clay/20 to-brand-moss/20 rounded-[3rem] blur-xl" />
                  <div className="relative grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <img
                        src={espalheMelodias01}
                        alt="Encontro"
                        className="w-full h-48 object-cover rounded-2xl shadow-xl"
                      />
                      <img
                        src={espalheMelodias02}
                        alt="Conexão"
                        className="w-full h-36 object-cover rounded-2xl shadow-lg"
                      />
                    </div>
                    <div className="space-y-4 mt-8">
                      <img
                        src={espalheMelodias03}
                        alt="Palestra"
                        className="w-full h-36 object-cover rounded-2xl shadow-lg"
                      />
                      <img
                        src={espalheMelodias04}
                        alt="Workshop"
                        className="w-full h-48 object-cover rounded-2xl shadow-xl"
                      />
                    </div>
                  </div>

                  {/* Floating card */}
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center space-x-3 border border-brand-sand">
                    <div className="w-10 h-10 rounded-full bg-brand-moss/10 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-brand-moss" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Compartilhar é cuidar!</p>
                      <p className="text-xs text-slate-400">Juntos somos mais fortes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Por que existimos — dores do profissional x resposta do Espalhe Melodias */}
          <section className="py-24 max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-bold text-brand-clay uppercase tracking-widest mb-2">Motivações do coletivo</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy mb-4">O que nos motiva a estarmos aqui</h2>
              <p className="text-slate-600 max-w-xl mx-auto text-base leading-relaxed">
                As dores reais enfrentadas por quem cuida da saúde mental — e a resposta que construímos juntos.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-7">
              {[
                {
                  icon: Frown,
                  problem: 'Tendência ao isolamento',
                  problemDesc: 'O trabalho em consultório costuma isolar, sem o calor humano e as trocas sinceras do dia a dia.',
                  answer: 'Ponto de encontro mensal',
                },
                {
                  icon: AlertCircle,
                  problem: 'Sobrecarga e esgotamento',
                  problemDesc: 'Ouvir relatos difíceis semana após semana, sem uma rede madura de apoio profissional, adoece.',
                  answer: 'Rede solidária e rodas de apoio',
                },
                {
                  icon: ShieldCheck,
                  problem: 'Concorrência fria',
                  problemDesc: 'A lógica de mercado induz a ver outros profissionais como rivais, minando indicações e parcerias.',
                  answer: 'Sinergia coletiva e ética',
                },
              ].map(item => (
                <div key={item.problem} className="bg-white rounded-2xl p-7 border border-brand-sand shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-brand-clay/10 flex items-center justify-center mb-5">
                    <item.icon className="w-5.5 h-5.5 text-brand-clay" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-brand-navy mb-2">{item.problem}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5">{item.problemDesc}</p>
                  <div className="flex items-center gap-2 pt-4 border-t border-brand-sand/70">
                    <span className="w-5 h-5 rounded-full bg-brand-moss/15 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-brand-moss" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-bold text-brand-moss">{item.answer}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Gênese / propósito resumido, com link para Quem Somos */}
          <section className="py-20 bg-brand-cream/40 border-y border-brand-sand/60">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <HeartHandshake className="w-9 h-9 text-brand-moss mx-auto mb-6" strokeWidth={1.5} />
              <p className="font-serif text-2xl md:text-3xl font-bold text-brand-navy leading-snug mb-6">
                O Espalhe Melodias nasceu do compromisso ético de conectar terapeutas e aproximar caminhos sadios de escuta.
              </p>
              <p className="text-slate-600 text-base leading-relaxed max-w-2xl mx-auto mb-8">
                Acreditamos que a saúde mental não deve ser construída em solidão ou competição, mas como uma sinfonia coletiva de presenças sintonizadas — onde cada profissional encontra escuta, apoio e crescimento real.
              </p>
              <button
                onClick={() => scrollTo('about')}
                className="inline-flex items-center gap-2 text-brand-moss font-bold text-sm hover:underline"
              >
                <span>Conhecer nossa história completa</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Values strip */}
          <section className="bg-brand-navy py-20">
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                {[
                  { icon: Users, title: 'Conexões Reais', desc: 'Mais que contatos, vínculos verdadeiros e duradouros.' },
                  { icon: Heart, title: 'Apoio Mútuo', desc: 'Ninguém caminha longe quando tem com quem contar.' },
                  { icon: TrendingUp, title: 'Crescimento', desc: 'Juntos aprendemos, evoluímos e ampliamos horizontes.' },
                  { icon: Star, title: 'Pertencimento', desc: 'Construindo uma comunidade onde todos se sentem parte.' },
                ].map(v => (
                  <div key={v.title} className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                      <v.icon className="w-6 h-6 text-brand-clay-light" strokeWidth={1.75} />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-brand-cream mb-2">{v.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Instagram Feed Section — só renderiza se houver stories, posts, ou dados carregando */}
          {(stories.length > 0 || instagramPosts.length > 0 || publicSiteData.storiesLoading || publicSiteData.instagramLoading) && (
          <section className="py-24 max-w-6xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12">
              <div>
                <p className="text-sm font-bold text-brand-clay uppercase tracking-widest mb-2">Nos Acompanhe</p>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy">Momentos no Instagram</h2>
              </div>
              <a
                href="https://instagram.com/espalhemelodias"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-pink-500 to-brand-clay text-white px-5 py-3 rounded-xl font-bold hover:shadow-lg transition shadow-md self-start"
              >
                <Instagram className="w-4 h-4" />
                <span>Seguir @espalhemelodias</span>
              </a>
            </div>

            {/* Stories Carousel - só renderiza se houver stories ou estiver carregando */}
            {(stories.length > 0 || publicSiteData.storiesLoading) && (
              <div className="mb-14">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-5">Stories Recentes</p>
                <InstagramStories
                  stories={stories}
                  loading={publicSiteData.storiesLoading}
                />
              </div>
            )}

            {/* Instagram Posts Grid - Dinâmico */}
            {publicSiteData.instagramLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-slate-200 dark:bg-slate-700 aspect-square rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : instagramPosts.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {instagramPosts.map((post) => (
                  <a
                    key={post.id}
                    href={post.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 border border-slate-100"
                  >
                    <div className="relative overflow-hidden bg-slate-100 aspect-square">
                      <img src={post.image_url} alt={post.caption} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-white">
                            <Heart className="w-5 h-5 fill-current" />
                            <span className="font-bold">{post.likes_count}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-white">
                            <MessageSquare className="w-5 h-5" />
                            <span className="font-bold">{post.comments_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 bg-white">
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{post.caption}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : null}
          </section>
          )}

          {/* Testimonials Section — só renderiza se houver depoimentos */}
          {publicSiteData.testimonials.length > 0 && (
          <section className="py-24 bg-gradient-to-br from-brand-cream/50 to-brand-sand/30">
            <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-14">
                <p className="text-sm font-bold text-brand-clay uppercase tracking-widest mb-2">Depoimentos</p>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy mb-4">O que dizem nossos membros</h2>
                <p className="text-slate-600 max-w-xl mx-auto text-base leading-relaxed">Histórias reais de profissionais que fazem parte dessa jornada coletiva</p>
              </div>

              <div className="grid md:grid-cols-3 gap-7">
                {publicSiteData.testimonials.map(testimonial => (
                  <div key={testimonial.id} className="bg-white rounded-2xl p-7 shadow-sm border border-brand-sand hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="flex items-center space-x-3 mb-5">
                      <img src={testimonial.avatar} alt={testimonial.authorName} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-brand-navy text-base">{testimonial.authorName}</p>
                        <p className="text-sm text-brand-clay font-semibold">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-brand-clay text-brand-clay" />)}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed italic">"{testimonial.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          )}

          {/* Latest blog posts — só renderiza se houver posts */}
          {blogs.length > 0 && (
          <section className="py-24 max-w-6xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12">
              <div>
                <p className="text-sm font-bold text-brand-clay uppercase tracking-widest mb-2">Blog & Conteúdo</p>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy">Últimas publicações</h2>
              </div>
              <button onClick={() => scrollTo('blog')} className="inline-flex items-center gap-1 text-sm text-brand-clay font-bold hover:underline self-start">
                <span>Ver todos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-7">
              {blogs.slice(0, 2).map(post => (
                <button
                  key={post.id}
                  onClick={() => openBlogPost(post)}
                  className="text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-sand hover:shadow-lg hover:-translate-y-0.5 transition group"
                >
                  <div className="relative overflow-hidden">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur text-brand-clay text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
                    </div>
                  </div>
                  <div className="p-7">
                    <h3 className="font-serif text-lg font-bold text-brand-navy mb-2.5 leading-snug group-hover:text-brand-clay transition">{post.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img src={post.authorAvatar} alt={post.authorName} className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-sm text-slate-500 font-semibold">{post.authorName}</span>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.readTime}</span>
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
          )}

          {/* Upcoming events teaser — só renderiza se houver eventos futuros */}
          {upcomingEvents.length > 0 && (
          <section className="py-20 bg-brand-sand/40">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
                <div>
                  <p className="text-sm font-bold text-brand-moss uppercase tracking-widest mb-2">Agenda</p>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-navy">Próximos encontros</h2>
                </div>
                <button onClick={() => scrollTo('events')} className="inline-flex items-center gap-1 text-sm text-brand-moss font-bold hover:underline self-start">
                  <span>Ver agenda</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {upcomingEvents.slice(0, 2).map(evt => (
                  <div key={evt.id} className="bg-white rounded-2xl p-7 border border-brand-sand shadow-sm flex items-start space-x-5 hover:shadow-md transition">
                    <div className="w-16 h-16 bg-brand-moss/10 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-brand-moss">{parseLocalDate(evt.date).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}</span>
                      <span className="text-2xl font-black text-brand-moss leading-none mt-0.5">{parseLocalDate(evt.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-brand-clay uppercase tracking-wider">{evt.category}</span>
                      <h3 className="font-semibold text-brand-navy text-base mt-1 leading-snug">{evt.title}</h3>
                      <p className="text-sm text-slate-400 mt-1.5 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{evt.time}</span>
                      </p>
                      <button onClick={onGoToLogin} className="mt-4 text-sm text-brand-clay font-bold hover:underline flex items-center space-x-0.5">
                        <span>Inscrever-se</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          )}

          {/* Newsletter Section */}
          <section className="py-20 bg-gradient-to-r from-brand-clay/90 to-brand-clay-dark">
            <div className="max-w-2xl mx-auto px-6 text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Fique por dentro das novidades</h2>
              <p className="text-white/90 mb-9 max-w-md mx-auto text-base leading-relaxed">Receba artigos, dicas de saúde mental e informações sobre nossos eventos diretamente no seu e-mail.</p>

              {newsletterSuccess ? (
                <div className="flex items-center justify-center gap-3 bg-white/20 border border-white/30 rounded-xl px-6 py-4">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">E-mail cadastrado com sucesso!</span>
                </div>
              ) : (
                <>
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 mb-3">
                    <input
                      type="email"
                      placeholder="Seu melhor e-mail"
                      value={newsletterEmail}
                      onChange={e => setNewsletterEmail(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/60 transition"
                    />
                    <button
                      type="submit"
                      disabled={newsletterLoading || !newsletterEmail.trim()}
                      className="px-6 py-3 bg-white text-brand-clay font-bold rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      {newsletterLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Inscrevendo...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Inscrever
                        </>
                      )}
                    </button>
                  </form>
                  {newsletterError && (
                    <div className="flex items-center justify-center gap-2 text-red-100 bg-red-500/30 border border-red-400/50 rounded-lg px-4 py-2 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {newsletterError}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* CTA — Formulário de Solicitação */}
          <section className="py-20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-clay/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-moss/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="max-w-2xl mx-auto px-6 relative z-10">
              <div className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy-dark rounded-3xl relative overflow-hidden border border-white/5 shadow-2xl">
                {/* Decoração */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute top-4 right-8 text-6xl font-script text-brand-clay">♩</div>
                  <div className="absolute bottom-4 left-8 text-5xl font-script text-brand-moss">♫</div>
                </div>

                <div className="relative z-10 p-8 sm:p-14">
                  {/* Header */}
                  <div className="text-center mb-10">
                    <p className="font-script text-3xl sm:text-4xl text-brand-clay-light mb-3">Compartilhar é cuidar!</p>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cream mb-4">Faça parte da nossa comunidade</h2>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
                      Preencha os dados abaixo e nossa equipe entrará em contato após a aprovação.
                    </p>
                  </div>

                  {/* Formulário ou Sucesso */}
                  {requestSuccess ? (
                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-serif text-lg font-bold text-brand-cream mb-1">Solicitação enviada!</p>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto">
                          Recebemos seus dados. Nossa equipe analisará sua solicitação em breve e você receberá um retorno.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleRequestSubmit} className="space-y-4">
                      {/* Nome e E-mail */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-300 mb-2">Nome completo <span className="text-brand-clay">*</span></label>
                          <input
                            type="text"
                            required
                            value={requestForm.name}
                            onChange={e => setF('name', e.target.value)}
                            placeholder="Seu nome completo"
                            className="w-full text-sm bg-white/10 border border-white/20 text-brand-cream placeholder-slate-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/60 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-300 mb-2">E-mail <span className="text-brand-clay">*</span></label>
                          <input
                            type="email"
                            required
                            value={requestForm.email}
                            onChange={e => setF('email', e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full text-sm bg-white/10 border border-white/20 text-brand-cream placeholder-slate-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/60 transition"
                          />
                        </div>
                      </div>

                      {/* WhatsApp e Especialidade */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-300 mb-2">WhatsApp / Telefone</label>
                          <input
                            type="tel"
                            value={requestForm.phone}
                            onChange={e => setF('phone', formatPhone(e.target.value))}
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                            className="w-full text-sm bg-white/10 border border-white/20 text-brand-cream placeholder-slate-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/60 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-300 mb-2">Especialidade</label>
                          <select
                            value={requestForm.specialty}
                            onChange={e => setF('specialty', e.target.value)}
                            className="w-full text-sm bg-white/10 border border-white/20 text-brand-cream px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/60 transition appearance-none"
                          >
                            <option value="" className="text-brand-navy bg-white">Selecione...</option>
                            {ESPECIALIDADES_PUBLIC.map(e => (
                              <option key={e.value} value={e.value} className="text-brand-navy bg-white">{e.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Especialidade Custom */}
                      {requestForm.specialty === 'outro' && (
                        <div>
                          <label className="block text-sm font-bold text-slate-300 mb-2">Qual é a sua especialidade?</label>
                          <input
                            type="text"
                            value={requestForm.specialtyCustom}
                            onChange={e => setF('specialtyCustom', e.target.value)}
                            placeholder="Digite sua especialidade"
                            className="w-full text-sm bg-white/10 border border-white/20 text-brand-cream placeholder-slate-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/60 transition"
                          />
                        </div>
                      )}

                      {/* Gênero */}
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Gênero</label>
                        <select
                          value={requestForm.gender}
                          onChange={e => setF('gender', e.target.value)}
                          className="w-full text-sm bg-white/10 border border-white/20 text-brand-cream px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/60 transition appearance-none"
                        >
                          <option value="" className="text-brand-navy bg-white">Não declarado</option>
                          <option value="masculino" className="text-brand-navy bg-white">Masculino</option>
                          <option value="feminino" className="text-brand-navy bg-white">Feminino</option>
                        </select>
                      </div>

                      {/* Observação */}
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Mensagem / Apresentação</label>
                        <textarea
                          value={requestForm.observation}
                          onChange={e => setF('observation', e.target.value)}
                          placeholder="Alguma mensagem ou apresentação..."
                          rows={3}
                          className="w-full text-sm bg-white/10 border border-white/20 text-brand-cream placeholder-slate-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/60 transition resize-none"
                        />
                      </div>

                      {/* Error */}
                      {requestError && (
                        <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg">
                          {requestError}
                        </p>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={requestLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-clay to-brand-clay-dark hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition shadow-lg text-sm"
                      >
                        {requestLoading
                          ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</>
                          : <><Send className="w-4 h-4" />Enviar Solicitação</>
                        }
                      </button>
                    </form>
                  )}

                  {/* Botão Acessar */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={onGoToLogin}
                      className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-cream text-sm font-semibold transition"
                    >
                      <LogIn className="w-4 h-4" />
                      Acessar Área de Membros
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ===== QUEM SOMOS ===== */}
      {activeSection === 'about' && (
        <div className="min-h-screen bg-gradient-to-br from-white via-brand-cream/30 to-brand-sand/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="text-center mb-12 sm:mb-16">
              <p className="text-sm font-bold text-brand-clay uppercase tracking-widest mb-3">Nossa História</p>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-navy mb-4 leading-tight">Quem Somos</h1>
              <p className="text-slate-600 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
                As idealizadoras do Espalhe Melodias e a história de um projeto que nasceu do desejo de fortalecer conexões entre profissionais de saúde mental.
              </p>
            </div>

          {/* Nossa Gênese */}
          <div className="mb-12 sm:mb-14 bg-white border border-brand-sand rounded-3xl p-6 sm:p-9 lg:p-12 shadow-sm">
            <div className="mb-8">
              <p className="text-sm font-bold text-brand-moss uppercase tracking-widest mb-3">Nossa Gênese</p>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-navy leading-snug mb-5">
                Fortalecer e crescer juntos em saúde mental
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-4 max-w-3xl">
                O Espalhe Melodias surgiu do compromisso ético de conectar terapeutas e aproximar caminhos sadios de escuta. Acreditamos que a saúde mental não deve ser construída em solidão ou competição egoica, mas como uma sinfonia coletiva de presenças sintonizadas.
              </p>
              <div className="border-l-2 border-brand-clay pl-5 py-1 max-w-2xl">
                <p className="text-slate-700 italic text-sm leading-relaxed">
                  "Cada melodia de cuidado só se torna verdadeiramente livre e potente quando reverbera em harmonia com outros saberes."
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Users, title: 'Presença Ativa', desc: 'Conexões reais que ultrapassam os limites herméticos das clínicas tradicionais.' },
                { icon: ShieldCheck, title: 'Cuidado Seguro', desc: 'Triagens de urgência e um diretório transparente de profissionais certificados.' },
                { icon: TrendingUp, title: 'Crescimento Intelectual', desc: 'Troca de ensinamentos clínicos, materiais éticos e resoluções de desafios coletivos.' },
                { icon: HeartHandshake, title: 'Canto de Apoio', desc: 'Redes de sustentabilidade emocional contra o esgotamento dos atendimentos.' },
              ].map(item => (
                <div key={item.title} className="bg-brand-cream/40 rounded-xl p-4 flex flex-col">
                  <item.icon className="w-4.5 h-4.5 text-brand-moss mb-2.5" strokeWidth={1.75} />
                  <p className="font-bold text-brand-navy text-sm mb-1">{item.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Founders */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-14">
            {[
              {
                name: 'Jéssica Muhamed',
                role: 'Idealizadora do Espalhe Psicologia',
                avatar: fotoJessica,
                instagram: 'https://www.instagram.com/psi.jessicamuhamed/',
                quote: 'Eu acredito que ninguém constrói cuidado sozinho.',
                items: ['Psicóloga Clínica desde 2016', 'Fundadora do Meraki – Espaço de Saúde', 'Psicóloga do CAPS II de Tatuí (SUS)', 'Idealizadora do Espalhe Psicologia Tatuí'],
                textAccent: 'text-brand-clay',
                quoteIcon: 'text-brand-clay/40',
                dot: 'bg-brand-clay',
              },
              {
                name: 'Karen Gomes',
                role: 'Idealizadora do Melodias Conexões',
                avatar: fotoKaren,
                instagram: 'https://www.instagram.com/psi.karengomes/',
                quote: 'Conexões verdadeiras fortalecem o cuidado.',
                items: ['Psicóloga Clínica desde 2021', 'Empreendedora da Develoi Soluções Digitais', 'Fundadora do PsiFlux', 'Coordenadora do MFC de Tatuí', 'Idealizadora do Melodias Conexões'],
                textAccent: 'text-brand-moss',
                quoteIcon: 'text-brand-moss/40',
                dot: 'bg-brand-moss',
              }
            ].map(founder => (
              <div key={founder.name} className="bg-white rounded-3xl p-6 sm:p-9 border border-brand-sand shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col items-center text-center mb-6">
                  <img src={founder.avatar} alt={founder.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-md ring-4 ring-brand-sand mb-4" />
                  <h3 className="font-serif text-xl font-bold text-brand-navy">{founder.name}</h3>
                  <p className={`${founder.textAccent} text-sm font-semibold mt-1`}>{founder.role}</p>
                  <a
                    href={founder.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-brand-clay text-sm mt-2 transition"
                  >
                    <Instagram className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Instagram</span>
                  </a>
                </div>
                <div className="relative bg-brand-cream/50 rounded-2xl p-6 mb-7">
                  <Quote className={`w-6 h-6 ${founder.quoteIcon} absolute top-4 left-4`} />
                  <p className="text-slate-700 text-base italic font-medium leading-relaxed text-center px-4">{founder.quote}</p>
                </div>
                <ul className="space-y-3">
                  {founder.items.map(item => (
                    <li key={item} className="flex items-start space-x-3 text-sm text-slate-600 leading-relaxed">
                      <span className={`w-1.5 h-1.5 rounded-full ${founder.dot} shrink-0 mt-1.5`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mission / Vision / Values */}
          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {[
              {
                icon: Target,
                title: 'Nosso Propósito',
                text: 'Fortalecer conexões entre profissionais da saúde, criando um espaço de troca, apoio e crescimento coletivo.',
                iconBg: 'bg-brand-moss/10',
                iconColor: 'text-brand-moss',
              },
              {
                icon: Eye,
                title: 'Nossa Visão',
                text: 'Construir uma comunidade multidisciplinar acolhedora, colaborativa e comprometida com um cuidado em saúde mental mais humano e integrado.',
                iconBg: 'bg-brand-navy/10',
                iconColor: 'text-brand-navy',
              },
              {
                icon: Heart,
                title: 'O Que Construímos',
                text: 'Troca de experiências, integração multidisciplinar, fortalecimento profissional, parcerias e novas possibilidades de atuação.',
                iconBg: 'bg-brand-clay/10',
                iconColor: 'text-brand-clay',
              }
            ].map(item => (
              <div key={item.title} className="bg-white border border-brand-sand rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center mb-5`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} strokeWidth={1.75} />
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-navy mb-2.5">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Ciranda de valores */}
          <div className="mb-12 sm:mb-14">
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-sm font-bold text-brand-clay uppercase tracking-widest mb-2">Sabor do Cuidado Integrado</p>
              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-brand-navy">Formando uma sinfonia saudável de trocas</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
              {[
                { title: 'Escuta Sensível', tag: 'Atenção & Empatia', desc: 'Escutar com atenção plena e empatia genuína, acolhendo a dor de quem compartilha.', accent: 'from-brand-moss to-brand-moss-dark' },
                { title: 'Respeito Descondicionado', tag: 'Singularidades valorizadas', desc: 'Reconhecimento das histórias singulares e da ética e liberdade de cada profissional.', accent: 'from-brand-clay to-brand-clay-dark' },
                { title: 'Troca Recíproca', tag: 'Troca que inspira', desc: 'Transmissão livre de saberes e materiais clínicos, sem medo de concorrência.', accent: 'from-brand-navy to-brand-navy-dark' },
                { title: 'Conexões Reais', tag: 'Vínculos duradouros', desc: 'Transparência nas relações, gerando parcerias e indicações confiáveis.', accent: 'from-brand-moss to-brand-moss-dark' },
                { title: 'Apoio Múltiplo', tag: 'Sustentação mútua', desc: 'Suporte clínico e existencial contra o isolamento da atuação solitária.', accent: 'from-brand-clay to-brand-clay-dark' },
              ].map((v, i) => (
                <div key={v.title} className="relative bg-white border border-brand-sand rounded-2xl p-5 pt-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col">
                  <div className={`absolute top-0 left-5 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br ${v.accent} flex items-center justify-center text-white text-xs font-black shadow-sm`}>
                    {i + 1}
                  </div>
                  <h4 className="font-serif text-base font-bold text-brand-navy leading-snug min-h-[2.5rem]">{v.title}</h4>
                  <span className="inline-block text-[10px] font-bold text-brand-moss bg-brand-moss/10 px-2.5 py-1 rounded-full mt-2 mb-3 self-start">{v.tag}</span>
                  <p className="text-slate-500 text-xs leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ganhos reais */}
          <div className="grid sm:grid-cols-2 gap-5 mb-14 items-stretch">
            <div className="bg-white border border-brand-sand rounded-2xl p-7 shadow-sm flex flex-col">
              <p className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-4">Ganhos reais</p>
              <ul className="space-y-3">
                {['Troca transparente de ensinamentos', 'Integração de abordagens terapêuticas', 'Prevenção de burnout clínico', 'Sinergia de parcerias e projetos'].map(g => (
                  <li key={g} className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                    <Check className="w-4 h-4 text-brand-moss shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-brand-sand rounded-2xl p-7 shadow-sm flex flex-col">
              <p className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-4">Nossa visão de futuro</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Ser a maior rede de amparo multidisciplinar de psicologia interiorana, rompendo o isolamento profissional através de soluções digitais lúdicas e éticas — construindo, encontro após encontro, uma comunidade cada vez mais forte.
              </p>
            </div>
          </div>

          {/* Values list */}
          <div className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy-dark rounded-3xl p-6 sm:p-10 lg:p-14 text-center border border-white/5 shadow-lg">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-7 sm:mb-9">Nossos Valores</h3>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2.5 sm:gap-3 mb-9 sm:mb-11">
              {['Ética', 'Acolhimento', 'Escuta Sensível', 'Respeito às Singularidades', 'Cooperação', 'Humanidade', 'Construção Coletiva'].map((v, i, arr) => (
                <span
                  key={v}
                  className={`flex items-center justify-center gap-1.5 bg-white/10 border border-white/20 text-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-white/15 transition text-center ${i === arr.length - 1 ? 'col-span-2 sm:col-span-1' : ''}`}
                >
                  <Heart className="w-3.5 h-3.5 text-brand-clay-light shrink-0" />
                  <span>{v}</span>
                </span>
              ))}
            </div>
            <div className="border-t border-white/10 pt-7 sm:pt-9">
              <p className="font-script text-2xl sm:text-3xl md:text-4xl text-brand-clay-light mb-3">Cada conexão é uma nota que,</p>
              <p className="font-script text-lg sm:text-xl md:text-2xl text-slate-300">junta com outras, cria uma linda melodia. ♡</p>
            </div>
          </div>

          {/* Apoio */}
          <div className="mt-14">
            <div className="text-center mb-6">
              <p className="text-sm font-bold text-brand-clay uppercase tracking-widest mb-2">Quem apoia essa jornada</p>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-brand-navy">Apoio</h3>
            </div>
            <a
              href="https://psiflux.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col sm:flex-row items-center gap-6 sm:gap-7 bg-white border border-brand-sand rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-brand-clay/5 -translate-y-1/3 translate-x-1/3" />
              <div className="w-16 h-16 rounded-2xl bg-brand-cream/60 border border-brand-sand flex items-center justify-center shrink-0 relative z-10">
                <img src={logoPsiflux} alt="PsiFlux" className="h-10 w-10 object-contain" />
              </div>
              <div className="text-center sm:text-left relative z-10 min-w-0">
                <p className="font-serif text-lg font-bold text-brand-navy group-hover:text-brand-clay transition">PsiFlux</p>
                <p className="text-sm text-slate-500 leading-relaxed mt-1.5">
                  O sistema criado com psicólogos, para psicólogos. Agenda, prontuário, teleconsulta, financeiro e IA — tudo em uma plataforma pensada para a rotina clínica.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-clay mt-3">
                  Conhecer o PsiFlux
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </a>
          </div>
          </div>
        </div>
      )}

      {/* ===== BLOG ===== */}
      {activeSection === 'blog' && (
        <div className="min-h-screen bg-gradient-to-br from-white to-brand-cream/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-sm font-bold text-brand-clay uppercase tracking-widest mb-3">Conhecimento & Reflexão</p>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-navy mb-4 leading-tight">Blog Espalhe Melodias</h1>
              <p className="text-slate-600 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
                Artigos, reflexões e conteúdo educativo produzido por nossos profissionais para fortalecer o cuidado em saúde mental.
              </p>
            </div>

            {blogs.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-serif text-xl font-bold text-brand-navy">Nenhuma publicação ainda</p>
                <p className="text-sm mt-2 text-slate-500">Em breve novos conteúdos serão publicados. Acompanhe nossas redes sociais!</p>
              </div>
            ) : (() => {
              const categories = ['Todos', ...Array.from(new Set(blogs.map(p => p.category).filter(Boolean)))];
              const [featured, ...rest] = blogs;
              const filtered = blogCategoryFilter === 'Todos' ? rest : rest.filter(p => p.category === blogCategoryFilter);
              const showFeatured = blogCategoryFilter === 'Todos' || featured.category === blogCategoryFilter;

              return (
                <>
                  {/* Filtro de categorias */}
                  {categories.length > 2 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-10 sm:mb-12">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setBlogCategoryFilter(cat)}
                          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition border ${
                            blogCategoryFilter === cat
                              ? 'bg-brand-clay text-white border-brand-clay shadow-sm'
                              : 'bg-white text-slate-500 border-brand-sand hover:border-brand-clay/40 hover:text-brand-clay'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Post em destaque */}
                  {showFeatured && (
                    <button
                      onClick={() => openBlogPost(featured)}
                      className="text-left w-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-brand-sand hover:shadow-xl transition-all duration-300 group mb-12 sm:mb-16 grid md:grid-cols-2"
                    >
                      <div className="relative overflow-hidden h-56 sm:h-72 md:h-full">
                        <img src={featured.imageUrl} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <span className="bg-brand-clay text-white text-[11px] font-black px-3 py-1 rounded-full shadow uppercase tracking-wide flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Destaque
                          </span>
                        </div>
                      </div>
                      <div className="p-6 sm:p-9 flex flex-col justify-center">
                        <span className="text-xs font-bold text-brand-clay bg-brand-clay/10 px-3 py-1 rounded-full self-start mb-4">{featured.category}</span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mb-3 leading-snug group-hover:text-brand-clay transition">{featured.title}</h2>
                        <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3">{featured.excerpt}</p>
                        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                          <div className="flex items-center space-x-2.5">
                            <img src={featured.authorAvatar} alt={featured.authorName} className="w-9 h-9 rounded-full object-cover border-2 border-brand-sand" />
                            <div>
                              <p className="text-sm font-bold text-slate-700">{featured.authorName}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-2">
                                <span>{new Date(featured.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.readTime}</span>
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-brand-clay font-bold flex items-center gap-1 shrink-0">
                            <span className="hidden sm:inline">Ler artigo</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Grade de posts */}
                  {filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-semibold text-brand-navy">Nenhum artigo nesta categoria ainda</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                      {filtered.map(post => (
                        <button
                          key={post.id}
                          onClick={() => openBlogPost(post)}
                          className="text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-sand hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                        >
                          <div className="relative overflow-hidden">
                            <img src={post.imageUrl} alt={post.title} className="w-full h-44 object-cover group-hover:scale-105 transition duration-500" />
                            <div className="absolute top-3 left-3">
                              <span className="bg-white/90 backdrop-blur text-brand-clay text-[11px] font-bold px-2.5 py-1 rounded-full shadow">{post.category}</span>
                            </div>
                          </div>
                          <div className="p-5 sm:p-6 flex flex-col flex-1">
                            <h3 className="font-serif text-base sm:text-lg font-bold text-brand-navy mb-2 group-hover:text-brand-clay transition leading-snug line-clamp-2">{post.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-2 flex-1">{post.excerpt}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                              <div className="flex items-center gap-2 min-w-0">
                                <img src={post.authorAvatar} alt={post.authorName} className="w-7 h-7 rounded-full object-cover border-2 border-brand-sand shrink-0" />
                                <p className="text-xs font-bold text-slate-600 truncate">{post.authorName}</p>
                              </div>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3" />{post.readTime}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ===== GALERIA ===== */}
      {activeSection === 'gallery' && (
        <div className="min-h-screen bg-gradient-to-br from-white to-brand-cream/20">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <p className="text-sm font-bold text-brand-clay uppercase tracking-widest mb-3">Memórias & Momentos</p>
              <h1 className="font-serif text-5xl font-bold text-brand-navy mb-5 leading-tight">Galeria de Imagens</h1>
              <p className="text-slate-600 max-w-lg mx-auto text-lg leading-relaxed">
                Registros dos nossos encontros, workshops e momentos de conexão que fazem parte da história do Espalhe Melodias.
              </p>
            </div>

          {/* Masonry-style gallery */}
          {galleryImages.length > 0 ? (
            <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-5 space-y-4 sm:space-y-5">
              {galleryImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setLightboxImage(img.url)}
                  className="break-inside-avoid block w-full group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={img.url}
                    alt={img.caption}
                    className={`w-full object-cover group-hover:scale-105 transition duration-500 ${i % 3 === 0 ? 'h-64' : i % 3 === 1 ? 'h-48' : 'h-56'}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-5">
                    <div>
                      <p className="text-white text-sm font-bold">{img.event}</p>
                      <p className="text-white/80 text-xs mt-0.5">{img.caption}</p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition">
                    <Eye className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-brand-sand bg-white p-12 text-center shadow-sm">
              <Image className="w-11 h-11 text-brand-clay/50 mx-auto mb-5" strokeWidth={1.5} />
              <p className="font-semibold text-brand-navy text-lg mb-2">Nenhuma imagem publicada ainda</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                A galeria será preenchida automaticamente com as publicações reais do Instagram.
              </p>
            </div>
          )}
          </div>
        </div>
      )}

      {/* ===== EVENTOS ===== */}
      {activeSection === 'events' && (
        <div className="min-h-screen bg-gradient-to-br from-white via-brand-sand/10 to-brand-cream/30">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <p className="text-sm font-bold text-brand-clay uppercase tracking-widest mb-3">Agenda & Histórico</p>
              <h1 className="font-serif text-5xl font-bold text-brand-navy mb-5 leading-tight">Encontros & Eventos</h1>
              <p className="text-slate-600 max-w-lg mx-auto text-lg leading-relaxed">
                Nossos encontros mensais, workshops e eventos especiais para fortalecer nossa comunidade.
              </p>
            </div>

          {/* Upcoming */}
          {upcomingEvents.length > 0 && (
            <div className="mb-14">
              <h2 className="font-serif text-xl font-bold text-brand-navy mb-7 flex items-center space-x-2.5">
                <Calendar className="w-5 h-5 text-brand-moss" />
                <span>Próximos Encontros</span>
              </h2>
              <div className="space-y-5">
                {upcomingEvents.map(evt => (
                  <div key={evt.id} className="bg-white rounded-2xl border border-brand-sand shadow-sm overflow-hidden hover:shadow-md transition group">
                    <div className="flex items-stretch">
                      <div className="bg-brand-moss/10 border-r border-brand-sand px-6 flex flex-col items-center justify-center min-w-[90px]">
                        <span className="text-xs font-bold text-brand-moss uppercase">
                          {parseLocalDate(evt.date).toLocaleDateString('pt-BR', { month: 'short' })}
                        </span>
                        <span className="text-3xl font-black text-brand-moss leading-none mt-0.5">
                          {parseLocalDate(evt.date).getDate()}
                        </span>
                      </div>
                      <div className="p-7 flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-xs font-bold text-brand-clay uppercase tracking-wider bg-brand-clay/10 px-2.5 py-1 rounded-full">{evt.category}</span>
                          <div className="flex items-center space-x-1 text-sm text-slate-400">
                            <Users className="w-4 h-4" />
                            <span>{evt.participantsCount} inscritos</span>
                          </div>
                        </div>
                        <h3 className="font-serif font-bold text-brand-navy text-lg mb-2">{evt.title}</h3>
                        <p className="text-sm text-slate-500 mb-3 flex items-center space-x-4">
                          <span className="flex items-center space-x-1.5"><Clock className="w-4 h-4" /><span>{evt.time}</span></span>
                          <span className="flex items-center space-x-1.5"><span className="font-semibold">Com:</span><span>{evt.instructorName}</span></span>
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{evt.description}</p>
                        <button
                          onClick={onGoToLogin}
                          className="mt-5 inline-flex items-center space-x-1.5 bg-brand-clay text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-clay-dark transition"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Inscrever-se (Área de Membros)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past events */}
          <div className="mb-14">
            <h2 className="font-serif text-xl font-bold text-brand-navy mb-7 flex items-center space-x-2.5">
              <Star className="w-5 h-5 text-brand-clay" />
              <span>Eventos Realizados</span>
            </h2>
            {pastEvents.length === 0 ? (
              <div className="rounded-2xl border border-brand-sand bg-white p-12 text-center shadow-sm">
                <Calendar className="w-11 h-11 text-brand-clay/50 mx-auto mb-5" strokeWidth={1.5} />
                <p className="font-semibold text-brand-navy text-lg mb-2">Nenhum evento realizado ainda</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Assim que tivermos nosso primeiro encontro, os registros aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {pastEvents.map(evt => (
                  <div key={evt.id} className="bg-white rounded-2xl overflow-hidden border border-brand-sand shadow-sm hover:shadow-lg transition group">
                    <div className="relative overflow-hidden bg-brand-navy/10 h-44 flex items-center justify-center">
                      <div className="text-center">
                        <Music className="w-10 h-10 text-brand-navy/40 mx-auto mb-2" strokeWidth={1.5} />
                        <span className="text-brand-navy/60 text-sm font-semibold">{evt.category}</span>
                      </div>
                      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{evt.participantsCount} participantes</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-serif font-bold text-brand-navy text-lg mb-2.5">{evt.title}</h3>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mb-3">
                        <span className="flex items-center space-x-1"><Calendar className="w-3.5 h-3.5" /><span>{parseLocalDate(evt.date).toLocaleDateString('pt-BR')}</span></span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{evt.description}</p>
                      {evt.recordingUrl && (
                        <a href={evt.recordingUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center space-x-1.5 text-sm text-brand-clay font-bold hover:underline">
                          <Play className="w-4 h-4" />
                          <span>Assistir gravação</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>

            {/* How it works */}
            <div className="bg-brand-navy rounded-3xl p-10 sm:p-12">
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-brand-cream text-center mb-10">Como funcionamos</h3>
            <div className="grid md:grid-cols-2 gap-9">
              {[
                { icon: Calendar, title: 'Encontros Mensais', desc: 'Um sábado por mês, período da tarde. Datas pré-definidas para facilitar a organização de todos.' },
                { icon: Sparkles, title: 'Desenvolvimento Contínuo', desc: 'Cada encontro terá um tema de desenvolvimento. O primeiro ano será uma jornada de crescimento coletivo.' },
                { icon: Award, title: 'Eventos Especiais', desc: 'Agosto: Mês dos Psicólogos. Dezembro: Retiro e Confraternização Espalhe Melodias.' },
                { icon: Smartphone, title: 'Plataforma Digital', desc: 'Indicações, materiais, gestão de frequência e divulgação de eventos em uma plataforma exclusiva para membros.' },
              ].map(item => (
                <div key={item.title} className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-brand-clay-light" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-cream text-base mb-1.5">{item.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONTATO ===== */}
      {activeSection === 'contact' && (
      <div className="min-h-screen bg-gradient-to-br from-white to-brand-cream/20">
      {/* Contact Form Section */}
      <section className="pt-20 pb-24">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-brand-clay uppercase tracking-widest mb-3">Fale Conosco</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-navy mb-5 leading-tight">Entre em Contato</h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-md mx-auto">Envie suas dúvidas, sugestões ou propostas de parceria. Responderemos em breve!</p>
          </div>

          <form onSubmit={handleContactSubmit} className="bg-white rounded-3xl border border-brand-sand p-8 sm:p-10 shadow-lg">
            {/* Name + Email */}
            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-clay/50 focus:border-brand-clay/50 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu.email@exemplo.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-clay/50 focus:border-brand-clay/50 transition"
                />
              </div>
            </div>

            {/* Phone + Subject */}
            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Telefone / WhatsApp <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={e => setContactForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-clay/50 focus:border-brand-clay/50 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Assunto
                </label>
                <select
                  value={contactForm.subject}
                  onChange={e => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-clay/50 focus:border-brand-clay/50 transition appearance-none"
                >
                  <option value="">Selecione um assunto</option>
                  <option value="Dúvida sobre Membros">Dúvida sobre Membros</option>
                  <option value="Sugestão de Conteúdo">Sugestão de Conteúdo</option>
                  <option value="Parcerias">Parcerias Corporativas</option>
                  <option value="Feedback">Feedback do Evento</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mensagem
              </label>
              <textarea
                value={contactForm.message}
                onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Conte-nos mais sobre seu interesse..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-clay/50 focus:border-brand-clay/50 transition resize-none"
              />
            </div>

            {/* Error Message */}
            {contactError && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{contactError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={contactLoading}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-brand-clay to-brand-clay-dark text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {contactLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Mensagem
                </>
              )}
            </button>

            <p className="text-sm text-slate-500 mt-4 text-center">
              Responderemos sua mensagem em até 48 horas.
            </p>
          </form>
        </div>
      </section>

      {/* Conecte-se Section */}
      <section className="py-24 bg-brand-navy">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Conecte-se com a gente</h2>
            <p className="text-slate-300 max-w-xl mx-auto text-base leading-relaxed">Nos siga nas redes sociais, envie uma mensagem ou entre em contato por e-mail</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Instagram */}
            <a
              href="https://instagram.com/espalhemelodias"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-brand-clay/20 transition">
                <Instagram className="w-5 h-5 text-brand-clay-light" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-sm mb-0.5">Instagram</h3>
                <p className="text-slate-400 text-sm truncate">@espalhemelodias</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:contato@espalhemelodias.com.br"
              className="group flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-brand-clay/20 transition">
                <Mail className="w-5 h-5 text-brand-clay-light" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-sm mb-0.5">E-mail</h3>
                <p className="text-slate-400 text-sm truncate">contato@espalhemelodias.com.br</p>
              </div>
            </a>
          </div>
        </div>
      </section>
      </div>
      )}

      {/* FOOTER */}
      <footer className="bg-brand-navy-dark border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-12 mb-14">
            {/* Brand */}
            <div>
              <img
                src={logoFundoEscuro}
                alt="Espalhe Melodias"
                className="h-14 w-auto object-contain mb-5"
              />
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">Uma comunidade multidisciplinar de profissionais da saúde mental construindo cuidados mais humanos e integrados.</p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold text-white text-sm tracking-wide uppercase mb-5">Navegação</h4>
              <ul className="space-y-3">
                {navLinks.map(link => (
                  <li key={link.id}>
                    <button onClick={() => scrollTo(link.id)} className="text-sm text-slate-400 hover:text-brand-clay-light transition">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold text-white text-sm tracking-wide uppercase mb-5">Redes Sociais</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://instagram.com/espalhemelodias"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-brand-clay-light transition"
                  >
                    <Instagram className="w-4 h-4" strokeWidth={1.75} />
                    <span>Instagram</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contato@espalhemelodias.com.br"
                    className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-brand-clay-light transition"
                  >
                    <Mail className="w-4 h-4" strokeWidth={1.75} />
                    <span>E-mail</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-10 mb-10">
            <div className="text-center">
              <p className="font-script text-2xl md:text-3xl text-brand-clay-light/70">Cada conexão é uma nota que, junta com outras, cria uma linda melodia. ♡</p>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <p className="text-sm text-slate-500 text-center md:text-left">© 2026 Espalhe Melodias – Conexões em Saúde Mental. Tatuí, SP. Todos os direitos reservados.</p>
            <button
              onClick={onGoToLogin}
              className="flex items-center space-x-2 bg-brand-clay/20 border border-brand-clay/40 text-brand-clay-light px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-clay/30 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Área de Membros</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
