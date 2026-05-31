import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, FileText, Download, BookMarked,
  Volume2, Lock, Plus, Play, Pause, X,
  Headphones, FileImage, BookCopy, Filter
} from 'lucide-react';
import { AppUser } from '../types';
import { PageWrapper, SectionTitle, ContentCard } from './ui/PageWrapper';
import { Badge } from './ui/Badge';
import { materialsApi, type Material } from '../lib/api';

interface MaterialsViewProps {
  currentUser: AppUser;
}

const CATEGORIES = ['Ansiedade', 'Depressão', 'Autocuidado', 'Relacionamentos', 'Meditação', 'Geral'] as const;
const FORMATS = ['E-book', 'PDF', 'Áudio', 'Guia de Exercícios', 'Infográfico'] as const;

const FORMAT_META: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  'E-book':           { icon: BookMarked,  color: 'text-violet-600', bg: 'bg-violet-50',  label: 'E-book' },
  'PDF':              { icon: FileText,    color: 'text-rose-600',   bg: 'bg-rose-50',    label: 'PDF' },
  'Áudio':            { icon: Headphones,  color: 'text-emerald-600',bg: 'bg-emerald-50', label: 'Áudio' },
  'Guia de Exercícios':{ icon: BookOpen,   color: 'text-amber-600',  bg: 'bg-amber-50',   label: 'Guia' },
  'Infográfico':      { icon: FileImage,   color: 'text-blue-600',   bg: 'bg-blue-50',    label: 'Infográfico' },
};

const CAT_COLORS: Record<string, 'default' | 'success' | 'info' | 'warning' | 'danger' | 'purple' | 'teal'> = {
  'Ansiedade':       'warning',
  'Depressão':       'info',
  'Autocuidado':     'success',
  'Relacionamentos': 'purple',
  'Meditação':       'teal',
  'Geral':           'default',
};

