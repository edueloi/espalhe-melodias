import React, { useState } from 'react';
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
  Instagram,
  Mail,
  Phone,
  Globe,
  Sparkles,
  Play,
  Quote,
  CheckCircle2,
  Loader2,
  Send,
} from 'lucide-react';
import { BlogPost, HealthEvent } from '../types';
import { memberRequestsApi } from '../lib/api';

interface PublicSiteProps {
  blogs: BlogPost[];
  events: HealthEvent[];
  onGoToLogin: () => void;
}

const GALLERY_IMAGES = [
  {
    id: 'g1',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop',
    caption: '1º Encontro Espalhe Melodias – Maio 2026',
    event: '1º Encontro'
  },
  {
    id: 'g2',
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop',
    caption: 'Dinâmica de Conexão – Roda de conversa',
    event: '1º Encontro'
  },
  {
    id: 'g3',
    url: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=800&auto=format&fit=crop',
    caption: 'Workshop de Mindfulness Corporativo',
    event: 'Workshop'
  },
  {
    id: 'g4',
    url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=800&auto=format&fit=crop',
    caption: 'Palestra: A Neurobiologia do Amor-Próprio',
    event: 'Palestra'
  },
  {
    id: 'g5',
    url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800&auto=format&fit=crop',
    caption: 'Grupo de Apoio Mútuo – Ansiedade Social',
    event: 'Grupo de Apoio'
  },
  {
    id: 'g6',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
    caption: 'Conexões que transformam – Comunidade Melodias',
    event: '1º Encontro'
  },
];

const PAST_EVENTS_GALLERY = [
  {
    id: 'pe1',
    title: '1º Encontro Espalhe Melodias',
    date: '31 de Maio de 2026',
    location: 'Tatuí – SP',
    description: 'O encontro inaugural que deu início à nossa jornada coletiva. Mais de 20 profissionais da saúde mental reunidos para construir conexões reais.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop',
    participants: 22,
    highlights: ['Dinâmica de Conexão', 'Apresentação das Idealizadoras', 'Compromisso e Pertencimento']
  },
  {
    id: 'pe2',
    title: 'Palestra: Neurobiologia do Amor-Próprio',
    date: '20 de Maio de 2026',
    location: 'Online – Zoom',
    description: 'Dr. Marcos Toledo apresentou como a autocompaixão impacta nosso sistema neurológico e como cultivar um cérebro mais acolhedor.',
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=800&auto=format&fit=crop',
    participants: 45,
    highlights: ['Neurobiologia da autocompaixão', 'Técnicas de reneuropadronização', 'Q&A com especialista']
  },
];

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

