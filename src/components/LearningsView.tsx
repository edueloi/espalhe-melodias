import React, { useState } from 'react';
import { 
  BookMarked, 
  Search, 
  Clock, 
  ArrowLeft, 
  PenTool, 
  ThumbsUp, 
  Share2, 
  CheckCircle,
  HelpCircle,
  Sparkles,
  FileText,
  Image,
  Layers,
  Heart,
  Bookmark
} from 'lucide-react';
import { BlogPost, AppUser } from '../types';

interface LearningsViewProps {
  blogs: BlogPost[];
  currentUser: AppUser;
  onAddBlog: (title: string, excerpt: string, content: string, category: string, imageUrl: string) => void;
}

export default function LearningsView({
  blogs,
  currentUser,
  onAddBlog
}: LearningsViewProps) {
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  
  // Blog submission states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogExcerpt, setNewBlogExcerpt] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');
  const [newBlogCategory, setNewBlogCategory] = useState('Autoconhecimento');
  const [selectedPresetImage, setSelectedPresetImage] = useState('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=700&auto=format&fit=crop');
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Likes/Bookmarked Simulation state
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});

  const presetImages = [
    { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=700&auto=format&fit=crop', label: 'Meditação / Equilíbrio' },
    { url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=700&auto=format&fit=crop', label: 'Caminho / Luz solar' },
    { url: 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?q=80&w=700&auto=format&fit=crop', label: 'Escrita / Registro' },
    { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=700&auto=format&fit=crop', label: 'Yoga / Relaxamento' },
    { url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=700&auto=format&fit=crop', label: 'Natureza / Paz' }
  ];

  const categories = ['todos', 'Informação', 'Estilo de Vida', 'Autoconhecimento', 'Curiosidades'];

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'todos' || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const activeBlog = blogs.find(b => b.id === selectedBlogId);

  const handleCreateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle.trim() || !newBlogContent.trim() || !newBlogExcerpt.trim()) {
      alert('Favor preencher o título, resumo de chamada e conteúdo do artigo!');
      return;
    }

    setSuccessAnimation(true);
    setTimeout(() => {
      onAddBlog(
        newBlogTitle,
        newBlogExcerpt,
        newBlogContent,
        newBlogCategory,
        selectedPresetImage
      );
      // Reset forms state
      setNewBlogTitle('');
      setNewBlogExcerpt('');
      setNewBlogContent('');
      setShowAddForm(false);
      setSuccessAnimation(false);
    }, 1500);
  };

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="blog-main-view">
      
      {/* 1. BRAND PLATFORM BANNER HEADER */}
      <div className="bg-gradient-to-br from-brand-sand/50 via-[#fcfaf7] to-white border border-brand-sand rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-brand-clay animate-pulse"></span>
            <span className="text-[10px] font-bold text-brand-clay uppercase tracking-widest font-sans">Blog Científico Oficial</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-navy tracking-tight">
            Sinfonias da Mente <span className="font-script text-brand-clay font-normal text-3xl md:text-4xl block sm:inline-block">e Aprendizados</span>
          </h2>
          <p className="text-xs text-brand-navy-light max-w-xl leading-relaxed">
            Nossos psicoterapeutas compartilham saberes sobre equilíbrio emocional, autotransparência e saúde integrativa. Todos os textos são validados academicamente antes da publicação externa.
          </p>
        </div>

        {/* Action Button for Professionals and Admins */}
        {currentUser.role !== 'member' && !showAddForm && (
          <button
            id="btn-trigger-write-article"
            onClick={() => setShowAddForm(true)}
            className="px-5 py-3 bg-brand-clay hover:bg-brand-clay-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer grow-0 shrink-0"
          >
            <PenTool className="w-4 h-4 text-brand-sand" />
            <span>Redigir Novo Artigo</span>
          </button>
        )}
      </div>

      {/* --- PREMIUM BLOG MAKER FORM (FORMULÁRIO LINDO) --- */}
      {showAddForm && (
        <div className="bg-white border border-brand-sand rounded-3xl overflow-hidden shadow-xl animate-scaleUp grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Form Editor */}
          <div className="lg:col-span-7 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-brand-sand">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-brand-clay/10 rounded-xl text-brand-clay">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-navy">Redator de Artigos Editoriais</h3>
                  <p className="text-[10px] text-brand-navy-light">Espalhe melodias e saberes para a comunidade</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-xs font-bold text-slate-400 hover:text-brand-clay transition cursor-pointer"
              >
                Voltar à Listagem
              </button>
            </div>

            {successAnimation ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center animate-fadeIn">
                <span className="w-16 h-16 rounded-full bg-brand-moss/10 text-brand-moss flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-9 h-9 stroke-[2.5]" />
                </span>
                <p className="font-serif font-bold text-brand-navy text-lg">Publicando artigo...</p>
                <p className="text-xs text-brand-navy-light max-w-xs">Registrando seu ensinamento na plataforma científica "Espalhe Melodias".</p>
              </div>
            ) : (
              <form onSubmit={handleCreateBlog} className="space-y-5">
                
                {/* Block 1: Category and Title */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8 space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider flex items-center">
                      <FileText className="w-3.5 h-3.5 text-brand-moss mr-1" /> Título do Artigo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: A sinfonia do sono: regulando o relógio biológico"
                      value={newBlogTitle}
                      onChange={(e) => setNewBlogTitle(e.target.value)}
                      className="w-full text-xs text-brand-navy bg-[#FAF8F5] border border-brand-sand p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 focus:border-brand-clay transition-all"
                    />
                  </div>

                  <div className="sm:col-span-4 space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider flex items-center">
                      <Layers className="w-3.5 h-3.5 text-brand-moss mr-1" /> Categoria
                    </label>
                    <select
                      value={newBlogCategory}
                      onChange={(e) => setNewBlogCategory(e.target.value)}
                      className="w-full text-xs text-brand-navy bg-[#FAF8F5] border border-brand-sand p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 focus:border-brand-clay transition-all"
                    >
                      <option value="Informação">Informação</option>
                      <option value="Estilo de Vida">Estilo de Vida</option>
                      <option value="Autoconhecimento">Autoconhecimento</option>
                      <option value="Curiosidades">Curiosidades</option>
                    </select>
                  </div>
                </div>

                {/* Block 2: Excerpt */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">
                    Resumo Curto (Chamada de Capa)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Escreva uma frase marcante e sucinta que chame o leitor para o card principal..."
                    value={newBlogExcerpt}
                    onChange={(e) => setNewBlogExcerpt(e.target.value)}
                    className="w-full text-xs text-brand-navy bg-[#FAF8F5] border border-brand-sand p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 focus:border-brand-clay transition-all"
                  />
                </div>

                {/* Block 3: Image selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider flex items-center">
                    <Image className="w-3.5 h-3.5 text-brand-moss mr-1" /> Escolha a Imagem de Capa
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {presetImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedPresetImage(img.url)}
                        className={`relative rounded-lg overflow-hidden h-14 border-2 transition-all ${
                          selectedPresetImage === img.url ? 'border-brand-clay scale-[1.03] shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-brand-navy/60 text-[8px] text-white py-0.5 truncate text-center">
                          {img.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Block 4: Long Content */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">
                    Corpo do Texto Científico (Suporta parágrafos)
                  </label>
                  <textarea
                    placeholder="Digite o artigo completo. Seja profundo, use analogias musicais e insights práticos de cuidado e respiração..."
                    rows={10}
                    required
                    value={newBlogContent}
                    onChange={(e) => setNewBlogContent(e.target.value)}
                    className="w-full text-xs text-brand-navy bg-[#FAF8F5] border border-brand-sand p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 focus:border-brand-clay transition-all leading-relaxed"
                  />
                </div>

                {/* Buttons controls */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-brand-sand/50">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2.5 border border-brand-sand hover:bg-brand-sand/30 rounded-xl text-xs font-bold text-brand-navy uppercase transition cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-moss hover:bg-brand-moss-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer"
                  >
                    Publicar no Site Melodias
                  </button>
                </div>

              </form>
            )}
          </div>

          {/* Right Real-time Live Preview Card Simulation */}
          <div className="lg:col-span-5 bg-brand-sand/20 p-6 md:p-8 flex flex-col justify-center border-l border-brand-sand/40">
            <div className="space-y-4 max-w-sm mx-auto">
              <span className="text-[10px] text-brand-clay font-bold tracking-widest uppercase block text-center mb-1">
                ✧ Pré-visualização em Tempo Real ✧
              </span>

              {/* Card visualizer */}
              <div className="bg-white border border-brand-sand rounded-3xl overflow-hidden shadow-xl max-w-sm">
                <img 
                  src={selectedPresetImage} 
                  alt="preview layout" 
                  className="w-full h-40 object-cover"
                />
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="bg-brand-moss/10 text-brand-moss-dark px-2.5 py-0.5 rounded-full uppercase">
                      {newBlogCategory}
                    </span>
                    <span className="text-slate-400">Novo Ensinamento</span>
                  </div>

                  <h4 className="text-sm font-serif font-bold text-brand-navy line-clamp-2 min-h-[40px]">
                    {newBlogTitle || 'Título que você está digitando no campo esquerda...'}
                  </h4>

                  <p className="text-xs text-brand-navy-light line-clamp-2 min-h-[32px] leading-relaxed">
                    {newBlogExcerpt || 'Escreva o resumo curto para ver aqui a síntese cativante do card.'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-brand-sand/40">
                    <div className="flex items-center space-x-2">
                      <img src={currentUser.avatar} alt="author" className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-[9px] font-bold text-brand-navy">{currentUser.name}</span>
                    </div>
                    <span className="text-[9px] text-[#a75a35] font-bold">Ler Artigo →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- CHOSEN SINGLE ARTICLE DETAILED READ (MEDIUM/NEWSLETTER CARD STYLE) --- */}
      {selectedBlogId && activeBlog ? (
        <div className="bg-white border border-brand-sand rounded-3xl p-6 md:p-12 shadow-md max-w-3xl mx-auto animate-scaleUp space-y-6">
          
          <button
            id="back-to-blogs"
            onClick={() => setSelectedBlogId(null)}
            className="flex items-center text-xs font-bold text-brand-navy-light hover:text-brand-clay transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Sinfonias da Mente
          </button>

          <header className="space-y-4">
            <span className="bg-brand-sand text-brand-clay-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {activeBlog.category}
            </span>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-navy tracking-tight leading-tight">
              {activeBlog.title}
            </h1>

            {/* Premium Author signature card under title */}
            <div className="flex items-center justify-between border-y border-brand-sand/60 py-4 my-2">
              <div className="flex items-center space-x-3">
                <img 
                  src={activeBlog.authorAvatar} 
                  alt={activeBlog.authorName} 
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-sand shadow-inner"
                />
                <div>
                  <p className="text-xs font-bold text-brand-navy flex items-center">
                    Escrito por: {activeBlog.authorName}
                    <span className="ml-1.5 text-[9px] bg-brand-moss text-white px-1.5 py-0.2 rounded font-sans uppercase">Pro</span>
                  </p>
                  <p className="text-[10px] text-brand-navy-light">Corpo Técnico de Saúde Mental • Espalhe Melodias</p>
                </div>
              </div>

              <div className="text-right text-[10px] text-brand-navy-light font-medium">
                <p>Publicação: {activeBlog.date}</p>
                <p className="flex items-center justify-end mt-0.5 text-brand-clay-dark">
                  <Clock className="w-3 h-3 mr-1" /> {activeBlog.readTime}
                </p>
              </div>
            </div>
          </header>

          <img 
            src={activeBlog.imageUrl} 
            alt={activeBlog.title} 
            className="w-full h-80 rounded-2xl object-cover shadow-sm border border-brand-sand"
          />

          {/* Subtitle / Excerpt Intro in high serif blockquote */}
          <div className="border-l-4 border-brand-clay pl-4 italic text-brand-navy/80 font-serif leading-relaxed text-base">
            "{activeBlog.excerpt}"
          </div>

          {/* Core Markdown-emulated text */}
          <div className="text-sm text-brand-navy-light leading-relaxed font-sans space-y-6 text-justify whitespace-pre-line px-1 md:px-4">
            {activeBlog.content}
          </div>

          {/* Special brand callout matching slide theme */}
          <div className="p-5 bg-brand-sand/30 border border-brand-sand rounded-2xl space-y-2 mt-8 text-center text-xs">
            <p className="font-serif font-bold text-brand-navy">Conectando Profissionais. Fortalecendo Cuidados.</p>
            <p className="text-brand-navy-light italic">"Espalhe Melodias é um ecossistema com propósito de criar caminhos acolhedores e sadios."</p>
          </div>

          {/* Interactive footer for liking blogs */}
          <div className="pt-5 border-t border-brand-sand/60 flex justify-between items-center text-xs text-brand-navy-light">
            <button 
              onClick={(e) => toggleLike(activeBlog.id, e)}
              className={`flex items-center space-x-1 font-bold transition ${
                likedPosts[activeBlog.id] ? 'text-brand-clay' : 'hover:text-brand-clay'
              }`}
            >
              <Heart className={`w-4.5 h-4.5 ${likedPosts[activeBlog.id] ? 'fill-brand-clay stroke-brand-clay' : ''}`} />
              <span>{likedPosts[activeBlog.id] ? 'Você gostou deste artigo!' : 'Marcar como Leitura Útil'}</span>
            </button>
            
            <button 
              onClick={() => {
                alert('📋 Copiado link de compartilhamento do artigo científico de Espalhe Melodias!');
              }}
              className="font-bold text-brand-moss hover:text-brand-moss-dark flex items-center space-x-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Gerar Link de Compartilhamento</span>
            </button>
          </div>

        </div>
      ) : (
        
        /* --- MAIN BRANDED BLOG GRID LIST --- */
        <div className="space-y-6">
          
          {/* Filtering and search controllers */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Organic Category badges selector */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all whitespace-nowrap ${
                    activeCategory === cat 
                      ? 'bg-brand-moss text-white border-transparent shadow-sm shadow-brand-moss/10' 
                      : 'bg-white text-brand-navy-light border-brand-sand/60 hover:bg-brand-sand/30'
                  }`}
                >
                  {cat === 'todos' ? 'Ver Todos os Temas' : `🌿 ${cat}`}
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <div className="relative w-full md:w-80 shrink-0">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-brand-navy-light/60" />
              </span>
              <input
                type="text"
                placeholder="Pesquisar por palavras-chave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs text-brand-navy bg-white border border-brand-sand pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-moss"
              />
            </div>
          </div>

          {/* GRID OF COMPLETED ARTICLES */}
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-16 bg-white border border-brand-sand rounded-3xl p-6">
              <p className="text-sm font-semibold text-brand-navy-light">Nenhum artigo científico corresponde aos filtros selecionados.</p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategory('todos'); }}
                className="mt-3 text-xs text-brand-clay font-bold underline"
              >
                Limpar Filtros e Busca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((post) => (
                <div 
                  key={post.id}
                  onClick={() => setSelectedBlogId(post.id)}
                  className="bg-white border border-brand-sand/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:border-brand-clay"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-50 border-b border-brand-sand/40">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-350"
                    />
                    
                    {/* Floating top category banner */}
                    <span className="absolute top-3 left-3 bg-brand-sand/90 backdrop-blur-md border border-brand-sand text-brand-navy font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                      {post.category}
                    </span>

                    {/* Bookmark interactive option */}
                    <button 
                      onClick={(e) => toggleBookmark(post.id, e)}
                      className="absolute top-3 right-3 p-1.5 bg-white/85 backdrop-blur-md rounded-full text-brand-navy-light hover:text-brand-clay shadow hover:scale-105 transition"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${bookmarkedPosts[post.id] ? 'fill-brand-clay text-brand-clay' : ''}`} />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                        <span className="flex items-center text-brand-clay mr-2"> Publicado por profissional</span>
                        <span className="flex items-center text-brand-navy-light/65">
                          <Clock className="w-3 h-3 mr-0.5" /> {post.readTime}
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-serif font-bold text-brand-navy line-clamp-2 leading-snug group-hover:text-brand-clay transition">
                        {post.title}
                      </h3>
                      <p className="text-xs text-brand-navy-light font-normal line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-3.5 border-t border-brand-sand/50">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={post.authorAvatar} 
                          alt="author" 
                          className="w-6 h-6 rounded-full object-cover border border-brand-sand" 
                        />
                        <span className="text-[10px] text-brand-navy font-semibold">{post.authorName}</span>
                      </div>
                      
                      <button
                        id={`btn-read-blog-${post.id}`}
                        onClick={() => setSelectedBlogId(post.id)}
                        className="text-[10px] font-bold text-brand-moss-dark group-hover:text-brand-clay uppercase tracking-wider flex items-center"
                      >
                        Ler →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