export default function MaterialsView({ currentUser }: MaterialsViewProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [fmtFilter, setFmtFilter] = useState('all');
  const [search, setSearch]       = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress]   = useState(30);

  // form state
  const [fTitle, setFTitle]   = useState('');
  const [fCat, setFCat]       = useState<typeof CATEGORIES[number]>('Ansiedade');
  const [fType, setFType]     = useState<typeof FORMATS[number]>('E-book');
  const [fDesc, setFDesc]     = useState('');
  const [fPrivate, setFPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadMaterials = () => {
    setLoading(true);
    materialsApi.list({
      category: catFilter !== 'all' ? catFilter : undefined,
      type: fmtFilter !== 'all' ? fmtFilter : undefined,
      search: search || undefined,
      limit: 100,
    })
      .then(res => setMaterials(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMaterials(); }, [catFilter, fmtFilter, search]);

  const filtered = materials;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim() || !fDesc.trim()) return;
    setSubmitting(true);
    try {
      await materialsApi.create({ title: fTitle, category: fCat, type: fType, description: fDesc, downloadUrl: '#', restrictedToMembers: fPrivate });
      setFTitle(''); setFDesc(''); setFPrivate(false); setShowForm(false);
      loadMaterials();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const playingMat = materials.find(m => m.id === playingId);

  return (
    <PageWrapper id="materials-main-view">
      <div className="space-y-5 sm:space-y-6 animate-fadeIn">

        {/* ── HEADER ── */}
        <ContentCard padding="md" id="materials-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-brand-clay/10 rounded-xl shrink-0">
                <BookCopy className="w-5 h-5 text-brand-clay" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-brand-clay uppercase tracking-widest">Biblioteca Oficial</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-clay animate-pulse" />
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">
                  Materiais de Apoio Emocional
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">
                  E-books, áudios guiados, guias práticos e infográficos estruturados por especialistas da comunidade.
                </p>
              </div>
            </div>

            {currentUser.role !== 'member' && !showForm && (
              <button
                id="btn-trigger-add-material"
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-clay hover:bg-brand-clay-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-brand-clay/20 transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                Adicionar Material
              </button>
            )}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-brand-sand/60">
            {[
              { label: 'Total', value: materials.length, color: 'text-brand-navy' },
              { label: 'Públicos', value: materials.filter(m => !m.restricted_to_members).length, color: 'text-brand-moss' },
              { label: 'Premium', value: materials.filter(m => m.restricted_to_members).length, color: 'text-brand-clay' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* ── ADD FORM ── */}
        {showForm && (
          <ContentCard padding="lg" id="material-add-form">
            <div className="flex items-center justify-between pb-4 border-b border-brand-sand mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-clay/10 rounded-xl">
                  <Plus className="w-4 h-4 text-brand-clay" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-navy">Cadastrar Novo Material</h3>
                  <p className="text-[10px] text-slate-400">Enriqueça a biblioteca da comunidade</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-brand-clay hover:bg-brand-clay/5 rounded-lg transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form id="material-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categoria</label>
                  <select id="material-cat-select" value={fCat} onChange={e => setFCat(e.target.value as any)}
                    className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-1 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Formato</label>
                  <select id="material-type-select" value={fType} onChange={e => setFType(e.target.value as any)}
                    className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition">
                    {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-1 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Acesso</label>
                  <div className="flex items-center gap-2 h-[38px] px-3 bg-brand-cream border border-brand-sand rounded-xl">
                    <input type="checkbox" id="restricted-chk" checked={fPrivate} onChange={e => setFPrivate(e.target.checked)}
                      className="w-4 h-4 accent-brand-clay" />
                    <label htmlFor="restricted-chk" className="text-xs text-slate-600 cursor-pointer select-none">Somente membros</label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Título do Material</label>
                <input id="material-title-input" type="text" required
                  placeholder="Ex: Diário Filosófico de Resiliência"
                  value={fTitle} onChange={e => setFTitle(e.target.value)}
                  className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Descrição</label>
                <textarea id="material-desc-textarea" rows={3} required
                  placeholder="Explique o que o membro vai aprender com este material..."
                  value={fDesc} onChange={e => setFDesc(e.target.value)}
                  className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition resize-none" />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-brand-sand/50">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 border border-brand-sand hover:bg-brand-sand/40 rounded-xl text-xs font-bold text-brand-navy transition">
                  Cancelar
                </button>
                <button id="btn-submit-material" type="submit"
                  className="px-5 py-2.5 bg-brand-clay hover:bg-brand-clay-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition">
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </ContentCard>
        )}

        {/* ── AUDIO PLAYER ── */}
        {playingMat && (
          <div id="audio-player" className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-navy-light/30 bg-gradient-to-r from-brand-navy-dark via-[#1a2f45] to-brand-navy shadow-xl">
            {/* bg note */}
            <div className="absolute top-2 right-6 text-7xl font-script text-white/5 select-none pointer-events-none">♫</div>
            <div className="relative z-10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-3 rounded-xl bg-white/10 border border-white/20 shrink-0 ${playingId ? 'animate-pulse' : ''}`}>
                  <Headphones className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Tocador Guiado</p>
                  <p className="text-sm font-bold text-white truncate">{playingMat.title}</p>
                  <p className="text-[11px] text-slate-400">Por {playingMat.author_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-1 max-w-xs">
                <button onClick={() => setPlayingId(playingId ? null : playingMat.id)}
                  className="p-2.5 rounded-full bg-white text-brand-navy hover:scale-105 active:scale-95 transition shrink-0">
                  {playingId ? <Pause className="w-4 h-4 fill-brand-navy" /> : <Play className="w-4 h-4 fill-brand-navy ml-0.5" />}
                </button>
                <div className="flex-1 space-y-1">
                  <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>03:22</span>
                    <span className="font-semibold text-emerald-400">{playingId ? 'Tocando...' : 'Pausado'}</span>
                    <span>10:00</span>
                  </div>
                </div>
              </div>

              <button onClick={() => setPlayingId(null)}
                className="text-xs text-white/50 hover:text-white border border-white/20 hover:border-white px-3 py-1.5 rounded-lg transition shrink-0">
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* ── FILTERS ── */}
        <div id="materials-filters" className="flex flex-col gap-3">
          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            <button id="filter-cat-all" onClick={() => setCatFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition whitespace-nowrap ${catFilter === 'all' ? 'bg-brand-navy text-white border-transparent shadow-sm' : 'bg-white text-slate-600 border-brand-sand hover:bg-brand-sand/30'}`}>
              Todos os Temas
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat} id={`filter-cat-${cat}`} onClick={() => setCatFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition whitespace-nowrap ${catFilter === cat ? 'bg-brand-navy text-white border-transparent shadow-sm' : 'bg-white text-slate-600 border-brand-sand hover:bg-brand-sand/30'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Search + format */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input id="materials-search" type="text" placeholder="Pesquisar materiais..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full text-xs text-brand-navy bg-white border border-brand-sand pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-navy transition" />
            </div>
            <div className="relative sm:w-44">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select id="materials-format-filter" value={fmtFilter} onChange={e => setFmtFilter(e.target.value)}
                className="w-full text-xs text-brand-navy bg-white border border-brand-sand pl-8 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-navy transition appearance-none">
                <option value="all">Todos os formatos</option>
                {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── GRID ── */}
        {filtered.length === 0 ? (
          <div id="materials-empty" className="text-center py-16 bg-white border border-brand-sand rounded-2xl">
            <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">Nenhum material encontrado</p>
            <button onClick={() => { setSearch(''); setCatFilter('all'); setFmtFilter('all'); }}
              className="mt-3 text-xs text-brand-clay font-bold hover:underline">
              Limpar filtros
            </button>
          </div>
        ) : (
          <div id="materials-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map(mat => {
              const fmt = FORMAT_META[mat.type] ?? FORMAT_META['E-book'];
              const FmtIcon = fmt.icon;
              const isAudio = mat.type === 'Áudio';
              const isPlaying = playingId === mat.id;

              return (
                <div key={mat.id} id={`material-card-${mat.id}`}
                  className="bg-white border border-brand-sand/60 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col group">

                  {/* Color accent top bar */}
                  <div className={`h-1 w-full ${isAudio ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : fmt.color.replace('text-', 'bg-')}`} />

                  <div className="p-4 sm:p-5 flex flex-col flex-1 gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${fmt.bg} shrink-0`}>
                          <FmtIcon className={`w-4.5 h-4.5 ${fmt.color}`} />
                        </div>
                        <div className="min-w-0">
                          <Badge color={CAT_COLORS[mat.category] ?? 'default'} size="sm">
                            {mat.category}
                          </Badge>
                        </div>
                      </div>
                      {mat.restrictedToMembers && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                          <Lock className="w-3 h-3" />
                          Premium
                        </div>
                      )}
                    </div>

                    {/* Title + author */}
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-brand-navy leading-snug group-hover:text-brand-clay transition line-clamp-2">
                        {mat.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">Por {mat.author_name} · {mat.date_added}</p>
                      <p className="text-xs text-slate-500 leading-relaxed mt-2.5 line-clamp-3">
                        {mat.description}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-between pt-3.5 border-t border-brand-sand/50">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${fmt.color}`}>
                        {fmt.label}
                      </span>

                      {isAudio ? (
                        <button
                          id={`btn-listen-${mat.id}`}
                          onClick={() => setPlayingId(isPlaying ? null : mat.id)}
                          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase rounded-xl transition ${
                            isPlaying
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          {isPlaying ? 'Pausar' : 'Ouvir'}
                        </button>
                      ) : (
                        <button
                          id={`btn-download-${mat.id}`}
                          onClick={() => alert(`💾 Download de "${mat.title}" iniciado!`)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-brand-clay text-white text-xs font-bold uppercase rounded-xl hover:bg-brand-clay-dark transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Baixar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
