import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  ThumbsUp, 
  Eye, 
  CheckCircle, 
  HeartHandshake, 
  Send,
  User,
  ArrowLeft,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { ForumTopic, ForumReply, AppUser, UserRole } from '../types';

interface ForumViewProps {
  topics: ForumTopic[];
  currentUser: AppUser;
  onAddTopic: (title: string, category: string, content: string) => void;
  onAddReply: (topicId: string, content: string, isExpert: boolean) => void;
  onLikeTopic: (topicId: string) => void;
}

export default function ForumView({
  topics,
  currentUser,
  onAddTopic,
  onAddReply,
  onLikeTopic
}: ForumViewProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Topic creation states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('Ansiedade');
  const [newTopicContent, setNewTopicContent] = useState('');

  // Reply states
  const [replyText, setReplyText] = useState('');

  const categories = ['Ansiedade', 'Depressão', 'Autocuidado', 'Luto', 'Burnout', 'Geral'];

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = currentCategory === 'all' || t.category === currentCategory;
    return matchesSearch && matchesCategory;
  });

  const activeTopic = topics.find(t => t.id === selectedTopicId);

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      alert('Por favor, preencha todos os campos do tópico!');
      return;
    }
    onAddTopic(newTopicTitle, newTopicCategory, newTopicContent);
    setNewTopicTitle('');
    setNewTopicContent('');
    setShowCreateForm(false);
  };

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTopicId) return;
    
    // Check if the reply comes from a psychologist to badge it as expert advice!
    const isExpert = currentUser.role === 'professional' || currentUser.role === 'super-admin';
    onAddReply(selectedTopicId, replyText, isExpert);
    setReplyText('');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super-admin': return <span className="bg-brand-moss text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Admin</span>;
      case 'professional': return <span className="bg-cyan-900 text-cyan-100 text-[9px] font-bold px-1.5 py-0.5 rounded">Psicólogo Cr.</span>;
      case 'member': return <span className="bg-slate-100 text-slate-500 text-[9px] font-medium px-1.5 py-0.5 rounded">Membro</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="forum-main-section">
      
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-800 tracking-tight flex items-center">
            💬 Fórum de Discussão e Apoio Psicológico
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Espaço para membros desabafarem e psicólogos devidamente cadastrados proverem aconselhamentos orientados gratuitos.
          </p>
        </div>

        {!showCreateForm && !selectedTopicId && (
          <button
            id="btn-trigger-create-topic"
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2.5 bg-brand-moss hover:bg-brand-moss-dark hover:scale-[1.01] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Novo Tópico</span>
          </button>
        )}
      </div>

      {/* --- DISCUSSION THREAD DETAILS VIEW --- */}
      {selectedTopicId && activeTopic ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Back Action Header */}
          <button
            id="btn-back-to-forum-list"
            onClick={() => setSelectedTopicId(null)}
            className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer bg-white border border-slate-100 px-4 py-2 rounded-xl text-left"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Voltar para Listagem de Discussões
          </button>

          {/* Core Post */}
          <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src={activeTopic.authorAvatar} 
                  alt={activeTopic.authorName} 
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-800">{activeTopic.authorName}</span>
                    {getRoleBadge(activeTopic.authorRole)}
                  </div>
                  <span className="text-[10px] text-slate-400">Postado em {activeTopic.createdAt}</span>
                </div>
              </div>

              <span className="bg-brand-moss/10 text-brand-moss text-xs font-bold px-3 py-1 rounded-full">
                📁 {activeTopic.category}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900">{activeTopic.title}</h3>
            
            <p className="text-sm text-slate-700 leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-100/50">
              {activeTopic.content}
            </p>

            <div className="flex items-center space-x-4 pt-2">
              <button 
                id="btn-like-active-topic"
                onClick={() => onLikeTopic(activeTopic.id)}
                className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-brand-moss bg-slate-100/55 hover:bg-brand-moss/5 px-3 py-1.5 rounded-lg transition"
              >
                <ThumbsUp className="w-4 h-4 text-brand-moss" />
                <span className="font-semibold">{activeTopic.likes} Curtidas</span>
              </button>
              <div className="flex items-center space-x-1 text-xs text-slate-400">
                <Eye className="w-4 h-4" />
                <span>{activeTopic.views + 1} Visualizações</span>
              </div>
            </div>
          </div>

          {/* Discussion comments sequence list */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Respostas e Aconselhamentos ({activeTopic.replies.length})
            </h4>

            {activeTopic.replies.map((reply) => (
              <div 
                key={reply.id} 
                className={`p-5 rounded-2xl border transition ${
                  reply.isExpertReply 
                    ? 'bg-cyan-50/20 border-cyan-200/60 shadow-sm' 
                    : 'bg-white border-slate-150'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <img 
                      src={reply.authorAvatar} 
                      alt={reply.authorName} 
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                    <div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="font-bold text-slate-800">{reply.authorName}</span>
                        {getRoleBadge(reply.authorRole)}
                      </div>
                      <span className="text-[9px] text-slate-400">{reply.createdAt}</span>
                    </div>
                  </div>

                  {reply.isExpertReply && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-cyan-900 border border-cyan-800 text-white text-[9px] font-bold uppercase rounded space-x-1">
                      <HeartHandshake className="w-3 h-3 text-cyan-200" />
                      <span>Orientações de Especialista</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-705 leading-relaxed font-sans pl-10">
                  {reply.content}
                </p>
              </div>
            ))}
          </div>

          {/* New Reply Creator */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
              ✍️ Responder como <span className="text-brand-moss ml-1">{currentUser.name}</span>
            </p>
            {currentUser.role === 'professional' && (
              <div className="p-2 bg-cyan-50 text-cyan-800 text-[11px] rounded-lg mb-3 flex items-center space-x-1.5 border border-cyan-200/50">
                <AlertCircle className="w-4 h-4 text-cyan-600 inline" />
                <span className="font-bold">Aviso CRP:</span>
                <span>Sua resposta será marcada como "Orientações de Especialista", com badge oficial da clínica.</span>
              </div>
            )}

            <form onSubmit={handlePostReply} className="space-y-3">
              <textarea
                id="forum-reply-textarea"
                placeholder="Escreva sua opinião, dica prática ou desabafo respeitoso..."
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-moss focus:bg-white resize-none"
              />
              <button
                id="btn-post-forum-reply"
                type="submit"
                className="px-5 h-9 bg-brand-moss hover:bg-brand-moss-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center space-x-1.5 transition ml-auto cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Resposta</span>
              </button>
            </form>
          </div>

        </div>
      ) : showCreateForm ? (
        
        /* --- NEW DISCUSSION FORM --- */
        <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-150">
            <h3 className="text-sm font-bold text-slate-800">Publicar Novo Tópico na Comunidade</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-xs text-slate-400 hover:text-slate-700 transition"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateTopic} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Título do Tópico:</label>
                <input
                  id="forum-new-title"
                  type="text"
                  placeholder="Seja descritivo (ex: Técnicas rápidas de mindfulness diária)"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-moss"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Categoria do Debate:</label>
                <select
                  value={newTopicCategory}
                  onChange={(e) => setNewTopicCategory(e.target.value)}
                  className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-moss"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Conteúdo / Desabafo:</label>
              <textarea
                id="forum-new-content"
                placeholder="Sinta-se seguro em descrever seu momento. Este fórum é anonimizado em buscas externas do Google. Respeite as diretrizes de acolhimento Melodias."
                rows={5}
                value={newTopicContent}
                onChange={(e) => setNewTopicContent(e.target.value)}
                className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-moss/20 resize-none min-h-[120px]"
              />
            </div>

            <div className="flex justify-end space-x-3.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-550 uppercase tracking-wider rounded-xl border border-slate-205 cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-brand-moss hover:bg-brand-moss-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Publicar Discussão
              </button>
            </div>
          </form>
        </div>
      ) : (
        
        /* --- CORE DISCUSSION LISTS GRID --- */
        <div className="space-y-4">
          
          {/* Quick Filter Categories bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setCurrentCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap tracking-wide border transition ${
                  currentCategory === 'all' 
                    ? 'bg-brand-moss text-white border-transparent' 
                    : 'bg-white text-slate-600 border-slate-220 hover:bg-slate-50'
                }`}
              >
                Todos as Discussões
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCurrentCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition whitespace-nowrap ${
                    currentCategory === cat 
                      ? 'bg-brand-moss text-white border-transparent' 
                      : 'bg-white text-slate-600 border-slate-220 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* In-forum search */}
            <div className="relative w-full md:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Buscar desabafos e dúvidas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-moss"
              />
            </div>

          </div>

          {/* Topics listed sequence */}
          {filteredTopics.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <p className="text-sm font-semibold text-slate-500">Nenhuma discussão encontrada para esta seção e termos informados.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => { setSelectedTopicId(topic.id); }}
                  className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-brand-moss transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-brand-moss/10 text-brand-moss text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                        {topic.category}
                      </span>
                      {topic.isSolved && (
                        <span className="bg-emerald-100 text-emerald-850 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Resolvido (Especialista)
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-sm font-bold text-slate-800 hover:text-brand-moss transition leading-snug">
                      {topic.title}
                    </h3>
                    
                    <p className="text-xs text-slate-500 line-clamp-2 max-w-3xl">
                      {topic.content}
                    </p>

                    {/* Meta info block */}
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center space-x-1.5">
                        <img 
                          src={topic.authorAvatar} 
                          alt={topic.authorName} 
                          className="w-5 h-5 rounded-full object-cover shrink-0" 
                        />
                        <span className="font-bold text-slate-650">{topic.authorName}</span>
                      </div>
                      <span>•</span>
                      <span>{topic.createdAt.split(' ')[0]}</span>
                    </div>

                  </div>

                  {/* Right side interactions counter */}
                  <div className="flex sm:flex-row md:flex-col items-center justify-center md:items-end gap-3 shrink-0 pt-2 md:pt-0 md:min-w-[120px]">
                    <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1 px-2 py-1 bg-slate-50 rounded-lg">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span>{topic.replies.length} respostas</span>
                    </span>
                    <span className="text-xs font-semibold text-brand-clay flex items-center space-x-1 px-2 py-1 bg-brand-clay/10 rounded-lg">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{topic.likes} curtidas</span>
                    </span>
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
