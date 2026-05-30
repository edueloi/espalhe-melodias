import React, { useState } from 'react';
import { 
  HeartPulse, 
  AlertOctagon, 
  ShieldCheck, 
  Send, 
  CheckCircle, 
  User, 
  MessageSquare, 
  HelpCircle,
  FileText,
  Filter
} from 'lucide-react';
import { SupportRequest, AppUser, UserRole } from '../types';

interface HelpRequestViewProps {
  requests: SupportRequest[];
  currentUser: AppUser;
  onSubmitRequest: (urgency: 'baixa' | 'media' | 'alta' | 'urgente', description: string) => void;
  onUpdateStatus: (requestId: string, status: 'Aberto' | 'Em Atendimento' | 'Concluído', assignedName?: string) => void;
}

export default function HelpRequestView({
  requests,
  currentUser,
  onSubmitRequest,
  onUpdateStatus
}: HelpRequestViewProps) {
  const [urgency, setUrgency] = useState<'baixa' | 'media' | 'alta' | 'urgente'>('media');
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'Aberto' | 'Em Atendimento' | 'Concluído'>('all');

  // Chat window simulation inside help desk
  const [chattingWithRequestId, setChattingWithRequestId] = useState<string | null>(null);
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [simulatedChatLogs, setSimulatedChatLogs] = useState<Array<{ sender: string, text: string }>>([
    { sender: 'patient', text: 'Olá, obrigado por aceitar meu caso. Me sinto muito cansado e não sei mais por onde recomeçar...' },
    { sender: 'therapist', text: 'Boa noite. Fique calmo. Estou lendo suas informações aqui no sistema Melodias. Você está em um local seguro respirando corretamente? Vamos conversar sem pressões.' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Por favor, descreva sua situação ou desabafo!');
      return;
    }
    onSubmitRequest(urgency, description);
    setDescription('');
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
    }, 5000);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim()) return;
    setSimulatedChatLogs(prev => [
      ...prev,
      { sender: 'therapist', text: chatMessageInput }
    ]);
    setChatMessageInput('');
    // Simulate auto-reply from patient after 2 seconds
    setTimeout(() => {
      setSimulatedChatLogs(prev => [
        ...prev,
        { sender: 'patient', text: 'Obrigado por me dar esse direcionamento básico, já me sinto mais calmo ao falar com alguém credenciado.' }
      ]);
    }, 2000);
  };

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'baixa': return <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded">Métrica Leve</span>;
      case 'media': return <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded">Moderaçao</span>;
      case 'alta': return <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded">Atenção Crítica</span>;
      case 'urgente': return <span className="bg-rose-100 text-rose-800 font-bold text-[10px] px-2 py-0.5 rounded animate-pulse">⚠️ ALERTA EMERGENCIAL</span>;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aberto': return <span className="bg-rose-105 border border-rose-100 bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded">Aguardando Triagem</span>;
      case 'Em Atendimento': return <span className="bg-cyan-50 border border-cyan-250 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded">Em Acompanhamento</span>;
      case 'Concluído': return <span className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Concluído</span>;
      default: return null;
    }
  };

  const activeChatRequest = requests.find(r => r.id === chattingWithRequestId);

  const filteredRequests = requests.filter(r => {
    if (activeFilter === 'all') return true;
    return r.status === activeFilter;
  });

  // --- VIEWS DEPENDING ON ACCESS PERMISSION ROLES ---
  const isSpecialist = currentUser.role === 'professional' || currentUser.role === 'super-admin';

  if (isSpecialist) {
    return (
      <div className="space-y-6 animate-fadeIn" id="help-desk-workspace">
        
        {/* Workspace Intro */}
        <div className="bg-white border border-slate-105 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-2.5 mb-2">
            <HeartPulse className="w-6 h-6 text-rose-500 animate-pulse animate-pulse-slow" />
            <h2 className="text-lg font-serif font-bold text-slate-800 tracking-tight">
              Triage Workspace: Portal de Crise e Acolhimento
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Você está logado como <span className="font-bold text-slate-750">{currentUser.name}</span>. Abaixo estão listados os chamados privados de desabafo e gatilhos emocionais abertos por membros. Utilize a ética do código de psicologia (CRP) para acolher e atender.
          </p>
        </div>

        {/* Dynamic chat simulation overlay */}
        {chattingWithRequestId && activeChatRequest && (
          <div className="bg-white border-2 border-[#581a2e] rounded-3xl p-6 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3 mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                <h3 className="text-sm font-bold text-slate-800">Sessão Virtual Melodias Conectada</h3>
              </div>
              <button 
                onClick={() => setChattingWithRequestId(null)} 
                className="text-xs font-bold text-[#5fa1c2e] text-[#581a2e] hover:underline"
              >
                Voltar ao Workspace / Sair da Sala
              </button>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl space-y-1 text-slate-800 text-xs border border-rose-150">
              <p className="font-bold">Tema: {activeChatRequest.patientName} ({getUrgencyBadge(activeChatRequest.urgency)})</p>
              <p className="italic">" {activeChatRequest.description} "</p>
            </div>

            {/* Chat Messages Log */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-72 overflow-y-auto space-y-3 min-h-[160px]">
              {simulatedChatLogs.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'therapist' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-sm text-xs ${
                    msg.sender === 'therapist' 
                      ? 'bg-[#581a2e] text-white rounded-br-none' 
                      : 'bg-white border text-slate-800 rounded-bl-none shadow-sm'
                  }`}>
                    <p className="font-semibold mb-0.5 text-[10px] opacity-75">{msg.sender === 'therapist' ? 'Você (Psicólogo)' : activeChatRequest.patientName}</p>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendChatMessage} className="flex space-x-2">
              <input
                type="text"
                placeholder="Digite seu conselho ou palavra de estabilização neuro-regulatória..."
                value={chatMessageInput}
                onChange={(e) => setChatMessageInput(e.target.value)}
                className="flex-1 text-xs text-slate-800 border border-slate-200 rounded-xl px-4 focus:outline-none focus:ring-1 focus:ring-[#581a2e]"
              />
              <button
                type="submit"
                className="h-9 px-4 bg-[#581a2e] text-white text-xs font-bold uppercase rounded-xl flex items-center justify-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Filters Triage list */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex flex-wrap gap-1 md:gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition ${
                activeFilter === 'all' ? 'bg-[#581a2e] text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              Todos os Casos ({requests.length})
            </button>
            <button
              onClick={() => setActiveFilter('Aberto')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition ${
                activeFilter === 'Aberto' ? 'bg-[#581a2e] text-white border-transparent' : 'bg-white text-rose-600 border-slate-200'
              }`}
            >
              Apenas Abertas ({requests.filter(r => r.status==='Aberto').length})
            </button>
            <button
              onClick={() => setActiveFilter('Em Atendimento')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition ${
                activeFilter === 'Em Atendimento' ? 'bg-[#581a2e] text-white border-transparent' : 'bg-white text-cyan-600 border-slate-200'
              }`}
            >
              Em Atendimento ({requests.filter(r => r.status==='Em Atendimento').length})
            </button>
            <button
              onClick={() => setActiveFilter('Concluído')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition ${
                activeFilter === 'Concluído' ? 'bg-[#581a2e] text-white border-transparent' : 'bg-white text-emerald-600 border-slate-200'
              }`}
            >
              Concluídas
            </button>
          </div>

          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Triage Filter Active
          </p>

        </div>

        {/* Grid showing requests */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-105">
            <p className="text-sm font-semibold text-slate-500">Nenhuma solicitação de triagem com filtro ativo no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div 
                key={req.id} 
                className={`bg-white border rounded-2xl p-5 shadow-sm transition hover:scale-[1.002] ${
                  req.status === 'Aberto' ? 'border-rose-100 bg-rose-50/10' : 'border-slate-150'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-bold text-slate-800">{req.patientName}</span>
                      <span className="text-[10px] text-slate-400">({req.patientEmail})</span>
                      <span>·</span>
                      {getUrgencyBadge(req.urgency)}
                      {getStatusBadge(req.status)}
                    </div>

                    <p className="text-xs text-slate-605 italic pl-2 border-l-2 border-slate-200 leading-relaxed font-sans">
                      " {req.description} "
                    </p>

                    <p className="text-[10px] text-slate-400 block pt-1">Gatilho relatado em {req.createdAt}</p>
                  </div>

                  {/* Actions depending on status */}
                  <div className="shrink-0 flex items-center space-x-2.5 min-w-[170px] justify-end">
                    {req.status === 'Aberto' ? (
                      <button
                        id={`btn-accept-request-${req.id}`}
                        onClick={() => onUpdateStatus(req.id, 'Em Atendimento', currentUser.name)}
                        className="px-4 py-2 bg-[#581a2e] hover:bg-[#3d1220] text-slate-50 text-xs font-bold uppercase rounded-xl transition cursor-pointer"
                      >
                        💼 Acolher Chamado
                      </button>
                    ) : req.status === 'Em Atendimento' ? (
                      <div className="flex flex-col space-y-1.5 w-full">
                        <span className="text-[11px] font-bold text-cyan-800 text-center uppercase tracking-wide block">
                          Atendido por {req.assignedProfessional}
                        </span>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            id={`btn-chat-request-${req.id}`}
                            onClick={() => setChattingWithRequestId(req.id)}
                            className="p-1.5 bg-cyan-750 bg-cyan-850 hover:bg-cyan-950 text-white text-[10px] font-bold uppercase rounded-lg text-center"
                          >
                            💬 Chat Ativo
                          </button>
                          <button
                            id={`btn-resolve-request-${req.id}`}
                            onClick={() => onUpdateStatus(req.id, 'Concluído', req.assignedProfessional)}
                            className="p-1.5 bg-emerald-650 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded-lg text-center"
                          >
                            ✓ Encerrar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" /> Resolvido com sucesso
                      </span>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    );
  }

  // --- MEMBER/PATIENT PRIVATE FILING SYSTEM ---
  return (
    <div className="space-y-6 animate-fadeIn" id="help-request-normal-form">
      
      {/* Intro details */}
      <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-rose-200/25 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center space-x-3 mb-2.5">
          <HeartPulse className="w-7 h-7 text-rose-600 animate-pulse" />
          <h2 className="text-lg font-serif font-bold text-slate-800 tracking-tight">
            Canal de Ajuda Simples & Acolhimento Particular
          </h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
          Está se sentindo ansioso, confuso, estressado ou passando por algum momento difícil no silêncio da sua casa? Descreva o que você está sentindo abaixo. Nosso portal correlacionará seu chamado com algum dos nossos psicólogos homologados gratuitamente para te dar suporte básico por chat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form panel column */}
        <div className="lg:col-span-2 bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
          <p className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2">
            ✉️ Enviar solicitação de acolhimento
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Intensidade do que sinto agora:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { level: 'baixa', l: 'Gatilho Leve / Ansiedade Comum', c: 'border-slate-350 hover:bg-slate-50' },
                  { level: 'media', l: 'Estresse Moderado / Tristeza', c: 'border-blue-200 hover:bg-blue-50/10' },
                  { level: 'alta', l: 'Insônia / Crise Ansiosa Ativa', c: 'border-amber-200 hover:bg-amber-50/10' },
                  { level: 'urgente', l: 'Pânico / Sensação de Culpa', c: 'border-rose-200 hover:bg-rose-50/10' }
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setUrgency(item.level as any)}
                    className={`p-3 text-left border rounded-xl transition ${item.c} ${
                      urgency === item.level 
                        ? 'bg-[#581a2e] text-white border-transparent hover:bg-[#581a2e]' 
                        : 'bg-white text-slate-755'
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider">{item.level}</p>
                    <p className="text-[9px] opacity-90 mt-1">{item.l}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Descreva seu desabafo ou estado em detalhes:</label>
              <textarea
                placeholder="Diga o que está incomodando sua mente. Sinta-se totalmente livre, este canal é seguro e restrito apenas a psicólogos credenciados no sistema Melodias."
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs text-slate-705 bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#581a2e] focus:bg-white resize-none min-h-[120px]"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#581a2e] hover:bg-[#3d1220] hover:scale-[1.002] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition cursor-pointer"
            >
              Confirmar e Enviar Desabafo ao Sistema
            </button>
          </form>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold rounded-xl text-center flex items-center justify-center space-x-1.5 animate-bounce">
              <span>🎉 Seu chamado foi enviado com sucesso! Um psicólogo homologado irá assumir o caso em instantes. Ele aparecerá no seu painel.</span>
            </div>
          )}
        </div>

        {/* Info panel sidebar */}
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-[#5a1a2e] uppercase tracking-wider mb-2 flex items-center">
              🛡️ Privacidade Garantida
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              O ecossistema Melodias atua pautado na Lei Geral de Proteção de Dados (LGPD) e na ética do CFM/CRP. Nenhuma informação de saúde privada enviada nos chamados é exposta para outros membros comuns no diretório ou fórum. Apenas especialistas homologados têm acesso de visualização.
            </p>
          </div>

          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-full mb-3 shadow-inner">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Precisa de Ajuda Imediata?</h4>
            <p className="text-[10px] text-slate-500 max-w-xs leading-normal mb-3">
              Caso esteja em uma situação de risco de vida ou de ideação, lembre-se que você também pode ligar gratuitamente para o <span className="font-bold text-slate-700">CVV (Centro de Valorização da Vida)</span> discando o número <span className="font-bold text-slate-700">188</span> de qualquer telefone.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
