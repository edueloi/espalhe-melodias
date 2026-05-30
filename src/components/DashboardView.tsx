import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  BookOpen, 
  MessageSquare, 
  Lightbulb, 
  ArrowRight,
  Sparkles,
  Bookmark,
  Share2,
  Calendar,
  Send,
  Heart,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AppUser, SupportMaterial, ForumTopic, SupportRequest, SuggestionIdea } from '../types';

interface DashboardViewProps {
  currentUser: AppUser;
  totalMembersCount: number;
  activeMembersCount: number;
  pendingApprovalCount: number;
  enrollmentsCount: number;
  materialsCount: number;
  forumCount: number;
  suggestionsCount: number;
  suggestions: SuggestionIdea[];
  onsetTab: (tabId: string) => void;
  onAddSuggestion: (content: string) => void;
  upcomingEventsCount: number;
}

export default function DashboardView({
  currentUser,
  totalMembersCount,
  activeMembersCount,
  pendingApprovalCount,
  enrollmentsCount,
  materialsCount,
  forumCount,
  suggestionsCount,
  suggestions,
  onsetTab,
  onAddSuggestion,
  upcomingEventsCount
}: DashboardViewProps) {
  const [suggestionText, setSuggestionText] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState('17:07');

  // Clock Update Effect (matches the photo's time element elegantly!)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    onAddSuggestion(suggestionText);
    setSuggestionText('');
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 3000);
  };

  const formattedDate = "Sábado, 30 de Maio de 2026";

  const getUrgencyText = (roleName: string) => {
    switch (roleName) {
      case 'super-admin': return 'Super Administrador · Acesso Total';
      case 'professional': return 'Profissional de Saúde · Consultório Credenciado';
      case 'member': return 'Associado Regular · Melodias Care';
      default: return 'Usuário Conectado';
    }
  };

  // Preloaded quotes for mental strength to make the app's contents beautiful on dashboard
  const supportQuotes = [
    { text: "A cura não significa que o dano nunca existiu. Significa que o dano não controla mais a nossa vida.", author: "TCC" },
    { text: "Suas falhas não definem você. Seus recomeços corajosos sim.", author: "Mindfulness" },
    { text: "Há uma fresta em tudo. É por onde a luz consegue entrar.", author: "Leonard Cohen" }
  ];
  const [currentQuoteIndex] = useState(0);

  return (
    <div className="space-y-8 animate-fadeIn" id="dashboard-view-wrapper">
      
      {/* 1. Melodias Elegant Banner matching the loaded layout exactly */}
      <div className="relative bg-gradient-to-r from-[#581a2e] to-[#7f2642] text-white p-8 rounded-3xl shadow-xl overflow-hidden border border-rose-900/40">
        {/* Background decorative vector shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-[#a855f7]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="space-y-4 max-w-2xl">
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-white/10 text-pink-200 border border-white/20 rounded-full text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow mr-1 text-pink-400" />
              Portal de Acolhimento Ativo
            </span>
            <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
              👋 Olá, {currentUser.name}!
            </h1>
            <p className="text-pink-100/95 text-base font-normal max-w-xl">
              Bem-vindo de volta ao <span className="font-semibold text-white">Sistema Melodias</span>. Aqui está um resumo consolidado do ecossistema e das ferramentas de saúde mental integradas hoje.
            </p>
            <div className="inline-flex items-center px-4 py-1.5 bg-[#401220]/85 border border-[#6b1e38] rounded-xl text-xs font-medium text-pink-100/90 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              {getUrgencyText(currentUser.role)}
            </div>
          </div>

          {/* Screenshot Matching Clock and Date Panel */}
          <div className="mt-6 md:mt-0 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner flex flex-col items-center justify-center text-center select-none min-w-[210px]">
            <div className="flex items-center space-x-2 text-white/70">
              <Clock className="w-5 h-5 text-pink-300" />
              <span className="text-xs uppercase tracking-widest font-semibold text-pink-200/90">Hora de Brasília</span>
            </div>
            <span id="dashboard-clock" className="text-5xl font-mono font-bold tracking-tight text-white py-1">
              {currentTime}
            </span>
            <span id="dashboard-date" className="text-xs font-medium text-pink-100/90 font-sans mt-0.5">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Visual counters grid styled precisely like the screenshot */}
      <h2 className="text-lg font-serif font-bold text-slate-800 tracking-tight flex items-center">
        <span className="w-1.5 h-6 bg-[#581a2e] rounded-sm mr-2.5"></span>
        Panorama & Métricas da Plataforma
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        
        {/* Total Membros */}
        <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm flex flex-col justify-between hover:scale-[1.02] hover:border-slate-200 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-pink-100/60 text-[#581a2e] rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-[10px] bg-slate-100 font-semibold px-2 py-0.5 text-slate-500 rounded-full">Melodias</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{totalMembersCount}</span>
            <p className="text-[10px] font-bold text-slate-400/80 uppercase tracking-wider mt-1">TOTAL MEMBROS</p>
            <p className="text-[10px] text-slate-400 mt-0.5">0 inat. · 1 pend.</p>
          </div>
        </div>

        {/* Membros Ativos */}
        <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm flex flex-col justify-between hover:scale-[1.02] hover:border-slate-200 transition duration-150 border-t-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded-md text-[9px]">93%</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{activeMembersCount}</span>
            <p className="text-[10px] font-bold text-slate-400/80 uppercase tracking-wider mt-1">MEMBROS ATIVOS</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">93% do total</p>
          </div>
        </div>

        {/* Aguardando Aprovação (Clickable to trigger solicitudes view for dynamic interaction!) */}
        <div 
          onClick={() => onsetTab('admin-solicitacoes')} 
          className={`bg-white p-4.5 rounded-2xl shadow-sm flex flex-col justify-between hover:scale-[1.02] transition duration-150 cursor-pointer border ${
            pendingApprovalCount > 0 ? 'border-amber-300 bg-amber-50/10' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`p-2 rounded-xl ${pendingApprovalCount > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
              <Users className="w-5 h-5" />
            </span>
            {pendingApprovalCount > 0 && (
              <span className="text-[9px] bg-amber-600 text-white font-bold px-1 rounded">PENDENTE</span>
            )}
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{pendingApprovalCount}</span>
            <p className="text-[11px] font-bold text-slate-400/80 uppercase tracking-wider mt-1">AGUARDANDO</p>
            <p className="text-[10px] text-amber-600 font-bold mt-0.5 underline hover:text-amber-700">Clique para aprovar</p>
          </div>
        </div>

        {/* Inscrições Este Mês */}
        <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm flex flex-col justify-between hover:scale-[1.02] hover:border-slate-200 transition duration-150 border-t-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-[10px] text-slate-450 uppercase font-mono font-medium">mês</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{enrollmentsCount}</span>
            <p className="text-[10px] font-bold text-slate-400/80 uppercase tracking-wider mt-1">EM EVENTOS</p>
            <p className="text-[10px] text-slate-450 mt-0.5">0 esta semana</p>
          </div>
        </div>

        {/* Materiais na Biblioteca */}
        <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm flex flex-col justify-between hover:scale-[1.02] hover:border-slate-200 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-purple-55 text-purple-700 bg-purple-50 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{materialsCount}</span>
            <p className="text-[10px] font-bold text-slate-400/80 uppercase tracking-wider mt-1">MATERIAIS</p>
            <p className="text-[10px] text-slate-450 mt-0.5">Guias explicativos</p>
          </div>
        </div>

        {/* Tópicos no Fórum */}
        <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm flex flex-col justify-between hover:scale-[1.02] hover:border-slate-200 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{forumCount}</span>
            <p className="text-[10px] font-bold text-slate-400/80 uppercase tracking-wider mt-1">TÓPICOS FÓRUM</p>
            <p className="text-[10px] text-slate-450 mt-0.5">Compartilhamento</p>
          </div>
        </div>

        {/* Sugestões Abertas */}
        <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm flex flex-col justify-between hover:scale-[1.02] hover:border-slate-200 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Lightbulb className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{suggestionsCount}</span>
            <p className="text-[10px] font-bold text-slate-400/80 uppercase tracking-wider mt-1">SUGESTÕES</p>
            <p className="text-[10px] text-slate-450 mt-0.5">Iniciativas ativas</p>
          </div>
        </div>

      </div>

      {/* 3. Ações Rápidas & Right Column Sidebar (Caixa de Ideias, Melodias Stats) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Actions Hub */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center">
                <span className="w-1 h-4 bg-teal-555 bg-teal-600 mr-2 rounded-sm inline-block"></span>
                🚀 Painel de Ações Rápidas
              </h3>
              <p className="text-xs text-slate-400">Atalhos mais acessados</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Biblioteca */}
              <button 
                onClick={() => onsetTab('materiais-apoio')}
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-[#581a2e]/5 border border-slate-100 rounded-xl transition text-left cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <span className="p-2 bg-rose-50 text-[#581a2e] rounded-lg">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#581a2e]">Biblioteca Apoio</p>
                    <p className="text-[10px] text-slate-450">Ebooks, áudios e manuais</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-350 mr-2 group-hover:translate-x-1 transition" />
              </button>

              {/* Fórum */}
              <button 
                onClick={() => onsetTab('forum')}
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-[#581a2e]/5 border border-slate-100 rounded-xl transition text-left cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <MessageSquare className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#581a2e]">Fórum Oficial</p>
                    <p className="text-[10px] text-slate-450">Debater e tirar dúvidas</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-350 mr-2 group-hover:translate-x-1 transition" />
              </button>

              {/* Enviar Ideia */}
              <a 
                href="#caixa-de-ideias"
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-[#581a2e]/5 border border-slate-100 rounded-xl transition text-left cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Lightbulb className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#581a2e]">Enviar Ideia</p>
                    <p className="text-[10px] text-slate-450">Sugerir novos encontros</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-350 mr-2 group-hover:translate-x-1 transition" />
              </a>

              {/* WhatsApp Support simulating Melodias */}
              <a 
                href="https://wa.me/5511999990001" 
                target="_blank" 
                rel="referrer noopener"
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-[#581a2e]/5 border border-slate-100 rounded-xl transition text-left cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Share2 className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#581a2e]">WhatsApp Suporte</p>
                    <p className="text-[10px] text-slate-450">Canal direto Melodias</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-350 mr-2 group-hover:translate-x-1 transition" />
              </a>

              {/* Solicitações */}
              {currentUser.role === 'super-admin' ? (
                <button 
                  onClick={() => onsetTab('admin-solicitacoes')}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-[#581a2e]/5 border border-slate-100 rounded-xl transition text-left cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                      <Users className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-[#581a2e]">Solicitações ({pendingApprovalCount})</p>
                      <p className="text-[10px] text-slate-450">Cadastros pendentes</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-350 mr-2 group-hover:translate-x-1 transition" />
                </button>
              ) : (
                <button 
                  onClick={() => onsetTab('diretorio-membros')}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-[#581a2e]/5 border border-slate-100 rounded-xl transition text-left cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                      <Users className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-[#581a2e]">Buscar psicólogo</p>
                      <p className="text-[10px] text-slate-450">Ver sites individuais</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-350 mr-2 group-hover:translate-x-1 transition" />
                </button>
              )}

              {/* Add Material (requires Professional/Admin) */}
              {currentUser.role !== 'member' ? (
                <button 
                  onClick={() => onsetTab('admin-materiais')}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-[#581a2e]/5 border border-slate-100 rounded-xl transition text-left cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="p-2 bg-[#581a2e]/10 text-[#581a2e] rounded-lg">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-[#581a2e]">Inserir Novo Material</p>
                      <p className="text-[10px] text-slate-450">Fazer envio de e-book ou áudio</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-350 mr-2 group-hover:translate-x-1 transition" />
                </button>
              ) : (
                <button 
                  onClick={() => onsetTab('preciso-ajuda')}
                  className="flex items-center justify-between p-4 bg-rose-50/50 hover:bg-rose-100/50 border border-rose-150 rounded-xl transition text-left cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="p-2 bg-rose-100 text-rose-750 font-bold rounded-lg shrink-0">
                      💜
                    </span>
                    <div>
                      <p className="text-xs font-bold text-rose-900 group-hover:text-rose-950">Preciso de Canal de Ajuda</p>
                      <p className="text-[10px] text-rose-500">Enviar desabafo a psicólogo</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-600 mr-2 group-hover:translate-x-1 transition" />
                </button>
              )}

            </div>
          </div>

          {/* Supportive mental health quote of the day card */}
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 relative overflow-hidden flex items-center space-x-4">
            <span className="text-3xl text-pink-700/80 absolute right-4 top-2 font-serif select-none pointer-events-none opacity-20">“</span>
            <div className="text-pink-650 bg-pink-100/40 p-3.5 rounded-xl shrink-0">
              💜
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest font-sans">Acolhimento Melodias</p>
              <p className="text-sm italic font-serif text-slate-750 font-medium mt-1 leading-relaxed">
                "{supportQuotes[currentQuoteIndex].text}"
              </p>
              <p className="text-xs text-slate-500 mt-1.5 font-bold">— Reflexão da Comunidade ({supportQuotes[currentQuoteIndex].author})</p>
            </div>
          </div>

          {/* Mini - Blog List (Blogs do sistema que vai para o site) */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center">
                <span className="w-1.5 h-4 bg-pink-850 mr-2 rounded-sm inline-block"></span>
                📖 Aprendizados & Publicações do Sistema
              </h3>
              <button 
                onClick={() => onsetTab('aprendizados')} 
                className="text-xs font-bold text-[#581a2e] hover:underline flex items-center cursor-pointer"
              >
                Ver todos <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-4 hover:bg-slate-50 p-2 rounded-xl transition">
                <img 
                  className="w-20 h-20 rounded-xl object-cover" 
                  src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=500&auto=format&fit=crop" 
                  alt="Diferenca depressao" 
                />
                <div className="flex-1">
                  <span className="text-[10px] bg-pink-100 text-pink-850 font-bold px-2 py-0.5 rounded-md">Informação</span>
                  <h4 className="text-xs font-bold text-slate-800 mt-1 hover:text-[#581a2e] transition cursor-pointer" onClick={() => onsetTab('aprendizados')}>
                    A diferença crucial entre Tristeza e Depressão Clínica
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">Ficar triste é uma resposta saudável. A depressão profunda envolve exaustão mental prolongada...</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: "Caixa de Ideias" Suggestion Board & "Taxa de Atividade" Grid */}
        <div className="space-y-6">
          
          {/* Caixa de Ideias Panel */}
          <div id="caixa-de-ideias" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2.5 mb-3">
                <span className="p-1.5 bg-[#581a2e]/10 text-[#581a2e] rounded-lg">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                </span>
                <h3 className="text-sm font-bold text-slate-800">Caixa de Ideias</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 ">
                Sugira temas para os próximos encontros do grupo, palestras de psicólogos ou novas funcionalidades!
              </p>

              <form onSubmit={handleSuggestionSubmit} className="space-y-3">
                <textarea
                  id="suggestion-textarea"
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder="✍️ Escreva sua ideia ou proposta aqui..."
                  rows={4}
                  className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#581a2e] focus:bg-white min-h-[100px] resize-none"
                />
                <button
                  id="btn-submit-suggestion"
                  type="submit"
                  className="w-full h-10 bg-[#581a2e] hover:bg-[#431423] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Sugestão</span>
                </button>
              </form>

              {justSubmitted && (
                <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold text-center animate-bounce">
                  🎉 Proposta enviada com sucesso! Ela foi computada no painel de administração.
                </div>
              )}
            </div>

            {/* Micro List of Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Últimas ideias enviadas:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {suggestions.slice(-2).reverse().map((sug) => (
                    <div key={sug.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <p className="text-xs text-slate-700 font-normal italic">"{sug.content}"</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] font-bold text-[#551a2e]/80">por {sug.authorName}</span>
                        <span className="text-[9px] text-slate-400">{sug.createdAt.slice(11)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Taxa de Atividade Card matching layout */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-3.5 flex items-center">
              📊 Taxa de Atividade
            </h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                <span>Membros Ativos</span>
                <span className="font-bold text-[#581a2e]">93%</span>
              </div>
              {/* Progress bar matching colors */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#581a2e] h-full rounded-full transition-all duration-500" style={{ width: '93%' }}></div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100/50 text-center">
                  <span className="block text-xl font-bold text-emerald-700">13</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Ativos</span>
                </div>
                <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100/50 text-center">
                  <span className="block text-xl font-bold text-amber-700">1</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Pendente</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