export default function PublicSite({ blogs, events, onGoToLogin }: PublicSiteProps) {
  const [activeSection, setActiveSection] = useState<'home' | 'blog' | 'gallery' | 'events' | 'about'>('home');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  ] as const;

  const scrollTo = (section: typeof activeSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

      {/* BLOG POST OVERLAY */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBlog(null)}>
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={selectedBlog.imageUrl} alt={selectedBlog.title} className="w-full h-56 object-cover rounded-t-3xl" />
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-xs bg-brand-sand text-brand-clay font-bold px-3 py-1 rounded-full">{selectedBlog.category}</span>
                <span className="text-xs text-slate-400">{selectedBlog.readTime} de leitura</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-brand-navy mb-3 leading-tight">{selectedBlog.title}</h2>
              <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-100">
                <img src={selectedBlog.authorAvatar} alt={selectedBlog.authorName} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{selectedBlog.authorName}</p>
                  <p className="text-xs text-slate-400">{new Date(selectedBlog.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-base mb-4">{selectedBlog.excerpt}</p>
              <p className="text-slate-700 leading-relaxed">{selectedBlog.content}</p>
              <button onClick={() => setSelectedBlog(null)} className="mt-8 text-sm text-brand-clay font-semibold hover:underline flex items-center space-x-1">
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar para o blog</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-brand-cream/95 backdrop-blur-sm border-b border-brand-sand shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => scrollTo('home')} className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-clay to-brand-moss flex items-center justify-center shadow-md group-hover:shadow-lg transition">
              <span className="text-base text-white font-serif font-black italic">♩Ψ</span>
            </div>
            <div>
              <span className="font-serif text-base font-black text-brand-navy tracking-wide leading-none block">Espalhe</span>
              <span className="font-script text-xl text-brand-clay leading-none -mt-1 block">Melodias</span>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
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
            <button
              onClick={onGoToLogin}
              className="hidden md:flex items-center space-x-2 bg-brand-clay text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-clay-dark transition shadow-md shadow-brand-clay/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Área de Membros</span>
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-brand-sand px-6 py-4 space-y-1 shadow-lg">
            {navLinks.map(link => (
              <button key={link.id} onClick={() => scrollTo(link.id)} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-brand-sand rounded-lg transition">
                {link.label}
              </button>
            ))}
            <button onClick={onGoToLogin} className="w-full mt-2 bg-brand-clay text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-2">
              <LogIn className="w-4 h-4" />
              <span>Área de Membros</span>
            </button>
          </div>
        )}
      </nav>

      {/* ===== HOME ===== */}
      {activeSection === 'home' && (
        <div>
          {/* Hero */}
          <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-gradient-to-br from-brand-cream via-brand-sand to-brand-cream">
            {/* Musical decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-16 right-20 text-8xl text-brand-clay/10 font-script rotate-12">♩</div>
              <div className="absolute top-1/3 right-10 text-6xl text-brand-moss/10 font-script -rotate-6">♪</div>
              <div className="absolute bottom-24 right-1/3 text-7xl text-brand-clay/8 font-script rotate-6">♫</div>
              <div className="absolute top-1/4 left-8 text-5xl text-brand-moss/8 font-script -rotate-12">♬</div>
              <div className="absolute bottom-1/3 left-16 text-9xl text-brand-clay/5 font-script rotate-3">𝄞</div>
              {/* Organic blob shapes */}
              <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-brand-moss/8 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-brand-clay/8 blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 py-20">
              <div>
                <div className="inline-flex items-center space-x-2 bg-brand-moss/10 border border-brand-moss/20 text-brand-moss-dark px-4 py-1.5 rounded-full text-xs font-bold mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Conexões em Saúde Mental</span>
                </div>

                <h1 className="font-serif text-5xl lg:text-6xl font-bold text-brand-navy leading-tight mb-6">
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
                    className="flex items-center space-x-2 bg-brand-clay text-white px-6 py-3.5 rounded-xl font-bold hover:bg-brand-clay-dark transition shadow-lg shadow-brand-clay/25"
                  >
                    <LogIn className="w-4.5 h-4.5" />
                    <span>Acessar Área de Membros</span>
                  </button>
                  <button
                    onClick={() => scrollTo('about')}
                    className="flex items-center space-x-2 bg-white border border-brand-sand text-brand-navy px-6 py-3.5 rounded-xl font-bold hover:bg-brand-sand transition shadow-md"
                  >
                    <span>Conheça o projeto</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-brand-sand">
                  {[
                    { value: '20+', label: 'Membros' },
                    { value: '2', label: 'Idealizadoras' },
                    { value: '2026', label: 'Nascimento' },
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <div className="font-serif text-2xl font-bold text-brand-clay">{stat.value}</div>
                      <div className="text-xs text-slate-500 font-semibold mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right visual */}
              <div className="hidden lg:block relative">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-brand-clay/20 to-brand-moss/20 rounded-[3rem] blur-xl" />
                  <div className="relative grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <img
                        src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=400&auto=format&fit=crop"
                        alt="Encontro"
                        className="w-full h-48 object-cover rounded-2xl shadow-xl"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=400&auto=format&fit=crop"
                        alt="Conexão"
                        className="w-full h-36 object-cover rounded-2xl shadow-lg"
                      />
                    </div>
                    <div className="space-y-4 mt-8">
                      <img
                        src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=400&auto=format&fit=crop"
                        alt="Palestra"
                        className="w-full h-36 object-cover rounded-2xl shadow-lg"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=400&auto=format&fit=crop"
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
                      <p className="text-xs font-bold text-slate-800">Compartilhar é cuidar!</p>
                      <p className="text-[11px] text-slate-400">Juntos somos mais fortes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Values strip */}
          <section className="bg-brand-navy py-14">
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { icon: '🤝', title: 'Conexões Reais', desc: 'Mais que contatos, vínculos verdadeiros e duradouros.' },
                  { icon: '💚', title: 'Apoio Mútuo', desc: 'Ninguém caminha longe quando tem com quem contar.' },
                  { icon: '🌱', title: 'Crescimento', desc: 'Juntos aprendemos, evoluímos e ampliamos horizontes.' },
                  { icon: '⭐', title: 'Pertencimento', desc: 'Construindo uma comunidade onde todos se sentem parte.' },
                ].map(v => (
                  <div key={v.title} className="text-center">
                    <div className="text-3xl mb-3">{v.icon}</div>
                    <h3 className="font-serif text-base font-bold text-brand-cream mb-1">{v.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Latest blog posts */}
          <section className="py-20 max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-bold text-brand-clay uppercase tracking-widest mb-2">Blog & Conteúdo</p>
                <h2 className="font-serif text-3xl font-bold text-brand-navy">Últimas publicações</h2>
              </div>
              <button onClick={() => scrollTo('blog')} className="flex items-center space-x-1 text-sm text-brand-clay font-bold hover:underline">
                <span>Ver todos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {blogs.slice(0, 2).map(post => (
                <button
                  key={post.id}
                  onClick={() => setSelectedBlog(post)}
                  className="text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-sand hover:shadow-lg hover:-translate-y-0.5 transition group"
                >
                  <div className="relative overflow-hidden">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur text-brand-clay text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-lg font-bold text-brand-navy mb-2 leading-snug group-hover:text-brand-clay transition">{post.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img src={post.authorAvatar} alt={post.authorName} className="w-7 h-7 rounded-full object-cover" />
                        <span className="text-xs text-slate-500 font-semibold">{post.authorName}</span>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Upcoming events teaser */}
          <section className="py-16 bg-brand-sand/40">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs font-bold text-brand-moss uppercase tracking-widest mb-2">Agenda</p>
                  <h2 className="font-serif text-3xl font-bold text-brand-navy">Próximos encontros</h2>
                </div>
                <button onClick={() => scrollTo('events')} className="flex items-center space-x-1 text-sm text-brand-moss font-bold hover:underline">
                  <span>Ver agenda</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {events.filter(e => e.status === 'upcoming').slice(0, 2).map(evt => (
                  <div key={evt.id} className="bg-white rounded-2xl p-6 border border-brand-sand shadow-sm flex items-start space-x-4 hover:shadow-md transition">
                    <div className="w-14 h-14 bg-brand-moss/10 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-brand-moss">{new Date(evt.date).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}</span>
                      <span className="text-xl font-black text-brand-moss leading-none">{new Date(evt.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-brand-clay uppercase tracking-wider">{evt.category}</span>
                      <h3 className="font-semibold text-brand-navy text-sm mt-0.5 leading-snug">{evt.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{evt.time}</span>
                      </p>
                      <button onClick={onGoToLogin} className="mt-3 text-xs text-brand-clay font-bold hover:underline flex items-center space-x-0.5">
                        <span>Inscrever-se</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA — Formulário de Solicitação */}
          <section className="py-20">
            <div className="max-w-2xl mx-auto px-6">
              <div className="bg-gradient-to-br from-brand-navy to-brand-navy-dark rounded-3xl relative overflow-hidden">
                {/* Decoração */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute top-4 right-8 text-6xl font-script text-brand-clay">♩</div>
                  <div className="absolute bottom-4 left-8 text-5xl font-script text-brand-moss">♫</div>
                </div>

                <div className="relative z-10 p-8 sm:p-12">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <p className="font-script text-3xl sm:text-4xl text-brand-clay-light mb-3">Compartilhar é cuidar!</p>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-cream mb-3">Faça parte da nossa comunidade</h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
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
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">Nome completo <span className="text-brand-clay">*</span></label>
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
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">E-mail <span className="text-brand-clay">*</span></label>
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
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">WhatsApp / Telefone</label>
                          <input
                            type="tel"
                            value={requestForm.phone}
                            onChange={e => setF('phone', e.target.value)}
                            placeholder="(00) 00000-0000"
                            className="w-full text-sm bg-white/10 border border-white/20 text-brand-cream placeholder-slate-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/60 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">Especialidade</label>
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
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">Qual é a sua especialidade?</label>
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
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Gênero</label>
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
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Mensagem / Apresentação</label>
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
                        className="w-full flex items-center justify-center gap-2 bg-brand-clay hover:bg-brand-clay-dark disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition shadow-lg text-sm"
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
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-brand-clay uppercase tracking-widest mb-3">Nossa História</p>
            <h1 className="font-serif text-4xl font-bold text-brand-navy mb-4">Quem Somos</h1>
            <p className="text-slate-500 max-w-xl mx-auto text-base leading-relaxed">
              As idealizadoras do Espalhe Melodias e a história de um projeto que nasceu do desejo de fortalecer conexões.
            </p>
          </div>

          {/* Founders */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                name: 'Jéssica Muhamed',
                role: 'Idealizadora do Espalhe Psicologia',
                avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop',
                quote: '"Eu acredito que ninguém constrói cuidado sozinho."',
                bio: 'Psicóloga Clínica desde 2016, fundadora do Meraki – Espaço de Saúde, psicóloga do CAPS II de Tatuí (SUS) e idealizadora do Espalhe Psicologia Tatuí.',
                items: ['Psicóloga Clínica desde 2016', 'Fundadora do Meraki – Espaço de Saúde', 'Psicóloga do CAPS II de Tatuí (SUS)', 'Idealizadora do Espalhe Psicologia Tatuí'],
                color: 'from-brand-clay/10 to-brand-sand'
              },
              {
                name: 'Karen Gomes',
                role: 'Idealizadora do Melodias Conexões',
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
                quote: '"Conexões verdadeiras fortalecem o cuidado."',
                bio: 'Psicóloga Clínica desde 2021, empreendedora da Develoi Soluções Digitais, coordenadora do MFC de Tatuí e idealizadora do Melodias Conexões.',
                items: ['Psicóloga Clínica desde 2021', 'Empreendedora da Develoi Soluções Digitais', 'Coordenadora do MFC de Tatuí', 'Idealizadora do Melodias Conexões'],
                color: 'from-brand-moss/10 to-brand-sand'
              }
            ].map(founder => (
              <div key={founder.name} className={`bg-gradient-to-br ${founder.color} rounded-3xl p-8 border border-brand-sand`}>
                <div className="flex items-start space-x-4 mb-6">
                  <img src={founder.avatar} alt={founder.name} className="w-20 h-20 rounded-2xl object-cover shadow-lg shrink-0" />
                  <div>
                    <h3 className="font-serif text-xl font-bold text-brand-navy">{founder.name}</h3>
                    <p className="text-brand-clay text-sm font-semibold mt-0.5">{founder.role}</p>
                  </div>
                </div>
                <div className="bg-white/60 rounded-xl p-4 mb-5 border-l-3 border-brand-clay">
                  <Quote className="w-4 h-4 text-brand-clay mb-1" />
                  <p className="text-slate-700 text-sm italic font-medium">{founder.quote}</p>
                </div>
                <ul className="space-y-2">
                  {founder.items.map(item => (
                    <li key={item} className="flex items-start space-x-2 text-sm text-slate-600">
                      <Heart className="w-3.5 h-3.5 text-brand-clay shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mission / Vision / Values */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: '🎯',
                title: 'Nosso Propósito',
                text: 'Fortalecer conexões entre profissionais da saúde, criando um espaço de troca, apoio e crescimento coletivo.',
                color: 'bg-brand-moss/5 border-brand-moss/20'
              },
              {
                icon: '👁️',
                title: 'Nossa Visão',
                text: 'Construir uma comunidade multidisciplinar acolhedora, colaborativa e comprometida com um cuidado em saúde mental mais humano e integrado.',
                color: 'bg-brand-navy/5 border-brand-navy/20'
              },
              {
                icon: '💛',
                title: 'O Que Construímos',
                text: 'Troca de experiências, integração multidisciplinar, fortalecimento profissional, parcerias e novas possibilidades de atuação.',
                color: 'bg-brand-clay/5 border-brand-clay/20'
              }
            ].map(item => (
              <div key={item.title} className={`${item.color} border rounded-2xl p-6`}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-serif text-base font-bold text-brand-navy mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Values list */}
          <div className="bg-brand-navy rounded-3xl p-10 text-center">
            <h3 className="font-serif text-2xl font-bold text-brand-cream mb-6">Nossos Valores</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['Ética', 'Acolhimento', 'Escuta Sensível', 'Respeito às Singularidades', 'Cooperação', 'Humanidade', 'Construção Coletiva'].map(v => (
                <span key={v} className="flex items-center space-x-1.5 bg-white/10 border border-white/20 text-slate-300 px-4 py-2 rounded-full text-sm font-semibold">
                  <Heart className="w-3 h-3 text-brand-clay-light" />
                  <span>{v}</span>
                </span>
              ))}
            </div>
            <p className="mt-8 font-script text-3xl text-brand-clay-light">Cada conexão é uma nota que,</p>
            <p className="font-script text-2xl text-slate-400 -mt-1">junta com outras, cria uma linda melodia. ♡</p>
          </div>
        </div>
      )}

      {/* ===== BLOG ===== */}
      {activeSection === 'blog' && (
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-brand-clay uppercase tracking-widest mb-3">Conhecimento & Reflexão</p>
            <h1 className="font-serif text-4xl font-bold text-brand-navy mb-4">Blog Espalhe Melodias</h1>
            <p className="text-slate-500 max-w-lg mx-auto text-base">
              Artigos, reflexões e conteúdo educativo produzido por nossos profissionais para fortalecer o cuidado em saúde mental.
            </p>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="font-semibold">Nenhuma publicação ainda</p>
              <p className="text-sm mt-1">Em breve novos conteúdos serão publicados.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {blogs.map(post => (
                <button
                  key={post.id}
                  onClick={() => setSelectedBlog(post)}
                  className="text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-sand hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-52 object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur text-brand-clay text-xs font-bold px-3 py-1 rounded-full shadow">{post.category}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-black/40 backdrop-blur text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-lg font-bold text-brand-navy mb-2 group-hover:text-brand-clay transition leading-snug">{post.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center space-x-2.5">
                        <img src={post.authorAvatar} alt={post.authorName} className="w-8 h-8 rounded-full object-cover border-2 border-brand-sand" />
                        <div>
                          <p className="text-xs font-bold text-slate-700">{post.authorName}</p>
                          <p className="text-[11px] text-slate-400">{new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                        </div>
                      </div>
                      <span className="text-xs text-brand-clay font-bold flex items-center space-x-1 group-hover:space-x-1.5 transition-all">
                        <span>Ler artigo</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== GALERIA ===== */}
      {activeSection === 'gallery' && (
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-brand-clay uppercase tracking-widest mb-3">Memórias & Momentos</p>
            <h1 className="font-serif text-4xl font-bold text-brand-navy mb-4">Galeria de Imagens</h1>
            <p className="text-slate-500 max-w-lg mx-auto text-base">
              Registros dos nossos encontros, workshops e momentos de conexão que fazem parte da história do Espalhe Melodias.
            </p>
          </div>

          {/* Masonry-style gallery */}
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {GALLERY_IMAGES.map((img, i) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                  <div>
                    <p className="text-white text-xs font-bold">{img.event}</p>
                    <p className="text-white/80 text-[11px]">{img.caption}</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition">
                  <Eye className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== EVENTOS ===== */}
      {activeSection === 'events' && (
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-brand-clay uppercase tracking-widest mb-3">Agenda & Histórico</p>
            <h1 className="font-serif text-4xl font-bold text-brand-navy mb-4">Encontros & Eventos</h1>
            <p className="text-slate-500 max-w-lg mx-auto text-base">
              Nossos encontros mensais, workshops e eventos especiais para fortalecer nossa comunidade.
            </p>
          </div>

          {/* Upcoming */}
          {events.filter(e => e.status === 'upcoming').length > 0 && (
            <div className="mb-12">
              <h2 className="font-serif text-xl font-bold text-brand-navy mb-6 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-brand-moss" />
                <span>Próximos Encontros</span>
              </h2>
              <div className="space-y-4">
                {events.filter(e => e.status === 'upcoming').map(evt => (
                  <div key={evt.id} className="bg-white rounded-2xl border border-brand-sand shadow-sm overflow-hidden hover:shadow-md transition group">
                    <div className="flex items-stretch">
                      <div className="bg-brand-moss/10 border-r border-brand-sand px-6 flex flex-col items-center justify-center min-w-[80px]">
                        <span className="text-xs font-bold text-brand-moss uppercase">
                          {new Date(evt.date).toLocaleDateString('pt-BR', { month: 'short' })}
                        </span>
                        <span className="text-3xl font-black text-brand-moss leading-none">
                          {new Date(evt.date).getDate()}
                        </span>
                      </div>
                      <div className="p-6 flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-[10px] font-bold text-brand-clay uppercase tracking-wider bg-brand-clay/10 px-2 py-0.5 rounded-full">{evt.category}</span>
                          <div className="flex items-center space-x-1 text-xs text-slate-400">
                            <Users className="w-3.5 h-3.5" />
                            <span>{evt.participantsCount} inscritos</span>
                          </div>
                        </div>
                        <h3 className="font-serif font-bold text-brand-navy text-lg mb-1">{evt.title}</h3>
                        <p className="text-sm text-slate-500 mb-3 flex items-center space-x-3">
                          <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>{evt.time}</span></span>
                          <span className="flex items-center space-x-1"><span className="font-semibold">Com:</span><span>{evt.instructorName}</span></span>
                        </p>
                        <p className="text-sm text-slate-600 line-clamp-2">{evt.description}</p>
                        <button
                          onClick={onGoToLogin}
                          className="mt-4 inline-flex items-center space-x-1.5 bg-brand-clay text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-clay-dark transition"
                        >
                          <LogIn className="w-3.5 h-3.5" />
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
          <div className="mb-12">
            <h2 className="font-serif text-xl font-bold text-brand-navy mb-6 flex items-center space-x-2">
              <Star className="w-5 h-5 text-brand-clay" />
              <span>Eventos Realizados</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {PAST_EVENTS_GALLERY.map(evt => (
                <div key={evt.id} className="bg-white rounded-2xl overflow-hidden border border-brand-sand shadow-sm hover:shadow-lg transition group">
                  <div className="relative overflow-hidden">
                    <img src={evt.image} alt={evt.title} className="w-full h-44 object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <span className="text-white font-bold text-sm">{evt.title}</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{evt.participants} participantes</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mb-3">
                      <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{evt.date}</span></span>
                      <span className="flex items-center space-x-1"><MapPin className="w-3 h-3" /><span>{evt.location}</span></span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{evt.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {evt.highlights.map(h => (
                        <span key={h} className="text-[11px] bg-brand-sand text-brand-clay-dark font-semibold px-2.5 py-1 rounded-full">{h}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Past events from data */}
              {events.filter(e => e.status === 'past').map(evt => (
                <div key={evt.id} className="bg-white rounded-2xl overflow-hidden border border-brand-sand shadow-sm hover:shadow-lg transition group">
                  <div className="relative overflow-hidden bg-brand-navy/10 h-44 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl mb-2">🎙️</div>
                      <span className="text-brand-navy/60 text-sm font-semibold">{evt.category}</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{evt.participantsCount} participantes</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif font-bold text-brand-navy mb-2">{evt.title}</h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mb-3">
                      <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{new Date(evt.date).toLocaleDateString('pt-BR')}</span></span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{evt.description}</p>
                    {evt.recordingUrl && (
                      <a href={evt.recordingUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center space-x-1.5 text-xs text-brand-clay font-bold hover:underline">
                        <Play className="w-3.5 h-3.5" />
                        <span>Assistir gravação</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="bg-brand-navy rounded-3xl p-10">
            <h3 className="font-serif text-2xl font-bold text-brand-cream text-center mb-8">Como funcionamos</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { icon: '📅', title: 'Encontros Mensais', desc: 'Um sábado por mês, período da tarde. Datas pré-definidas para facilitar a organização de todos.' },
                { icon: '🌱', title: 'Desenvolvimento Contínuo', desc: 'Cada encontro terá um tema de desenvolvimento. O primeiro ano será uma jornada de crescimento coletivo.' },
                { icon: '🎉', title: 'Eventos Especiais', desc: 'Agosto: Mês dos Psicólogos. Dezembro: Retiro e Confraternização Espalhe Melodias.' },
                { icon: '📱', title: 'Plataforma Digital', desc: 'Indicações, materiais, gestão de frequência e divulgação de eventos em uma plataforma exclusiva para membros.' },
              ].map(item => (
                <div key={item.title} className="flex items-start space-x-4">
                  <div className="text-3xl shrink-0">{item.icon}</div>
                  <div>
                    <h4 className="font-semibold text-brand-cream text-sm mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-brand-navy-dark border-t border-brand-navy py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-clay to-brand-moss flex items-center justify-center">
                <span className="text-lg text-white font-serif font-black italic">♩Ψ</span>
              </div>
              <div>
                <div className="font-serif text-base font-black text-brand-cream">Espalhe Melodias</div>
                <div className="text-xs text-slate-500">Conexões em Saúde Mental</div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {navLinks.map(link => (
                <button key={link.id} onClick={() => scrollTo(link.id)} className="text-xs text-slate-500 hover:text-slate-300 transition font-semibold">{link.label}</button>
              ))}
            </div>
            <button
              onClick={onGoToLogin}
              className="flex items-center space-x-2 bg-brand-clay/20 border border-brand-clay/30 text-brand-clay-light px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-clay/30 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Área de Membros</span>
            </button>
          </div>
          <div className="mt-8 pt-6 border-t border-brand-navy text-center">
            <p className="font-script text-2xl text-brand-clay-light/60">Cada conexão é uma nota que, junta com outras, cria uma linda melodia. ♡</p>
            <p className="text-xs text-slate-600 mt-3">© 2026 Espalhe Melodias – Conexões em Saúde Mental. Tatuí, SP.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
