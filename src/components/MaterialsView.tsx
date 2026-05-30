import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  FileText, 
  Download, 
  BookMarked, 
  Volume2, 
  Share2,
  ExternalLink,
  Lock,
  Plus,
  Play,
  Pause,
  Clock,
  Heart,
  Sparkles
} from 'lucide-react';
import { SupportMaterial, AppUser } from '../types';

interface MaterialsViewProps {
  materials: SupportMaterial[];
  currentUser: AppUser;
  onAddMaterial: (title: string, category: any, type: any, description: string, restricted: boolean) => void;
}

export default function MaterialsView({
  materials,
  currentUser,
  onAddMaterial
}: MaterialsViewProps) {
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [currentFormat, setCurrentFormat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic material addition state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Ansiedade' | 'Depressão' | 'Autocuidado' | 'Relacionamentos' | 'Meditação' | 'Geral'>('Ansiedade');
  const [newType, setNewType] = useState<'E-book' | 'PDF' | 'Áudio' | 'Guia de Exercícios' | 'Infográfico'>('E-book');
  const [newDesc, setNewDesc] = useState('');
  const [newRestricted, setNewRestricted] = useState(false);

  // Audio simulation state inside drawer
  const [activePlaybackMaterial, setActivePlaybackMaterial] = useState<SupportMaterial | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(30); //%

  const categories = ['Ansiedade', 'Depressão', 'Autocuidado', 'Relacionamentos', 'Meditação', 'Geral'];
  const formats = ['E-book', 'PDF', 'Áudio', 'Guia de Exercícios', 'Infográfico'];

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = currentCategory === 'all' || m.category === currentCategory;
    const matchesFormat = currentFormat === 'all' || m.type === currentFormat;
    return matchesSearch && matchesCategory && matchesFormat;
  });

  const handleAddNewMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      alert('Favor preencher o título e descrição!');
      return;
    }
    onAddMaterial(newTitle, newCategory, newType, newDesc, newRestricted);
    setNewTitle('');
    setNewDesc('');
    setNewRestricted(false);
    setShowAddForm(false);
  };

  const getFormatIcon = (formatType: string) => {
    switch (formatType) {
      case 'E-book': return <BookMarked className="w-5 h-5 text-indigo-600" />;
      case 'PDF': return <FileText className="w-5 h-5 text-rose-600 animate-pulse" />;
      case 'Áudio': return <Volume2 className="w-5 h-5 text-emerald-600" />;
      default: return <BookOpen className="w-5 h-5 text-amber-600" />;
    }
  };

  const handleStartPlay = (material: SupportMaterial) => {
    setActivePlaybackMaterial(material);
    setIsPlaying(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="materials-main-view">
      
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-105 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-800 tracking-tight flex items-center">
            📚 Biblioteca de Apoio Emocional & Relaxamento
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manuais práticos, e-books explicativos, podcasts informativos e áudios guiados estruturados por especialistas.
          </p>
        </div>

        {currentUser.role !== 'member' && !showAddForm && (
          <button
            id="btn-trigger-add-material"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 bg-[#581a2e] hover:bg-[#3d1220] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Documento / Guia</span>
          </button>
        )}
      </div>

      {/* --- ADD MATERIAL FORM --- */}
      {showAddForm && (
        <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              ➕ Cadastrar Material na Biblioteca
            </h3>
            <button 
              onClick={() => setShowAddForm(false)} 
              className="text-xs text-slate-400 hover:text-slate-800"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleAddNewMaterial} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Título do Material:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Diário Filosófico de Resiliência"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#581a2e]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Categoria Emocional:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs text-slate-705 bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#581a2e]"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Formato / Tipo:</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full text-xs text-slate-705 bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#581a2e]"
                >
                  {formats.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resumo / Descrição Explicativa:</label>
              <textarea
                placeholder="Explique ao paciente o que ele vai aprender ao ler ou escutar este material de apoio..."
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full text-xs text-slate-707 bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#581a2e]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="restricted-chk"
                checked={newRestricted}
                onChange={(e) => setNewRestricted(e.target.checked)}
                className="w-4 h-4 accent-[#581a2e]"
              />
              <label htmlFor="restricted-chk" className="text-xs text-slate-500 font-medium cursor-pointer">
                Restringir acesso apenas a membros ativos cadastrados (Privado Melodias)
              </label>
            </div>

            <div className="flex justify-end space-x-3.5 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 uppercase cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#581a2e] hover:bg-[#3d1220] text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Confirmar Cadastro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- INTEGRATED AUDIO / READING DRAWER PREVIEW --- */}
      {activePlaybackMaterial && (
        <div className="p-5 bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-900 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse-slow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-full border border-white/20 text-indigo-400 animate-spin-slow">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#a855f7]">Tocador de Exercício Guiado</span>
              <p className="text-sm font-bold">{activePlaybackMaterial.title}</p>
              <p className="text-xs text-slate-350">Narrado por: {activePlaybackMaterial.authorName}</p>
            </div>
          </div>

          {/* Interactive Player Simulation Controls */}
          <div className="flex items-center space-x-4 flex-1 max-w-sm">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-full bg-white text-slate-900 hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-slate-900" /> : <Play className="w-4 h-4 fill-slate-900 ml-0.5" />}
            </button>
            
            <div className="flex-1 space-y-1">
              <div className="w-full bg-white/25 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#a855f7] h-full transition-all duration-300" style={{ width: `${playbackProgress}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>03:22</span>
                <span>{isPlaying ? 'Tocando Áudio...' : 'Pausado'}</span>
                <span>10:00</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => { setActivePlaybackMaterial(null); setIsPlaying(false); }}
            className="text-xs text-white/60 hover:text-white border border-white/20 hover:border-white px-3 py-1 rounded-lg"
          >
            Fechar Playback
          </button>
        </div>
      )}

      {/* --- FILTER INTERFACE --- */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        
        {/* Categories list */}
        <div className="flex flex-wrap gap-1 md:gap-1.5 max-w-full overflow-x-auto pb-1">
          <button
            onClick={() => setCurrentCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition whitespace-nowrap ${
              currentCategory === 'all' 
                ? 'bg-[#581a2e] text-white border-transparent' 
                : 'bg-white text-slate-600 border-slate-205 hover:bg-slate-50'
            }`}
          >
            Todos os Temas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCurrentCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition whitespace-nowrap ${
                currentCategory === cat 
                  ? 'bg-[#581a2e] text-white border-transparent' 
                  : 'bg-white text-slate-600 border-slate-205 hover:bg-slate-50'
              }`}
            >
              🎯 {cat}
            </button>
          ))}
        </div>

        {/* Text Search & File format dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          
          <div className="relative w-full sm:w-60">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Pesquisar materiais..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-slate-700 bg-white border border-slate-200 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#581a2e]"
            />
          </div>

          <select
            value={currentFormat}
            onChange={(e) => setCurrentFormat(e.target.value)}
            className="w-full sm:w-44 text-xs text-slate-700 bg-white border border-slate-200 p-2 rounded-xl focus:outline-none"
          >
            <option value="all">Todos os formatos</option>
            {formats.map(format => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>

        </div>

      </div>

      {/* --- MATERIALS LIST GRID --- */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-105">
          <p className="text-sm font-semibold text-slate-500">Nenhum material de apoio catalogado com critérios informados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((mat) => (
            <div 
              key={mat.id} 
              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:border-[#581a2e] hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="bg-slate-55 border bg-slate-50 border-slate-150 px-2.5 py-0.5 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    {mat.category}
                  </span>
                  
                  {mat.restrictedToMembers && (
                    <span className="bg-amber-100 border border-amber-200 text-amber-850 px-2 py-0.5 rounded text-[9px] font-bold flex items-center">
                      <Lock className="w-3 h-3 mr-1" /> Premium
                    </span>
                  )}
                </div>

                <div className="flex items-start space-x-3">
                  <span className="p-2.5 bg-slate-50 rounded-xl block shrink-0 mt-0.5">
                    {getFormatIcon(mat.type)}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 leading-tight">
                      {mat.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 block mt-1">Por {mat.authorName}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-3">
                  {mat.description}
                </p>
              </div>

              {/* Download / Active Simulated play control */}
              <div className="flex items-center justify-between pt-3.5 border-t border-slate-50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Formato: {mat.type}
                </span>

                {mat.type === 'Áudio' ? (
                  <button
                    id={`btn-listen-${mat.id}`}
                    onClick={() => handleStartPlay(mat)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white hover:scale-[1.01] transition-all text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>Ouvir Áudio</span>
                  </button>
                ) : (
                  <button
                    id={`btn-download-${mat.id}`}
                    onClick={() => {
                      alert(`💾 Simulação de Download concluída! O arquivo "${mat.title}.pdf" foi salvo no seu dispositivo com dicas exclusivas de saúde mental.`);
                    }}
                    className="px-4 py-2 bg-[#581a2e] hover:bg-[#3d1220] hover:scale-[1.01] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar PDF</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
