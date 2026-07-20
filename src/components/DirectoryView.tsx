import React, { useState, useEffect } from 'react';
import {
  Users, Search, Star, MapPin, MessageSquare,
  ArrowLeft, ChevronRight, ShieldCheck, Check, Globe,
  Settings, Plus, Trash2, Phone, RefreshCw, AlertCircle,
  Stethoscope, Calendar, X, Edit3, ExternalLink, Instagram,
  Linkedin, Facebook, Twitter, Link2, Youtube,
} from 'lucide-react';
import { professionalsApi, uploadApi, type Professional } from '../lib/api';
import { useAuth } from '../lib/auth';
import {
  PageWrapper, SectionTitle, ContentCard, PanelCard, FormRow, Divider,
  Button, Input, Textarea, useToast,
} from './ui';
import { Badge } from './ui/Badge';

const toNumericValue = (value: unknown, fallback = 0) => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
};


// ── Tipos de profissional com registro e máscara ─────────────────────────────

const PROF_TYPES: Array<{
  label: string;
  council: string;       // sigla do conselho
  placeholder: string;   // placeholder do número
  mask: (v: string) => string;
}> = [
  {
    label: 'Psicólogo',
    council: 'CRP',
    placeholder: '06/123456',
    mask: v => {
      const d = v.replace(/\D/g, '').slice(0, 8);
      if (d.length <= 2) return d;
      return `${d.slice(0, 2)}/${d.slice(2)}`;
    },
  },
  {
    label: 'Médico',
    council: 'CRM',
    placeholder: 'SP 123456',
    mask: v => {
      const clean = v.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const letters = clean.match(/[A-Z]+/)?.[0] ?? '';
      const nums    = clean.replace(/[A-Z]/g, '').slice(0, 6);
      if (!letters) return nums;
      return `${letters.slice(0,2)} ${nums}`;
    },
  },
  {
    label: 'Psiquiatra',
    council: 'CRM',
    placeholder: 'SP 123456',
    mask: v => {
      const clean = v.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const letters = clean.match(/[A-Z]+/)?.[0] ?? '';
      const nums    = clean.replace(/[A-Z]/g, '').slice(0, 6);
      if (!letters) return nums;
      return `${letters.slice(0,2)} ${nums}`;
    },
  },
  {
    label: 'Fisioterapeuta',
    council: 'CREFITO',
    placeholder: '3-123456F',
    mask: v => v.replace(/[^0-9A-Za-z-]/g, '').slice(0, 10).toUpperCase(),
  },
  {
    label: 'Fonoaudiólogo',
    council: 'CFFa',
    placeholder: '1-12345',
    mask: v => v.replace(/[^0-9-]/g, '').slice(0, 8),
  },
  {
    label: 'Nutricionista',
    council: 'CFN',
    placeholder: '12345',
    mask: v => v.replace(/\D/g, '').slice(0, 6),
  },
  {
    label: 'Terapeuta Ocupacional',
    council: 'COFFITO',
    placeholder: '123456',
    mask: v => v.replace(/\D/g, '').slice(0, 6),
  },
  {
    label: 'Assistente Social',
    council: 'CRESS',
    placeholder: '6a/12345',
    mask: v => v.replace(/[^0-9A-Za-z/]/g, '').slice(0, 9).toUpperCase(),
  },
  {
    label: 'Educador Físico',
    council: 'CREF',
    placeholder: '012345-G/SP',
    mask: v => v.replace(/[^0-9A-Za-z-/]/g, '').slice(0, 12).toUpperCase(),
  },
  {
    label: 'Psicopedagogo',
    council: 'ABPp',
    placeholder: '12345',
    mask: v => v.replace(/\D/g, '').slice(0, 6),
  },
  {
    label: 'Psicanalista',
    council: '',
    placeholder: 'Número do registro',
    mask: v => v,
  },
  {
    label: 'Pedagogo',
    council: '',
    placeholder: 'Número do registro',
    mask: v => v,
  },
  {
    label: 'Outro',
    council: '',
    placeholder: 'Número do registro',
    mask: v => v,
  },
];

// Grupos temáticos de especialidades por tipo de profissional
type SpecGroup = { label: string; items: string[] };

const SPEC_GROUPS_BY_TYPE: Record<string, SpecGroup[]> = {
  Psicólogo: [
    { label: 'Abordagens Terapêuticas', items: ['TCC', 'Psicanálise', 'Gestalt-terapia', 'ACT', 'DBT', 'Terapia do Esquema', 'EMDR', 'Brainspotting', 'Logoterapia', 'Terapia Sistêmica', 'Terapia Humanista', 'Neuropsicologia', 'Psicologia Positiva', 'Terapia Integrativa', 'Avaliação Psicológica'] },
    { label: 'Público Atendido', items: ['Crianças', 'Adolescentes', 'Adultos', 'Idosos', 'Casais', 'Famílias', 'Grupos'] },
    { label: 'Áreas Clínicas', items: ['Ansiedade', 'Depressão', 'Burnout', 'Trauma', 'Luto', 'TOC', 'TDAH', 'Autismo', 'Fobia', 'Dependência Química', 'Transtorno Alimentar', 'Transtorno Pânico', 'Bipolaridade', 'Autoestima', 'Relacionamentos', 'Sexualidade'] },
    { label: 'Formatos', items: ['Psicoterapia Online', 'Psicoterapia Presencial', 'Atendimento Híbrido', 'Grupo Terapêutico', 'Supervisão Clínica', 'Plantão Psicológico', 'Workshops', 'Palestras'] },
  ],
  Psiquiatra: [
    { label: 'Transtornos', items: ['Ansiedade', 'Depressão', 'Transtorno Bipolar', 'Esquizofrenia', 'TDAH', 'Autismo', 'TOC', 'Fobia Social', 'TEPT', 'Borderline', 'Dependência Química', 'Psicose', 'Insônia'] },
    { label: 'Público', items: ['Crianças', 'Adolescentes', 'Adultos', 'Idosos'] },
    { label: 'Formatos', items: ['Consulta Presencial', 'Consulta Online', 'Acompanhamento Medicamentoso', 'Laudo Psiquiátrico'] },
  ],
  Médico: [
    { label: 'Especialidades', items: ['Clínica Geral', 'Cardiologia', 'Dermatologia', 'Endocrinologia', 'Ginecologia', 'Neurologia', 'Ortopedia', 'Pediatria', 'Reumatologia', 'Urologia', 'Medicina Preventiva', 'Medicina do Trabalho', 'Geriatria'] },
    { label: 'Formatos', items: ['Consulta Presencial', 'Telemedicina', 'Medicina Preventiva', 'Check-up'] },
  ],
  Fisioterapeuta: [
    { label: 'Especialidades', items: ['Ortopedia', 'Neurológica', 'Respiratória', 'Esportiva', 'Pediátrica', 'Geriatria', 'Pós-operatório', 'Uroginecologia', 'Dermato-funcional'] },
    { label: 'Métodos', items: ['RPG', 'Pilates Clínico', 'Acupuntura', 'Dry Needling', 'Crochetagem', 'Osteopatia', 'Terapia Manual'] },
    { label: 'Formatos', items: ['Atendimento Presencial', 'Domiciliar', 'Online'] },
  ],
  'Fonoaudiólogo': [
    { label: 'Áreas', items: ['Linguagem', 'Fala', 'Deglutição', 'Voz', 'Audiologia', 'Gagueira', 'Motricidade Orofacial', 'Dislexia'] },
    { label: 'Público', items: ['Bebês', 'Crianças', 'Adolescentes', 'Adultos', 'Idosos'] },
  ],
  Nutricionista: [
    { label: 'Especialidades', items: ['Emagrecimento', 'Esportiva', 'Clínica', 'Pediátrica', 'Oncológica', 'Gestantes', 'Vegetarianismo', 'Comportamento Alimentar', 'Diabetes', 'Hipertensão'] },
    { label: 'Formatos', items: ['Consulta Presencial', 'Consulta Online', 'Acompanhamento Contínuo', 'Palestras'] },
  ],
  'Terapeuta Ocupacional': [
    { label: 'Áreas', items: ['Desenvolvimento Infantil', 'Neurológica', 'Saúde Mental', 'Geriatria', 'Autismo', 'TDAH', 'Inclusão Escolar', 'Reabilitação', 'Ortopedia'] },
    { label: 'Formatos', items: ['Presencial', 'Domiciliar', 'Escolar', 'Hospitalar'] },
  ],
  'Assistente Social': [
    { label: 'Áreas', items: ['Proteção Social', 'Saúde', 'Família', 'Infância', 'Violência Doméstica', 'Dependência Química', 'Habitação', 'Orientação Sociojurídica'] },
    { label: 'Contextos', items: ['CRAS', 'CREAS', 'Hospital', 'Escola', 'Empresa', 'ONG'] },
  ],
  'Educador Físico': [
    { label: 'Modalidades', items: ['Musculação', 'Funcional', 'Pilates', 'Yoga', 'Natação', 'Corrida', 'Ciclismo', 'Crossfit'] },
    { label: 'Foco', items: ['Emagrecimento', 'Hipertrofia', 'Reabilitação', 'Qualidade de Vida', 'Idosos', 'Gestantes', 'Esportivo'] },
  ],
  Psicopedagogo: [
    { label: 'Dificuldades', items: ['Dislexia', 'Disgrafia', 'Discalculia', 'TDAH', 'Autismo', 'Dificuldades de Aprendizagem', 'Problema de Leitura'] },
    { label: 'Atuação', items: ['Alfabetização', 'Orientação Escolar', 'Inclusão', 'Avaliação Psicopedagógica', 'Orientação de Pais', 'Reforço Escolar'] },
    { label: 'Público', items: ['Bebês', 'Crianças', 'Adolescentes', 'Adultos'] },
  ],
  Psicanalista: [
    { label: 'Abordagens', items: ['Psicanálise Clínica', 'Freudiana', 'Lacaniana', 'Junguiana', 'Winnicottiana'] },
    { label: 'Áreas', items: ['Neurose', 'Psicose', 'Depressão', 'Ansiedade', 'Trauma', 'Luto', 'Sexualidade', 'Transtorno de Personalidade'] },
    { label: 'Público', items: ['Crianças', 'Adolescentes', 'Adultos', 'Casais'] },
  ],
  Pedagogo: [
    { label: 'Atuação', items: ['Educação Infantil', 'Alfabetização', 'Reforço Escolar', 'Orientação Educacional', 'Educação Especial', 'Pedagogia Hospitalar', 'EJA', 'Pedagogia Empresarial'] },
    { label: 'Público', items: ['Bebês', 'Crianças', 'Adolescentes', 'Adultos'] },
  ],
  Outro: [
    { label: 'Áreas', items: ['Saúde Mental', 'Bem-estar', 'Desenvolvimento Pessoal', 'Ansiedade', 'Depressão', 'Qualidade de Vida'] },
  ],
};

