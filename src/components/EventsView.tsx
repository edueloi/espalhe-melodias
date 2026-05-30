import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  PlayCircle, 
  Users, 
  Video, 
  Plus, 
  Check, 
  Info, 
  ArrowRight,
  ExternalLink,
  Target
} from 'lucide-react';
import { HealthEvent, AppUser } from '../types';

interface EventsViewProps {
  events: HealthEvent[];
  currentUser: AppUser;
  onEnrollInEvent: (eventId: string) => void;
  onAddEvent: (title: string, category: any, date: string, time: string, desc: string, instructor: string) => void;
}

export default function EventsView({
  events,
  currentUser,
  onEnrollInEvent,
  onAddEvent
}: EventsViewProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New event registration fields
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Grupo de Apoio' | 'Palestra Vivencial' | 'Workshop' | 'Meditação Coletiva'>('Grupo de Apoio');
  const [newDate, setNewDate] = useState('2026-06-15');
  const [newTime, setNewTime] = useState('19:00 - 20:30');
  const [newDesc, setNewDesc] = useState('');

  // Past event recording display simulation
  const [playingPastEventId, setPlayingPastEventId] = useState<string | null>(null);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      alert('Favor preencher o título e descrição do encontro!');
      return;
    }
    onAddEvent(newTitle, newCategory, newDate, newTime, newDesc, currentUser.name);
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status === 'past');

  return (
    <div className="space-y-6 animate-fadeIn" id="events-main-view">
      
      {/* 1. Header Intro */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-800 tracking-tight flex items-center">
            📅 Encontros, Palestras & Grupos de Discussão
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Participe das nossas reuniões virtuais em tempo real, vivências terapêuticas e workshops mediados por psicólogos cadastrados.
          </p>
        </div>

        {currentUser.role !== 'member' && !showAddForm && (
          <button
            id="btn-trigger-add-event"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 bg-brand-moss hover:bg-brand-moss-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Novo Encontro</span>
          </button>
        )}
      </div>

      {/* --- ADD EVENT FORM --- */}
      {showAddForm && (
        <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              ➕ Agendar Próximo Evento / Palestra
            </h3>
            <button 
              onClick={() => setShowAddForm(false)} 
              className="text-xs text-slate-450 hover:text-slate-800"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Título do Encontro:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Como lidar com stress pré-vestibular e Enem"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs text-slate-807 bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-moss"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tema do Evento:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs text-slate-705 bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-moss"
                >
                  <option value="Grupo de Apoio">Grupo de Apoio</option>
                  <option value="Palestra Vivencial">Palestra Vivencial</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Meditação Coletiva">Meditação Coletiva</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Data do Evento:</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs text-slate-705 bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Horário:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 19:30 - 21:00"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-xs text-slate-705 bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Descrição dos Objetivos e Dinâmicas:</label>
              <textarea
                placeholder="Especifique o que os participantes vão debater ou praticar. ex: Faremos a regulação nervosa com foco..."
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full text-xs text-slate-705 bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none"
              />
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
                className="px-5 py-2 bg-brand-moss hover:bg-brand-moss-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Agendar Encontro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- EVENT TAB SELECTOR --- */}
      <div className="border-b border-slate-105 flex space-x-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-bold tracking-wide transition relative ${
            activeTab === 'upcoming' ? 'text-brand-moss' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Próximos Encontros ({upcomingEvents.length})
          {activeTab === 'upcoming' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-moss rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('past'); setPlayingPastEventId(null); }}
          className={`pb-3 text-sm font-bold tracking-wide transition relative ${
            activeTab === 'past' ? 'text-brand-moss' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Eventos e Gravações Passadas ({pastEvents.length})
          {activeTab === 'past' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-moss rounded-full"></span>
          )}
        </button>
      </div>

      {/* Recording Player Sandbox overlay */}
      {playingPastEventId && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-white space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-[11px] font-bold text-[#a855f7] uppercase tracking-widest flex items-center">
              <Video className="w-4 h-4 mr-1.5 text-pink-400 bounce" /> Sala de Gravações Melodias
            </span>
            <button 
              onClick={() => setPlayingPastEventId(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Fechar Canal
            </button>
          </div>

          <div className="aspect-video max-w-2xl mx-auto bg-black rounded-2xl flex flex-col items-center justify-center text-center p-8 relative overflow-hidden border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-950/20 to-indigo-950/20"></div>
            <PlayCircle className="w-16 h-16 text-pink-500 mb-4 animate-pulse" />
            <h4 className="text-sm font-bold max-w-md">Reprodutor de Web-Conferência Melodias</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">O webinar completo de psicologia integrativa foi gravado. A sala de conferência está no modo reprise privada para membros cadastrados.</p>
          </div>
        </div>
      )}

      {/* --- EVENTS MAIN SWITCH LIST --- */}
      {activeTab === 'upcoming' ? (
        
        /* UPCOMING EVENTS GRID */
        upcomingEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-105">
            <p className="text-sm font-semibold text-slate-500">Nenhum encontro agendado para o próximo período.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((evt) => (
              <div 
                key={evt.id} 
                className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:border-brand-moss transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-transparent border border-emerald-500 text-emerald-800 font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {evt.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center">
                      <Users className="w-4 h-4 text-slate-400 mr-1" />
                      <span>{evt.participantsCount} inscritos</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {evt.title}
                  </h3>

                  <div className="p-3 bg-slate-50/70 border border-slate-150 rounded-xl space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center">
                      <span className="font-bold text-slate-450 uppercase text-[9px] w-14 shrink-0">DATA:</span> 
                      📅 {evt.date} (Quarta-feira)
                    </p>
                    <p className="flex items-center">
                      <span className="font-bold text-slate-450 uppercase text-[9px] w-14 shrink-0">HORÁRIO:</span> 
                      ⏰ {evt.time}
                    </p>
                    <p className="flex items-center">
                      <span className="font-bold text-slate-450 uppercase text-[9px] w-14 shrink-0">MEDIADOR:</span> 
                      👨‍⚕️ {evt.instructorName}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {evt.description}
                  </p>
                </div>

                {/* Enroll Trigger */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] bg-slate-100 text-slate-450 font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                    SALA ZOOM PRIVADA
                  </span>

                  {evt.isEnrolled ? (
                    <span className="bg-emerald-100 text-emerald-850 text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center animate-bounce">
                      <Check className="w-4 h-4 mr-1 text-emerald-600 stroke-[3px]" /> Confirmado
                    </span>
                  ) : (
                    <button
                      id={`btn-enroll-${evt.id}`}
                      onClick={() => onEnrollInEvent(evt.id)}
                      className="px-4 py-2 bg-brand-moss hover:bg-brand-moss-dark hover:scale-[1.01] transition-all text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Inscrever-se no Encontro
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )

      ) : (
        
        /* PAST RECORDINGS LIST */
        pastEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-105">
            <p className="text-sm font-semibold text-slate-500">Nenhum evento encerrado catalogado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastEvents.map((evt) => (
              <div 
                key={evt.id} 
                className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between border-l-4 border-pink-700"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded">
                      Encontro Concluído
                    </span>
                    <span className="text-xs text-slate-450 uppercase font-bold tracking-wider">
                      {evt.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-sans">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-between items-center mt-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Gravação Disponível</span>
                  
                  <button
                    id={`btn-play-past-${evt.id}`}
                    onClick={() => setPlayingPastEventId(evt.id)}
                    className="px-4 py-2 bg-slate-100 text-slate-750 hover:bg-brand-moss hover:text-white hover:border-transparent border rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1 cursor-pointer transition"
                  >
                    <PlayCircle className="w-4 h-4 text-pink-500 shrink-0" />
                    <span>Ver Gravação</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
}