// Flat list para filtro do diretório e input custom
const SPECIALTIES_BY_TYPE: Record<string, string[]> = Object.fromEntries(
  Object.entries(SPEC_GROUPS_BY_TYPE).map(([k, groups]) => [k, groups.flatMap(g => g.items)])
);
const DEFAULT_SPECIALTIES = SPECIALTIES_BY_TYPE['Psicólogo'];

// Lista para o filtro do diretório (todas as especialidades possíveis, sem repetição)
const SPECIALTIES = Array.from(new Set(
  Object.values(SPECIALTIES_BY_TYPE).flat()
)).sort();

// Máscara de telefone brasileiro — armazena só dígitos, exibe formatado
function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2)  return d.length ? `(${d}` : '';
  if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}
function unmaskedPhone(masked: string): string {
  return masked.replace(/\D/g, '');
}

function SocialIcon({ type }: { type: string }) {
  const cls = 'w-4 h-4';
  switch (type) {
    case 'instagram': return <Instagram className={cls} />;
    case 'linkedin':  return <Linkedin className={cls} />;
    case 'facebook':  return <Facebook className={cls} />;
    case 'twitter':   return <Twitter className={cls} />;
    case 'tiktok':    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.86a8.28 8.28 0 004.84 1.55V7A4.85 4.85 0 0119.59 6.69z"/>
      </svg>
    );
    case 'website': return <Globe className={cls} />;
    default:        return <Link2 className={cls} />;
  }
}

function SocialLinks({ prof, size = 'sm' }: { prof: Professional; size?: 'sm' | 'md' }) {
  const links: Array<{ type: string; url: string; label?: string }> = [];
  if (prof.contact_whatsapp) links.push({ type: 'whatsapp', url: `https://wa.me/${prof.contact_whatsapp}` });
  if (prof.instagram) links.push({ type: 'instagram', url: prof.instagram.startsWith('http') ? prof.instagram : `https://instagram.com/${prof.instagram.replace('@', '')}` });
  if (prof.linkedin)  links.push({ type: 'linkedin',  url: prof.linkedin.startsWith('http') ? prof.linkedin : `https://linkedin.com/in/${prof.linkedin}` });
  if (prof.facebook)  links.push({ type: 'facebook',  url: prof.facebook.startsWith('http') ? prof.facebook : `https://facebook.com/${prof.facebook}` });
  if (prof.tiktok)    links.push({ type: 'tiktok',    url: prof.tiktok.startsWith('http') ? prof.tiktok : `https://tiktok.com/@${prof.tiktok.replace('@', '')}` });
  if (prof.twitter)   links.push({ type: 'twitter',   url: prof.twitter.startsWith('http') ? prof.twitter : `https://twitter.com/${prof.twitter.replace('@', '')}` });
  if (prof.website)   links.push({ type: 'website',   url: prof.website });
  (prof.extra_links ?? []).forEach(l => links.push({ type: 'link', url: l.url, label: l.label }));

  if (!links.length) return null;

  const iconSize = size === 'md' ? 'w-9 h-9' : 'w-7 h-7';
  const colors: Record<string, string> = {
    whatsapp:  'bg-emerald-500 hover:bg-emerald-600 text-white',
    instagram: 'bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 hover:opacity-90 text-white',
    linkedin:  'bg-blue-600 hover:bg-blue-700 text-white',
    facebook:  'bg-blue-700 hover:bg-blue-800 text-white',
    tiktok:    'bg-black hover:bg-gray-900 text-white',
    twitter:   'bg-sky-500 hover:bg-sky-600 text-white',
    website:   'bg-brand-moss hover:bg-brand-moss-dark text-white',
    link:      'bg-slate-600 hover:bg-slate-700 text-white',
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {links.map((l, i) => (
        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
          title={l.label ?? l.type}
          className={`${iconSize} rounded-xl flex items-center justify-center transition shadow-sm ${colors[l.type] ?? colors.link}`}>
          {l.type === 'whatsapp' ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          ) : (
            <SocialIcon type={l.type} />
          )}
        </a>
      ))}
    </div>
  );
}

function AvatarFallback({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const sizeMap = { sm: 'w-12 h-12 text-sm', md: 'w-20 h-20 text-xl', lg: 'w-28 h-28 text-3xl' };
  return (
    <div className={`${sizeMap[size]} rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500 shrink-0`}>
      {initials}
    </div>
  );
}

interface DirectoryViewProps {
  autoOpenOwnProfile?: boolean;
}

export default function DirectoryView({ autoOpenOwnProfile }: DirectoryViewProps = {}) {
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
  const [eName, setEName]             = useState('');
  const [eProfType, setEProfType]     = useState('Psicólogo');
  const [eCrp, setECrp]               = useState('');
  const [eBio, setEBio]               = useState('');
  const [eAvatar, setEAvatar]         = useState('');
  const [eLocation, setELocation]     = useState('');
  const [eWhatsapp, setEWhatsapp]     = useState('');
  const [eColor, setEColor]           = useState('#a75a35');
  const [eSpecialties, setESpecialties] = useState<string[]>([]);
  const [eServices, setEServices]     = useState<string[]>([]);
  const [eLanguages, setELanguages]   = useState<string[]>([]);
  const [eSchedule, setESchedule]     = useState<string[]>([]);
  const [newService, setNewService]   = useState('');
  const [newSchedule, setNewSchedule] = useState('');
  const [eInstagram, setEInstagram]   = useState('');
  const [eLinkedin, setELinkedin]     = useState('');
  const [eFacebook, setEFacebook]     = useState('');
  const [eTiktok, setETiktok]         = useState('');
  const [eTwitter, setETwitter]       = useState('');
  const [eWebsite, setEWebsite]       = useState('');
  const [eExtraLinks, setEExtraLinks] = useState<Array<{ label: string; url: string }>>([]);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl]   = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [eTheme, setETheme]           = useState<'melodias' | 'minimal' | 'card' | 'dark'>('melodias');
  const [saving, setSaving]           = useState(false);
  const [step, setStep]               = useState(1);
  const [avatarFile, setAvatarFile]   = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // slug
  const [eSlug, setESlug]             = useState('');
  const [slugStatus, setSlugStatus]   = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [slugMessage, setSlugMessage] = useState('');
  const slugTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // endereço detalhado
  const [eCep, setECep]               = useState('');
  const [eStreet, setEStreet]         = useState('');
  const [eNumber, setENumber]         = useState('');
  const [eComplement, setEComplement] = useState('');
  const [eNeighborhood, setENeighborhood] = useState('');
  const [eCity, setECity]             = useState('');
  const [eState, setEState]           = useState('');
  const [cepLoading, setCepLoading]   = useState(false);
  const [cepError, setCepError]       = useState('');

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

  // Vindo do menu de perfil do Header ou do onboarding: abre direto a edição do próprio perfil
  useEffect(() => {
    if (!autoOpenOwnProfile || loading) return;
    const own = professionals.find(p => p.user_id === user?.id);
    if (own) openEdit(own);
    else setView('edit');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenOwnProfile, loading]);

  const isOwn = (prof: Professional) => prof.user_id === user?.id;
  const topRatedCount = professionals.filter(p => toNumericValue(p.rating) >= 4.8).length;

  const LANGUAGES_OPTIONS = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano', 'Alemão'];

  const checkSlugAvailability = (slug: string) => {
    if (slugTimer.current) clearTimeout(slugTimer.current);
    if (!slug) { setSlugStatus('idle'); setSlugMessage(''); return; }
    const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean)) {
      setSlugStatus('invalid');
      setSlugMessage('Use apenas letras minúsculas, números e hífens.');
      return;
    }
    setSlugStatus('checking');
    slugTimer.current = setTimeout(async () => {
      try {
        const res = await professionalsApi.checkSlug(clean);
        if (res.available) {
          setSlugStatus('available');
          setSlugMessage('Disponível!');
        } else {
          setSlugStatus('taken');
          setSlugMessage(res.reason ?? 'Já está em uso.');
        }
      } catch {
        setSlugStatus('idle');
        setSlugMessage('');
      }
    }, 500);
  };

  const handleSlugChange = (raw: string) => {
    const clean = raw.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setESlug(clean);
    checkSlugAvailability(clean);
  };

  const openEdit = (prof: Professional) => {
    setEName(prof.name);
    // Detecta tipo pelo prefixo do registro salvo
    const crpUpper = (prof.crp ?? '').toUpperCase();
    const detectedType = PROF_TYPES.find(t =>
      t.council && crpUpper.startsWith(t.council + ' ') ||
      (t.council === 'CRP' && /^\d{2}\//.test(prof.crp ?? '')) ||
      (t.council === 'CRM' && /^[A-Z]{2}\s/.test(crpUpper))
    )?.label ?? 'Psicólogo';
    setEProfType(detectedType);
    // Remove o prefixo do conselho do número salvo (se tiver)
    const council = PROF_TYPES.find(t => t.label === detectedType)?.council ?? '';
    const rawNum = prof.crp?.replace(new RegExp(`^${council}\\s*`, 'i'), '') ?? '';
    setECrp(rawNum);
    setEBio(prof.bio);
    setEAvatar(prof.avatar ?? '');
    setELocation(prof.location);
    setEWhatsapp(maskPhone(prof.contact_whatsapp ?? ''));
    // Popula endereço — location salvo como "Cidade/UF" simples ou endereço completo
    setECep(''); setEStreet(''); setENumber(''); setEComplement('');
    setENeighborhood(''); setCepError('');
    const loc = prof.location ?? '';
    // Tenta detectar "Cidade/UF" (formato curto)
    const cityUf = loc.match(/^(.+?)\/([A-Z]{2})$/);
    if (cityUf) { setECity(cityUf[1].trim()); setEState(cityUf[2]); }
    else { setECity(loc); setEState(''); }
    setEColor(prof.accent_color ?? '#a75a35');
    setESpecialties(prof.specialties);
    setEServices(prof.services);
    setELanguages(prof.languages ?? []);
    setESchedule(Array.isArray(prof.schedule)
      ? prof.schedule.map(s => typeof s === 'string' ? s : `${(s as {day:string;hours:string}).day} ${(s as {day:string;hours:string}).hours}`)
      : []);
    setEInstagram(prof.instagram ?? '');
    setELinkedin(prof.linkedin ?? '');
    setEFacebook(prof.facebook ?? '');
    setETiktok(prof.tiktok ?? '');
    setETwitter(prof.twitter ?? '');
    setEWebsite(prof.website ?? '');
    setEExtraLinks(prof.extra_links ?? []);
    setESlug(prof.slug ?? '');
    // Detecta modelo pelo campo theme salvo
    const tm = prof.theme ?? '';
    setETheme(tm === 'minimal' ? 'minimal' : tm === 'card' || tm === 'ocean' ? 'card' : tm === 'dark' || tm === 'gold' ? 'dark' : 'melodias');
    setSlugStatus('idle');
    setSlugMessage('');
    setAvatarFile(null);
    setAvatarPreview('');
    setStep(1);
    setSelected(prof);
    setView('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalAvatar = eAvatar || undefined;
      if (avatarFile) {
        const { avatarUrl } = await uploadApi.uploadAvatar(avatarFile);
        finalAvatar = avatarUrl;
      }
      // Monta o registro completo: conselho + número
      const profTypeObj = PROF_TYPES.find(t => t.label === eProfType);
      const council = profTypeObj?.council ?? '';
      const fullCrp = eCrp ? (council ? `${council} ${eCrp}` : eCrp) : '';

      // Monta location a partir dos campos de endereço
      const locationParts = [eStreet && eNumber ? `${eStreet}, ${eNumber}` : eStreet, eComplement, eNeighborhood, eCity && eState ? `${eCity}/${eState}` : eCity].filter(Boolean);
      const builtLocation = locationParts.join(' — ') || eLocation;

      await professionalsApi.updateMe({
        name: eName, crp: fullCrp, bio: eBio,
        avatar: finalAvatar,
        slug: eSlug || undefined,
        location: builtLocation,
        contact_whatsapp: unmaskedPhone(eWhatsapp), accent_color: eColor, theme: eTheme as import('../lib/api').ProfTheme,
        specialties: eSpecialties, services: eServices,
        languages: eLanguages,
        schedule: eSchedule.map(s => {
          const parts = s.trim().split(/\s+/);
          const day = parts[0] ?? s;
          const hours = parts.slice(1).join(' ') || '—';
          return { day, hours };
        }),
        instagram: eInstagram, linkedin: eLinkedin, facebook: eFacebook,
        tiktok: eTiktok, twitter: eTwitter, website: eWebsite,
        extra_links: eExtraLinks,
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
                <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">Diretório de Membros</h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">Conecte-se com nossa rede local em Tatuí.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={load} className="p-2 text-slate-400 hover:text-brand-clay rounded-lg transition">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => { const own = professionals.find(p => p.user_id === user?.id); if (own) openEdit(own); else setView('edit'); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-clay hover:bg-brand-clay-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition">
                <Edit3 className="w-4 h-4" />Meu Perfil
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-brand-sand/60">
            <div className="text-center">
              <p className="text-2xl font-black text-brand-navy">{professionals.length}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Membros</p>
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
          <div id="directory-grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {professionals.map(prof => (
              <React.Fragment key={prof.id}>
              <MemberCard
                prof={prof}
                isOwn={isOwn(prof)}
                onViewProfile={() => {
                  setSelected(prof);
                  setView('detail');
                  setBooked(false);
                  setTimeSlot('');
                  setBookMsg('');
                }}
                onEdit={() => openEdit(prof)}
              />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );

  // ── DETAIL ────────────────────────────────────────────────────────────────────
  if (view === 'detail' && selected) {
    return (
      <ProfDetailView
        prof={selected}
        timeSlot={timeSlot} setTimeSlot={setTimeSlot}
        bookMsg={bookMsg} setBookMsg={setBookMsg}
        booked={booked} setBooked={setBooked}
        onBack={() => { setView('list'); window.history.pushState(null, '', '/diretorio'); }}
      />
    );
  }

  // ── PUBLIC SITE ───────────────────────────────────────────────────────────────
  if (view === 'public-site' && selected) {
    return <ProfessionalPublicSite prof={selected} onBack={() => setView('list')} onSchedule={() => setView('detail')} />;
  }

  // ── EDIT PROFILE ──────────────────────────────────────────────────────────────
  const STEP_LABELS = ['Informações', 'Serviços', 'Redes Sociais', 'Aparência'];
  const STEP_ICONS  = [Stethoscope, MapPin, Link2, Globe];

  return (
    <PageWrapper id="profile-edit-view">
      <SectionTitle
        title="Editar Meu Perfil"
        description="Configure seu perfil público na rede Espalhe Melodias"
        icon={Edit3}
        action={
          <Button variant="outline" iconLeft={<ArrowLeft size={14} />} onClick={() => setView('list')}>
            Cancelar
          </Button>
        }
        divider
      />

      {/* Steps — responsivos */}
      <div className="flex items-center gap-0 mb-6 overflow-x-auto no-scrollbar">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const Icon = STEP_ICONS[i];
          const done    = step > n;
          const active  = step === n;
          return (
            <React.Fragment key={n}>
              <button
                type="button"
                onClick={() => setStep(n)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 ${
                  active ? 'bg-brand-clay text-white shadow-sm shadow-brand-clay/20'
                  : done  ? 'bg-brand-moss/10 text-brand-moss'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                  active ? 'bg-white/30 text-white' : done ? 'bg-brand-moss text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {done ? <Check size={10} /> : n}
                </span>
                <span className="hidden sm:inline">{label}</span>
                <Icon size={13} className="sm:hidden" />
              </button>
              {n < 4 && <div className={`flex-1 h-0.5 min-w-4 rounded-full mx-1 ${step > n ? 'bg-brand-moss' : 'bg-zinc-200'}`} />}
            </React.Fragment>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-5">
            <PanelCard title="Informações Básicas" icon={Stethoscope}>
              <div className="space-y-4">
                {/* Nome + Tipo */}
                <FormRow cols={2}>
                  <Input
                    label="Nome completo"
                    value={eName}
                    onChange={e => setEName(e.target.value)}
                    required
                    placeholder="Seu nome profissional"
                  />
                  {/* Tipo de profissional */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Área de atuação</label>
                    <div className="flex flex-wrap gap-1.5">
                      {PROF_TYPES.map(pt => (
                        <button
                          key={pt.label}
                          type="button"
                          onClick={() => {
                            setEProfType(pt.label);
                            setECrp('');
                            setESpecialties([]);
                          }}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            eProfType === pt.label
                              ? 'bg-brand-clay text-white border-brand-clay shadow-sm'
                              : 'bg-white text-slate-500 border-slate-200 hover:border-brand-clay hover:text-brand-clay'
                          }`}
                        >
                          {pt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </FormRow>

                {/* Registro profissional com máscara dinâmica */}
                {(() => {
                  const pt = PROF_TYPES.find(t => t.label === eProfType)!;
                  return (
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        {pt.council ? `Número do ${pt.council}` : 'Número do registro (opcional)'}
                        <span className="ml-1 text-[10px] font-normal text-slate-400">(opcional)</span>
                      </label>
                      <div className="flex items-center gap-0 rounded-xl border border-brand-sand overflow-hidden focus-within:ring-1 focus-within:ring-brand-clay transition">
                        {pt.council && (
                          <span className="px-3 py-2.5 bg-slate-50 text-xs font-bold text-slate-500 border-r border-brand-sand whitespace-nowrap shrink-0">
                            {pt.council}
                          </span>
                        )}
                        <input
                          type="text"
                          value={eCrp}
                          onChange={e => setECrp(pt.mask(e.target.value))}
                          placeholder={pt.placeholder}
                          className="flex-1 px-3 py-2.5 text-xs font-mono text-brand-navy bg-white outline-none min-w-0"
                        />
                      </div>
                      {!eCrp && (
                        <p className="text-[10px] text-slate-400 mt-1">Se não preenchido, o registro não aparece no seu perfil.</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </PanelCard>

            <PanelCard title="Especialidades & Atuação" icon={Stethoscope} description="Selecione todas que se aplicam à sua prática">
              <div className="space-y-5">
                {/* Grupos temáticos */}
                {(SPEC_GROUPS_BY_TYPE[eProfType] ?? SPEC_GROUPS_BY_TYPE['Outro']).map(group => (
                  <div key={group.label}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{group.label}</p>
                      <button
                        type="button"
                        onClick={() => {
                          const allSelected = group.items.every(s => eSpecialties.includes(s));
                          if (allSelected) {
                            setESpecialties(prev => prev.filter(s => !group.items.includes(s)));
                          } else {
                            setESpecialties(prev => Array.from(new Set([...prev, ...group.items])));
                          }
                        }}
                        className="text-[9px] font-bold text-brand-clay hover:underline"
                      >
                        {group.items.every(s => eSpecialties.includes(s)) ? 'desmarcar todos' : 'marcar todos'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map(s => (
                        <button key={s} type="button"
                          onClick={() => setESpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-2 transition-all ${
                            eSpecialties.includes(s)
                              ? 'bg-brand-clay text-white border-brand-clay shadow-sm'
                              : 'bg-white text-slate-500 border-zinc-200 hover:border-brand-clay hover:text-brand-clay'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Customizadas fora dos grupos */}
                {eSpecialties.filter(s => !(SPECIALTIES_BY_TYPE[eProfType] ?? DEFAULT_SPECIALTIES).includes(s)).length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Adicionadas por você</p>
                    <div className="flex flex-wrap gap-1.5">
                      {eSpecialties.filter(s => !(SPECIALTIES_BY_TYPE[eProfType] ?? DEFAULT_SPECIALTIES).includes(s)).map(s => (
                        <span key={s} className="inline-flex items-center gap-1 bg-brand-clay text-white text-xs font-semibold px-3 py-1.5 rounded-xl">
                          {s}
                          <button type="button" onClick={() => setESpecialties(prev => prev.filter(x => x !== s))}
                            className="hover:text-white/70 transition ml-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input livre */}
                <div className="flex gap-2 pt-1 border-t border-zinc-100">
                  <input
                    type="text"
                    value={newSpecialty}
                    onChange={e => setNewSpecialty(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = newSpecialty.trim();
                        if (val && !eSpecialties.includes(val)) { setESpecialties(prev => [...prev, val]); setNewSpecialty(''); }
                      }
                    }}
                    placeholder="Adicionar que não está na lista..."
                    className="flex-1 text-xs text-brand-navy bg-white border border-brand-sand px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-clay transition"
                  />
                  <button type="button"
                    onClick={() => {
                      const val = newSpecialty.trim();
                      if (val && !eSpecialties.includes(val)) { setESpecialties(prev => [...prev, val]); setNewSpecialty(''); }
                    }}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-brand-sand text-xs font-bold text-brand-clay hover:border-brand-clay hover:bg-brand-sand/30 transition">
                    <Plus className="w-3.5 h-3.5" />Adicionar
                  </button>
                </div>
              </div>
            </PanelCard>

            {/* URL personalizada */}
            <PanelCard title="Endereço Público" icon={Globe} description="Como você quer aparecer na URL do seu site">
              <div>
                <div className="flex items-center gap-0 rounded-xl border border-brand-sand overflow-hidden focus-within:ring-1 focus-within:ring-brand-clay focus-within:border-brand-clay transition">
                  <span className="px-3 py-2.5 bg-slate-50 text-xs text-slate-400 font-mono border-r border-brand-sand whitespace-nowrap shrink-0">
                    /profissional/
                  </span>
                  <input
                    type="text"
                    value={eSlug}
                    onChange={e => handleSlugChange(e.target.value)}
                    placeholder="karen-gomes"
                    className="flex-1 px-3 py-2.5 text-xs font-mono text-brand-navy bg-white outline-none min-w-0"
                    spellCheck={false}
                  />
                  {slugStatus === 'checking' && (
                    <span className="px-3 text-slate-400 text-[10px] shrink-0">verificando...</span>
                  )}
                  {slugStatus === 'available' && (
                    <span className="px-3 text-emerald-600 text-[10px] font-bold shrink-0 flex items-center gap-1">
                      <Check size={11} />Disponível
                    </span>
                  )}
                  {(slugStatus === 'taken' || slugStatus === 'invalid') && (
                    <span className="px-3 text-red-500 text-[10px] font-bold shrink-0 flex items-center gap-1">
                      <X size={11} />{slugStatus === 'invalid' ? 'Inválido' : 'Em uso'}
                    </span>
                  )}
                </div>
                {slugMessage && (
                  <p className={`text-[11px] mt-1 ${slugStatus === 'available' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {slugMessage}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Apenas letras minúsculas, números e hífens. Ex: <span className="font-mono">karen-gomes</span>
                </p>
              </div>
            </PanelCard>

            <PanelCard title="Bio / Apresentação" icon={Stethoscope}>
              <Textarea
                label=""
                value={eBio}
                onChange={e => setEBio(e.target.value)}
                rows={4}
                placeholder="Conte sobre você, sua abordagem e o que oferece..."
                maxLength={600}
              />
            </PanelCard>

            <PanelCard title="Foto de Perfil" icon={Users} description="Escolha uma foto do seu dispositivo">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {(avatarPreview || eAvatar) ? (
                    <img src={avatarPreview || eAvatar} alt="preview"
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-200 border-4 border-white shadow-lg flex items-center justify-center text-xl font-black text-slate-500">
                      {eName.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 rounded-xl border-2 border-dashed border-brand-clay/40 hover:border-brand-clay bg-brand-clay/5 hover:bg-brand-clay/10 transition text-xs font-semibold text-brand-clay">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {avatarFile ? avatarFile.name : 'Selecionar arquivo'}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                      onChange={ev => {
                        const file = ev.target.files?.[0];
                        if (!file) return;
                        const img = new Image();
                        const url = URL.createObjectURL(file);
                        img.onload = () => {
                          const MAX = 800;
                          let { width, height } = img;
                          if (width > MAX || height > MAX) {
                            if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
                            else { width = Math.round(width * MAX / height); height = MAX; }
                          }
                          const canvas = document.createElement('canvas');
                          canvas.width = width; canvas.height = height;
                          canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
                          canvas.toBlob(blob => {
                            if (!blob) return;
                            const compressed = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                            setAvatarFile(compressed);
                            setAvatarPreview(canvas.toDataURL('image/jpeg', 0.85));
                            URL.revokeObjectURL(url);
                          }, 'image/jpeg', 0.85);
                        };
                        img.src = url;
                      }}
                    />
                  </label>
                  {(avatarPreview || eAvatar) && (
                    <button type="button"
                      onClick={() => { setAvatarFile(null); setAvatarPreview(''); setEAvatar(''); }}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
                      <X className="w-3 h-3" /> Remover foto
                    </button>
                  )}
                  <p className="text-[11px] text-slate-400">JPEG, PNG, WEBP ou GIF · comprimida automaticamente</p>
                </div>
              </div>
            </PanelCard>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="space-y-5">
            <PanelCard title="Localização do Atendimento" icon={MapPin}>
              <div className="space-y-4">

                {/* CEP com busca automática */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">CEP</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 max-w-[160px]">
                      <input
                        type="text"
                        value={eCep}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
                          const masked = raw.length > 5 ? `${raw.slice(0,5)}-${raw.slice(5)}` : raw;
                          setECep(masked);
                          setCepError('');
                          if (raw.length === 8) {
                            setCepLoading(true);
                            fetch(`https://viacep.com.br/ws/${raw}/json/`)
                              .then(r => r.json())
                              .then(d => {
                                if (d.erro) { setCepError('CEP não encontrado.'); setCepLoading(false); return; }
                                setEStreet(d.logradouro ?? '');
                                setENeighborhood(d.bairro ?? '');
                                setECity(d.localidade ?? '');
                                setEState(d.uf ?? '');
                                setCepLoading(false);
                              })
                              .catch(() => { setCepError('Erro ao buscar CEP.'); setCepLoading(false); });
                          }
                        }}
                        placeholder="00000-000"
                        className="w-full text-xs font-mono text-brand-navy bg-white border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-clay transition"
                        maxLength={9}
                      />
                      {cepLoading && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                          <RefreshCw className="w-3 h-3 text-brand-clay animate-spin" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 self-center">Preenchimento automático pelo CEP</p>
                  </div>
                  {cepError && <p className="text-[11px] text-red-500 mt-1">{cepError}</p>}
                </div>

                {/* Logradouro + Número */}
                <FormRow cols={2}>
                  <Input
                    label="Rua / Avenida"
                    value={eStreet}
                    onChange={e => setEStreet(e.target.value)}
                    placeholder="Rua das Flores"
                  />
                  <Input
                    label="Número"
                    value={eNumber}
                    onChange={e => setENumber(e.target.value)}
                    placeholder="220"
                  />
                </FormRow>

                {/* Complemento + Bairro */}
                <FormRow cols={2}>
                  <Input
                    label="Complemento"
                    value={eComplement}
                    onChange={e => setEComplement(e.target.value)}
                    placeholder="Sala 3 / Apto 12"
                  />
                  <Input
                    label="Bairro"
                    value={eNeighborhood}
                    onChange={e => setENeighborhood(e.target.value)}
                    placeholder="Centro"
                  />
                </FormRow>

                {/* Cidade + Estado */}
                <FormRow cols={2}>
                  <Input
                    label="Cidade"
                    value={eCity}
                    onChange={e => setECity(e.target.value)}
                    placeholder="Tatuí"
                  />
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Estado (UF)</label>
                    <select
                      value={eState}
                      onChange={e => setEState(e.target.value)}
                      className="w-full text-xs text-brand-navy bg-white border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-clay transition"
                    >
                      <option value="">Selecione</option>
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </FormRow>

                {/* WhatsApp */}
                <Input
                  label="WhatsApp para contato"
                  value={eWhatsapp}
                  onChange={e => setEWhatsapp(maskPhone(e.target.value))}
                  placeholder="(55) 99999-9999"
                  hint="DDI + DDD + número"
                  maxLength={19}
                />
              </div>
            </PanelCard>

            <PanelCard
              title="Serviços Oferecidos"
              icon={Check}
              description="Quais modalidades de atendimento você oferece?"
            >
              <div className="space-y-3">
                {eServices.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5">
                    <Check className="w-4 h-4 text-brand-moss shrink-0" />
                    <span className="text-sm text-slate-700 flex-1">{s}</span>
                    <button type="button" onClick={() => setEServices(prev => prev.filter((_, j) => j !== i))}
                      className="text-zinc-300 hover:text-red-400 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar serviço (ex: Terapia Online)..."
                    value={newService}
                    onChange={e => setNewService(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newService.trim()) { setEServices(p => [...p, newService.trim()]); setNewService(''); } } }}
                    wrapperClassName="flex-1"
                  />
                  <Button type="button" variant="outline" iconLeft={<Plus size={14} />}
                    onClick={() => { if (newService.trim()) { setEServices(p => [...p, newService.trim()]); setNewService(''); } }}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </PanelCard>

            <PanelCard title="Idiomas de Atendimento" icon={Globe} description="Em quais idiomas você consegue atender?">
              <div className="flex flex-wrap gap-2">
                {LANGUAGES_OPTIONS.map(lang => (
                  <button key={lang} type="button"
                    onClick={() => setELanguages(prev => prev.includes(lang) ? prev.filter(x => x !== lang) : [...prev, lang])}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-2 transition-all ${
                      eLanguages.includes(lang)
                        ? 'bg-brand-moss text-white border-brand-moss shadow-sm'
                        : 'bg-white text-slate-600 border-zinc-200 hover:border-brand-moss hover:text-brand-moss'
                    }`}>
                    {lang}
                  </button>
                ))}
              </div>
            </PanelCard>

            <PanelCard title="Horários Disponíveis" icon={Calendar} description="Adicione seus slots de atendimento (ex: Segunda 09:00)">
              <div className="space-y-3">
                {eSchedule.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5">
                    <Calendar className="w-4 h-4 text-brand-clay shrink-0" />
                    <span className="text-sm text-slate-700 flex-1">{s}</span>
                    <button type="button" onClick={() => setESchedule(prev => prev.filter((_, j) => j !== i))}
                      className="text-zinc-300 hover:text-red-400 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Segunda 09:00 ou Terça 14:00-18:00"
                    value={newSchedule}
                    onChange={e => setNewSchedule(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newSchedule.trim()) { setESchedule(p => [...p, newSchedule.trim()]); setNewSchedule(''); } } }}
                    wrapperClassName="flex-1"
                  />
                  <Button type="button" variant="outline" iconLeft={<Plus size={14} />}
                    onClick={() => { if (newSchedule.trim()) { setESchedule(p => [...p, newSchedule.trim()]); setNewSchedule(''); } }}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </PanelCard>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="space-y-5">
            <PanelCard title="Redes Sociais" icon={Link2} description="Aparecerão no seu perfil e site público">
              <FormRow cols={2}>
                {([
                  { key: 'instagram', label: 'Instagram',   placeholder: '@seuperfil',       val: eInstagram, set: setEInstagram },
                  { key: 'whatsapp',  label: 'WhatsApp',    placeholder: '(55) 99999-9999',  val: eWhatsapp,  set: (v: string) => setEWhatsapp(maskPhone(v)) },
                  { key: 'linkedin',  label: 'LinkedIn',    placeholder: 'seu-perfil',        val: eLinkedin,  set: setELinkedin },
                  { key: 'facebook',  label: 'Facebook',    placeholder: 'seuperfil',         val: eFacebook,  set: setEFacebook },
                  { key: 'tiktok',    label: 'TikTok',      placeholder: '@seuperfil',        val: eTiktok,    set: setETiktok },
                  { key: 'twitter',   label: 'Twitter / X', placeholder: '@seuperfil',        val: eTwitter,   set: setETwitter },
                  { key: 'website',   label: 'Site Pessoal',placeholder: 'https://',          val: eWebsite,   set: setEWebsite },
                ] as Array<{ key: string; label: string; placeholder: string; val: string; set: (v: string) => void }>).map(field => (
                  <Input
                    key={field.key}
                    label={field.label}
                    value={field.val}
                    onChange={e => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    iconLeft={<SocialIcon type={field.key} />}
                  />
                ))}
              </FormRow>
            </PanelCard>

            <PanelCard title="Links Extras" icon={ExternalLink} description="Outros sites ou páginas importantes">
              <div className="space-y-3">
                {eExtraLinks.map((l, i) => (
                  <div key={i} className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5">
                    <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700 flex-1 truncate"><strong>{l.label}</strong> — {l.url}</span>
                    <button type="button" onClick={() => setEExtraLinks(prev => prev.filter((_, j) => j !== i))}
                      className="text-zinc-300 hover:text-red-400 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <FormRow cols={2}>
                  <Input
                    label="Nome do link"
                    value={newLinkLabel}
                    onChange={e => setNewLinkLabel(e.target.value)}
                    placeholder="Ex: Meu canal"
                  />
                  <Input
                    label="URL"
                    value={newLinkUrl}
                    onChange={e => setNewLinkUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </FormRow>
                <Button type="button" variant="outline" iconLeft={<Plus size={14} />}
                  onClick={() => { if (newLinkLabel.trim() && newLinkUrl.trim()) { setEExtraLinks(p => [...p, { label: newLinkLabel.trim(), url: newLinkUrl.trim() }]); setNewLinkLabel(''); setNewLinkUrl(''); } }}>
                  Adicionar Link
                </Button>
              </div>
            </PanelCard>
          </div>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && (
          <div className="space-y-5">
            {/* Seletor de modelos */}
            <PanelCard title="Modelo do Site Público" icon={Globe} description="Escolha o layout que melhor representa você">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {([
                  {
                    id: 'melodias' as const,
                    name: 'Melodias',
                    desc: 'Padrão da rede. Hero imersivo com gradiente.',
                    preview: (
                      <div className="h-full rounded-xl overflow-hidden" style={{ background: `linear-gradient(135deg, #0b1309, #172711, ${eColor})` }}>
                        <div className="p-2.5 h-full flex flex-col justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-md" style={{ background: eColor }} />
                            <div className="h-1.5 w-12 rounded-full bg-white/20" />
                          </div>
                          <div>
                            <div className="h-2 w-16 rounded-full bg-white/80 mb-1" />
                            <div className="h-1.5 w-20 rounded-full bg-white/40 mb-2" />
                            <div className="h-1 w-14 rounded-full bg-white/25" />
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: 'minimal' as const,
                    name: 'Minimal',
                    desc: 'Clean e tipográfico. Nome em destaque.',
                    preview: (
                      <div className="h-full rounded-xl overflow-hidden bg-white border border-zinc-100">
                        <div className="h-1" style={{ background: eColor }} />
                        <div className="p-2.5 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full" style={{ background: eColor }} />
                            <div className="h-1.5 w-10 rounded-full bg-zinc-200" />
                          </div>
                          <div className="h-3 w-20 rounded-md bg-zinc-900" />
                          <div className="h-1.5 w-16 rounded-full bg-zinc-200" />
                          <div className="h-6 w-14 rounded-xl" style={{ background: eColor }} />
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: 'card' as const,
                    name: 'Card',
                    desc: 'Sidebar com seu card profissional.',
                    preview: (
                      <div className="h-full rounded-xl overflow-hidden border border-zinc-100 flex gap-1.5 p-1.5" style={{ background: '#f4f4f0' }}>
                        <div className="w-12 rounded-xl bg-white shadow-sm flex flex-col items-center gap-1 py-2 px-1">
                          <div className="w-7 h-7 rounded-lg" style={{ background: eColor }} />
                          <div className="h-1 w-8 rounded bg-zinc-200" />
                          <div className="h-1 w-6 rounded bg-zinc-200" />
                          <div className="h-5 w-8 rounded-lg mt-1" style={{ background: '#25d366' }} />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="h-8 rounded-lg bg-white shadow-sm" />
                          <div className="h-10 rounded-lg bg-white shadow-sm" />
                          <div className="h-6 rounded-lg" style={{ background: eColor }} />
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: 'dark' as const,
                    name: 'Dark',
                    desc: 'Visual escuro premium com glow.',
                    preview: (
                      <div className="h-full rounded-xl overflow-hidden bg-[#0a0a0f] border border-white/5">
                        <div className="p-2.5 h-full flex flex-col gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-md" style={{ background: eColor }} />
                            <div className="h-1.5 w-12 rounded-full bg-white/10" />
                          </div>
                          <div className="flex gap-2 flex-1">
                            <div className="flex-1 flex flex-col gap-1.5 justify-center">
                              <div className="h-2.5 w-16 rounded bg-white/80" />
                              <div className="h-1.5 w-12 rounded bg-white/30" />
                              <div className="h-1 w-14 rounded bg-white/15" />
                              <div className="h-5 w-12 rounded-xl mt-1" style={{ background: eColor }} />
                            </div>
                            <div className="w-12 h-12 rounded-xl self-center" style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1))`, border: '1px solid rgba(255,255,255,0.08)' }} />
                          </div>
                        </div>
                        {/* Glow */}
                        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 40% 50%, ${eColor}25, transparent 60%)` }} />
                      </div>
                    ),
                  },
                ] as const).map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setETheme(tpl.id)}
                    className={`rounded-2xl overflow-hidden border-2 transition-all text-left ${
                      eTheme === tpl.id
                        ? 'border-brand-clay shadow-md shadow-brand-clay/15 scale-[1.02]'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {/* Preview */}
                    <div className="h-28 relative">
                      {tpl.preview}
                    </div>
                    {/* Info */}
                    <div className="bg-white px-3 py-2.5 border-t border-zinc-100">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-black text-zinc-800">{tpl.name}</p>
                        {eTheme === tpl.id && (
                          <span className="text-[9px] font-black text-brand-clay bg-brand-clay/10 px-2 py-0.5 rounded-full">Ativo</span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-snug">{tpl.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </PanelCard>

            {/* Cor de destaque */}
            <PanelCard title="Cor de Destaque" icon={Globe} description="Usada em botões, títulos e detalhes do seu site">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {[
                    { color: '#a75a35', label: 'Clay' },
                    { color: '#5a6242', label: 'Musgo' },
                    { color: '#182638', label: 'Navy' },
                    { color: '#6d28d9', label: 'Violeta' },
                    { color: '#0891b2', label: 'Ciano' },
                    { color: '#dc2626', label: 'Vermelho' },
                    { color: '#b45309', label: 'Âmbar' },
                    { color: '#065f46', label: 'Esmeralda' },
                    { color: '#be185d', label: 'Rosa' },
                    { color: '#1d4ed8', label: 'Azul' },
                  ].map(({ color, label }) => (
                    <button key={color} type="button" onClick={() => setEColor(color)}
                      className="flex flex-col items-center gap-1.5 group">
                      <div className={`w-9 h-9 rounded-2xl border-4 transition-all ${eColor === color ? 'border-zinc-800 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                        style={{ background: color }} />
                      <span className="text-[9px] font-bold text-zinc-400 group-hover:text-zinc-600">{label}</span>
                    </button>
                  ))}
                  {/* Custom */}
                  <div className="flex flex-col items-center gap-1.5">
                    <label className={`w-9 h-9 rounded-2xl border-4 flex items-center justify-center transition-all cursor-pointer hover:scale-105 ${!['#a75a35','#5a6242','#182638','#6d28d9','#0891b2','#dc2626','#b45309','#065f46','#be185d','#1d4ed8'].includes(eColor) ? 'border-zinc-800 scale-110 shadow-lg' : 'border-transparent'}`}
                      style={{ background: eColor }}>
                      <input type="color" value={eColor} onChange={e => setEColor(e.target.value)} className="opacity-0 w-0 h-0 absolute" />
                      <span className="text-[10px] text-white font-black">+</span>
                    </label>
                    <span className="text-[9px] font-bold text-zinc-400">Custom</span>
                  </div>
                </div>

                {/* Minipreview da cor */}
                <div className="rounded-2xl overflow-hidden border border-zinc-200 flex">
                  <div className="w-16 shrink-0" style={{ background: eColor }} />
                  <div className="bg-white px-4 py-3 flex items-center justify-between flex-1">
                    <div>
                      <p className="text-xs font-bold text-zinc-800">Cor escolhida</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{eColor}</p>
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1.5 rounded-full border-2"
                      style={{ color: eColor, borderColor: `${eColor}40`, background: `${eColor}10` }}>
                      Botões & links
                    </span>
                  </div>
                </div>
              </div>
            </PanelCard>
          </div>
        )}

        {/* ── NAVEGAÇÃO ── */}
        <Divider />
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
          {step > 1 ? (
            <Button type="button" variant="outline" iconLeft={<ArrowLeft size={14} />} onClick={() => setStep(s => s - 1)}>
              Voltar
            </Button>
          ) : <div />}
          {step < 4 ? (
            <Button type="button" variant="primary" iconRight={<ChevronRight size={14} />} onClick={() => setStep(s => s + 1)}>
              Continuar
            </Button>
          ) : (
            <Button type="submit" variant="success" loading={saving} iconLeft={saving ? undefined : <Check size={14} />}>
              {saving ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          )}
        </div>
      </form>
    </PageWrapper>
  );
}

// ── MEMBER CARD ──────────────────────────────────────────────────────────────

function MemberCard({ prof, isOwn, onViewProfile, onEdit }: {
  prof: Professional;
  isOwn: boolean;
  onViewProfile: () => void;
  onEdit: () => void;
}) {
  const [imgErr, setImgErr] = React.useState(false);
  const accent   = prof.accent_color ?? '#7c2d3e';
  const initials = prof.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const publicUrl = prof.slug ? `/profissional/${prof.slug}` : `/profissional/${prof.user_id}`;
  const showImg  = !!prof.avatar && !imgErr;

  return (
    <div className="bg-white border border-brand-sand/60 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group flex flex-col overflow-visible">

      {/* ── Banner (sem overflow-hidden, para o avatar sobrepor) ── */}
      <div
        className="relative h-28 rounded-t-2xl overflow-hidden shrink-0"
        style={{ background: `linear-gradient(135deg, ${accent}dd 0%, ${accent}88 100%)` }}
      >
        {/* Decoração de fundo */}
        <span className="absolute -top-3 -right-3 w-20 h-20 rounded-full border border-white/10" />
        <span className="absolute bottom-2 left-4 text-2xl text-white/10 font-serif select-none">♩</span>
        <span className="absolute top-3 right-10 text-lg text-white/10 font-serif select-none">♫</span>

        {/* Badge "Você" */}
        {isOwn && (
          <span className="absolute top-2.5 left-3 text-[9px] bg-white/25 text-white px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">
            Você
          </span>
        )}

        {/* Link site público */}
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          title="Abrir site público"
          className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-bold text-white/75 hover:text-white bg-black/20 hover:bg-black/40 px-2 py-1 rounded-full transition backdrop-blur-sm border border-white/15"
        >
          <Globe className="w-2.5 h-2.5" />Site
        </a>
      </div>

      {/* ── Avatar sobreposto — fora do banner ── */}
      <div className="flex justify-center -mt-9 mb-0 z-10 relative">
        {showImg ? (
          <img
            src={prof.avatar}
            alt={prof.name}
            onError={() => setImgErr(true)}
            className="w-[72px] h-[72px] rounded-full object-cover border-[3px] border-white shadow-lg"
          />
        ) : (
          <div
            className="w-[72px] h-[72px] rounded-full border-[3px] border-white shadow-lg flex items-center justify-center text-lg font-black"
            style={{ background: `linear-gradient(135deg, ${accent}30, ${accent}70)`, color: accent }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* ── Conteúdo ── */}
      <div className="px-4 pt-2.5 pb-4 flex flex-col flex-1">

        {/* Nome + CRP */}
        <div className="text-center mb-2.5">
          <h3 className="text-sm font-bold text-slate-800 group-hover:text-brand-clay transition leading-snug">
            {prof.name}
          </h3>
          {prof.crp && (
            <span className="inline-block mt-1 text-[9px] font-mono bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full tracking-wider">
              {prof.crp}
            </span>
          )}
        </div>

        {/* Especialidades (pills pequenas) */}
        {prof.specialties?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mb-2.5">
            {prof.specialties.slice(0, 3).map(s => (
              <span
                key={s}
                className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}30` }}
              >
                {s}
              </span>
            ))}
            {prof.specialties.length > 3 && (
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                +{prof.specialties.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Localização */}
        {prof.location && (
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-2.5">
            <MapPin className="w-3 h-3 shrink-0" style={{ color: accent }} />
            {prof.location}
          </div>
        )}

        {/* Bio snippet */}
        {prof.bio && (
          <p className="text-[11px] text-slate-400 text-center leading-relaxed mb-3 line-clamp-2 flex-1">
            {prof.bio}
          </p>
        )}
        {!prof.bio && <div className="flex-1" />}

        {/* Botão Ver Perfil */}
        <button
          onClick={onViewProfile}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-white text-[11px] font-bold rounded-xl transition-all active:scale-95 mb-2.5 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${accent}ee, ${accent}bb)` }}
        >
          <Users className="w-3.5 h-3.5" />Ver Perfil
        </button>

        {/* Social links */}
        <div className="flex justify-center">
          <SocialLinks prof={prof} size="sm" />
        </div>
      </div>
    </div>
  );
}

// ── PROFESSIONAL PUBLIC SITE ──────────────────────────────────────────────────

const WA_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── Detalhe do profissional ──────────────────────────────────────────────────

function DetailSectionLabel({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-0.5 h-4 rounded-full shrink-0" style={{ background: accent }} />
      <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: accent }}>{label}</p>
    </div>
  );
}

function ProfDetailView({ prof, timeSlot, setTimeSlot, bookMsg, setBookMsg, booked, setBooked, onBack }: {
  prof: Professional;
  timeSlot: string; setTimeSlot: (v: string) => void;
  bookMsg: string; setBookMsg: (v: string) => void;
  booked: boolean; setBooked: (v: boolean) => void;
  onBack: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const accent   = prof.accent_color || '#5a7a3a';
  const rating   = toNumericValue(prof.rating);
  const initials = prof.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  const showImg  = !!prof.avatar && !imgError;
  const publicUrl = prof.slug ? `/profissional/${prof.slug}` : `/profissional/${prof.user_id}`;
  const hasSocials = !!(prof.contact_whatsapp || prof.instagram || prof.linkedin || prof.facebook || prof.twitter || prof.website || prof.tiktok || (prof.extra_links ?? []).length);

  return (
    <PageWrapper id={`directory-detail-${prof.id}`}>
      <div className="animate-fadeIn pb-12">

        {/* ── Voltar ── */}
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-clay mb-5 transition group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Voltar ao diretório
        </button>

        {/* ── Banner com gradiente ── */}
        <div className="relative h-28 sm:h-36 rounded-2xl overflow-hidden mb-0"
          style={{ background: `linear-gradient(135deg, #0a0f0a 0%, #14201a 45%, ${accent} 100%)` }}>
          <span className="absolute top-3 left-5 text-5xl opacity-[0.07] font-serif text-white select-none">♩</span>
          <span className="absolute bottom-3 right-10 text-3xl opacity-[0.07] font-serif text-white select-none">♫</span>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer"
            className="absolute top-3 right-3 flex items-center gap-1.5 text-[11px] font-bold text-white/75 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition border border-white/15 backdrop-blur-sm">
            <Globe className="w-3 h-3" />Ver site público
          </a>
        </div>

        {/* ── Layout: sidebar + conteúdo ── */}
        <div className="flex flex-col lg:flex-row gap-4 items-start">

          {/* ── Sidebar esquerda ── */}
          <div className="w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-4 space-y-3 -mt-10 lg:-mt-16 relative z-10">

            {/* Card principal do profissional */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              {/* Avatar centralizado */}
              <div className="flex flex-col items-center px-5 pt-5 pb-4 text-center">
                {showImg ? (
                  <img src={prof.avatar} alt={prof.name} onError={() => setImgError(true)}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl mb-3"
                    style={{ boxShadow: `0 6px 20px ${accent}30` }} />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-2xl font-black mb-3"
                    style={{ background: `linear-gradient(135deg, ${accent}30, ${accent}70)`, color: accent }}>
                    {initials}
                  </div>
                )}
                <h2 className="text-base font-black text-slate-900 leading-tight mb-0.5">{prof.name}</h2>
                {prof.crp && (
                  <span className="inline-block text-[10px] font-mono font-bold px-2.5 py-1 rounded-full mb-2"
                    style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}28` }}>
                    {prof.crp}
                  </span>
                )}
                {rating > 0 && (
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'fill-amber-400 stroke-amber-400' : 'stroke-slate-200'}`} />
                    ))}
                    <span className="text-xs font-black text-amber-600 ml-1">{rating.toFixed(1)}</span>
                  </div>
                )}
                {/* Botão WhatsApp */}
                {prof.contact_whatsapp && (
                  <a href={`https://wa.me/${prof.contact_whatsapp.replace(/\D/g,'')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition active:scale-95 mt-1 mb-2">
                    <Phone className="w-4 h-4" />Chamar WhatsApp
                  </a>
                )}
                {/* Redes sociais ícones */}
                {hasSocials && <div className="mt-1"><SocialLinks prof={prof} size="sm" /></div>}
              </div>

              {/* Localização */}
              {prof.location && (
                <div className="border-t border-slate-100 px-5 py-3 flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accent }} />
                  <span className="text-xs text-slate-600 font-medium leading-snug">{prof.location}</span>
                </div>
              )}

              {/* Idiomas */}
              {prof.languages?.length > 0 && (
                <div className="border-t border-slate-100 px-5 py-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Idiomas</p>
                  <div className="flex flex-wrap gap-1">
                    {prof.languages.map((l: string) => (
                      <span key={l} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Card de agendamento */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: accent }}>Agendar Consulta</p>
              {booked ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Solicitado!</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">O profissional confirmará em breve.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea rows={2} placeholder="Mensagem inicial (opcional)..." value={bookMsg}
                    onChange={e => setBookMsg(e.target.value)}
                    className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-1 transition resize-none"
                    style={{ '--tw-ring-color': `${accent}30` } as React.CSSProperties} />
                  <button onClick={() => { if (timeSlot) setBooked(true); }}
                    disabled={!timeSlot}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white text-xs font-bold rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: timeSlot ? accent : '#94a3b8' }}>
                    <Calendar className="w-3.5 h-3.5" />
                    {timeSlot ? `Agendar: ${timeSlot}` : 'Selecione um horário abaixo'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Conteúdo principal direita ── */}
          <div className="flex-1 min-w-0 space-y-3 mt-3 lg:mt-4">

            {/* Bio */}
            {prof.bio && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <DetailSectionLabel label="Sobre Mim / Biografia" accent={accent} />
                <p className="text-sm text-slate-600 leading-relaxed">{prof.bio}</p>
              </div>
            )}

            {/* Especialidades */}
            {prof.specialties?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <DetailSectionLabel label="Especialidades" accent={accent} />
                <div className="flex flex-wrap gap-1.5">
                  {prof.specialties.map(s => (
                    <span key={s} className="text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: `${accent}10`, color: accent, border: `1.5px solid ${accent}28` }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Serviços */}
            {prof.services?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <DetailSectionLabel label="Serviços Oferecidos" accent={accent} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {prof.services.map(s => (
                    <div key={s} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium px-3 py-2.5 rounded-xl"
                      style={{ background: `${accent}08`, border: `1px solid ${accent}15` }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white"
                        style={{ background: accent }}>
                        <Check className="w-3 h-3" />
                      </div>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agenda */}
            {prof.schedule?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <DetailSectionLabel label="Horários Disponíveis" accent={accent} />
                <div className="flex flex-wrap gap-2">
                  {prof.schedule.map(slot => (
                    <button key={`${slot.day}-${slot.hours}`}
                      onClick={() => setTimeSlot(`${slot.day} ${slot.hours}`)}
                      className="text-xs px-3 py-2 rounded-xl font-semibold transition-all"
                      style={timeSlot === `${slot.day} ${slot.hours}`
                        ? { background: accent, color: '#fff', boxShadow: `0 4px 12px ${accent}40` }
                        : { background: `${accent}0d`, color: accent, border: `1.5px solid ${accent}25` }
                      }>
                      {slot.day} {slot.hours}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

// ─── Preview do site público (dentro do admin) ────────────────────────────────

function ProfessionalPublicSite({ prof, onBack, onSchedule }: {
  prof: Professional;
  onBack: () => void;
  onSchedule: () => void;
}) {
  const accent = prof.accent_color ?? '#a75a35';
  const initials = prof.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const hasSocialLinks = !!(
    prof.contact_whatsapp || prof.instagram || prof.linkedin ||
    prof.facebook || prof.tiktok || prof.twitter || prof.website ||
    (prof.extra_links ?? []).length > 0
  );

  return (
    <div className="min-h-screen" style={{ background: '#f5ede3' }}>

      {/* Barra interna de navegação */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[#e8d8c8] px-4 py-2.5 flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-[#5a6242] hover:text-[#3d4a2e] transition">
          <ArrowLeft className="w-4 h-4" />Voltar ao diretório
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `linear-gradient(135deg, #3d4a2e, ${accent})` }}>
            <span className="text-[9px] text-white font-black italic">♩Ψ</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 hidden sm:block">Espalhe Melodias</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-12">

        {/* ── HERO ── */}
        <div className="relative mb-6">
          {/* Capa com decorações musicais */}
          <div className="h-52 rounded-b-[2.5rem] overflow-hidden relative"
            style={{ background: `linear-gradient(135deg, #2d3a1e 0%, ${accent} 50%, #4a5530 100%)` }}>
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
              <span className="absolute top-3 left-5 text-5xl font-serif text-white/10">♩</span>
              <span className="absolute top-6 right-8 text-4xl font-serif text-white/10">♫</span>
              <span className="absolute bottom-8 left-1/3 text-6xl font-serif text-white/8">♪</span>
              <span className="absolute bottom-4 right-6 text-3xl font-serif text-white/10">♬</span>
              {/* Círculos decorativos */}
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full border border-white/10" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full border border-white/10" />
            </div>
            {/* Logo Melodias no hero */}
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

          {/* Avatar flutuando sobre o hero */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-14">
            {prof.avatar ? (
              <img src={prof.avatar} alt={prof.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-2xl" />
            ) : (
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-3xl font-black"
                style={{ background: `linear-gradient(135deg, ${accent}40, ${accent}80)`, color: accent }}>
                {initials}
              </div>
            )}
            {/* Badge verificado */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" style={{ color: '#5a6242' }} />
            </div>
          </div>
        </div>

        {/* ── NOME + INFO PRINCIPAL ── */}
        <div className="text-center pt-16 pb-5 px-4">
          <h1 className="font-serif text-2xl font-black text-[#2d3a1e] leading-tight">{prof.name}</h1>
          {prof.crp && (
            <p className="text-xs font-mono text-[#a75a35] font-semibold mt-1 tracking-wider">
              {prof.crp}
            </p>
          )}
          {/* Avaliação */}
          {toNumericValue(prof.rating) > 0 && (
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(toNumericValue(prof.rating)) ? 'fill-amber-400 stroke-amber-400' : 'stroke-slate-200 fill-white'}`} />
              ))}
              <span className="text-xs font-bold text-slate-500 ml-1">{toNumericValue(prof.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* ── ESPECIALIDADES ── */}
        {prof.specialties.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 px-4 mb-5">
            {prof.specialties.map(s => (
              <span key={s}
                className="text-[11px] font-bold px-3 py-1.5 rounded-full border-2"
                style={{ background: `${accent}12`, color: accent, borderColor: `${accent}30` }}>
                {s}
              </span>
            ))}
          </div>
        )}

        {/* ── BIO ── */}
        {prof.bio && (
          <div className="bg-white/70 backdrop-blur rounded-2xl px-5 py-4 mb-4 mx-1 border border-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-0.5 h-4 rounded-full" style={{ background: accent }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>Sobre</span>
            </div>
            <p className="text-sm text-[#3d3d3d] leading-relaxed">{prof.bio}</p>
          </div>
        )}

        {/* ── BOTÕES CTA ── */}
        <div className="flex gap-3 px-1 mb-4">
          {prof.contact_whatsapp && (
            <a href={`https://wa.me/${prof.contact_whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white text-sm font-black rounded-2xl transition-all active:scale-95 shadow-lg"
              style={{ background: `linear-gradient(135deg, #25d366, #128c7e)`, boxShadow: '0 4px 15px rgba(37,211,102,0.3)' }}>
              {WA_ICON}
              Entrar em contato
            </a>
          )}
          <button onClick={onSchedule}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white text-sm font-black rounded-2xl transition-all active:scale-95 shadow-md border-2"
            style={{ borderColor: `${accent}50`, color: accent, boxShadow: `0 4px 15px ${accent}20` }}>
            <Calendar className="w-4 h-4" />Agendar
          </button>
        </div>

        {/* ── DETALHES ── */}
        {prof.location && (
          <div className="bg-white/70 backdrop-blur rounded-2xl overflow-hidden mb-4 mx-1 border border-white shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${accent}15` }}>
                <MapPin className="w-4 h-4" style={{ color: accent }} />
              </div>
              <span className="text-sm text-[#3d3d3d] font-medium">{prof.location}</span>
            </div>
          </div>
        )}

        {/* ── SERVIÇOS ── */}
        {prof.services.length > 0 && (
          <div className="bg-white/70 backdrop-blur rounded-2xl px-5 py-4 mb-4 mx-1 border border-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-0.5 h-4 rounded-full" style={{ background: '#5a6242' }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#5a6242]">Serviços</span>
            </div>
            <div className="space-y-2.5">
              {prof.services.map(s => (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${accent}15` }}>
                    <Check className="w-3 h-3" style={{ color: accent }} />
                  </div>
                  <span className="text-sm text-[#3d3d3d]">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REDES SOCIAIS ── */}
        {hasSocialLinks && (
          <div className="bg-white/70 backdrop-blur rounded-2xl px-5 py-4 mb-4 mx-1 border border-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-0.5 h-4 rounded-full" style={{ background: '#182638' }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#182638]">Redes & Links</span>
            </div>
            <SocialLinks prof={prof} size="md" />
          </div>
        )}

        {/* ── BADGE MELODIAS ── */}
        <div className="mx-1 mb-4 rounded-2xl overflow-hidden shadow-lg border border-white">
          <div className="px-5 py-4 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #2d3a1e 0%, #3d4a2e 50%, #182638 100%)' }}>
            {/* Logo */}
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex flex-col items-center justify-center shrink-0 border border-white/20">
              <span className="text-lg font-serif font-black italic text-white leading-none">♩Ψ</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-white font-black text-sm leading-tight">Rede Espalhe Melodias</p>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
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

        {/* Footer */}
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
