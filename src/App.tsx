import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import DirectoryView from './components/DirectoryView';
import ForumView from './components/ForumView';
import MaterialsView from './components/MaterialsView';
import HelpRequestView from './components/HelpRequestView';
import EventsView from './components/EventsView';
import LearningsView from './components/LearningsView';
import AdminUsersView from './components/AdminUsersView';
import ProjectsView from './components/ProjectsView';

import { 
  INITIAL_USERS, 
  INITIAL_PROFESSIONALS, 
  INITIAL_FORUM_TOPICS, 
  INITIAL_MATERIALS, 
  INITIAL_EVENTS, 
  INITIAL_SUPPORT_REQUESTS, 
  INITIAL_SUGGESTIONS, 
  INITIAL_BLOGS 
} from './mockData';

import { 
  AppUser, 
  ProfessionalProfile, 
  ForumTopic, 
  ForumReply, 
  SupportMaterial, 
  HealthEvent, 
  SupportRequest, 
  SuggestionIdea, 
  BlogPost, 
  UserRole 
} from './types';

export default function App() {
  // Navigation active tab
  const [currentTab, setCurrentTab] = useState<string>('projetos-melodias');
  
  // Search state across widgets
  const [searchTerm, setSearchTerm] = useState<string>('');

  // STATEFUL REGISTRIES (Initialized from localStorage to permit true persistence)
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('melodias_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>(() => {
    const saved = localStorage.getItem('melodias_professionals');
    return saved ? JSON.parse(saved) : INITIAL_PROFESSIONALS;
  });

  const [forumTopics, setForumTopics] = useState<ForumTopic[]>(() => {
    const saved = localStorage.getItem('melodias_forum');
    return saved ? JSON.parse(saved) : INITIAL_FORUM_TOPICS;
  });

  const [materials, setMaterials] = useState<SupportMaterial[]>(() => {
    const saved = localStorage.getItem('melodias_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [events, setEvents] = useState<HealthEvent[]>(() => {
    const saved = localStorage.getItem('melodias_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [suggestions, setSuggestions] = useState<SuggestionIdea[]>(() => {
    const saved = localStorage.getItem('melodias_suggestions');
    return saved ? JSON.parse(saved) : INITIAL_SUGGESTIONS;
  });

  const [helpRequests, setHelpRequests] = useState<SupportRequest[]>(() => {
    const saved = localStorage.getItem('melodias_helprequests');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_REQUESTS;
  });

  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('melodias_blogs');
    return saved ? JSON.parse(saved) : INITIAL_BLOGS;
  });

  // Current session dynamic simulation (Starts by default on Super Admin 'Karen Silveira')
  const [currentUserId, setCurrentUserId] = useState<string>('usr-1');
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Sync to local storage regularly
  useEffect(() => {
    localStorage.setItem('melodias_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('melodias_professionals', JSON.stringify(professionals));
  }, [professionals]);

  useEffect(() => {
    localStorage.setItem('melodias_forum', JSON.stringify(forumTopics));
  }, [forumTopics]);

  useEffect(() => {
    localStorage.setItem('melodias_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('melodias_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('melodias_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  useEffect(() => {
    localStorage.setItem('melodias_helprequests', JSON.stringify(helpRequests));
  }, [helpRequests]);

  useEffect(() => {
    localStorage.setItem('melodias_blogs', JSON.stringify(blogs));
  }, [blogs]);

  // RESET DATABASE SYSTEM STATE
  const handleReset = () => {
    if (confirm('Deseja resetar todas as interações e retornar às configurações originais?')) {
      localStorage.clear();
      setUsers(INITIAL_USERS);
      setProfessionals(INITIAL_PROFESSIONALS);
      setForumTopics(INITIAL_FORUM_TOPICS);
      setMaterials(INITIAL_MATERIALS);
      setEvents(INITIAL_EVENTS);
      setSuggestions(INITIAL_SUGGESTIONS);
      setHelpRequests(INITIAL_SUPPORT_REQUESTS);
      setBlogs(INITIAL_BLOGS);
      setCurrentUserId('usr-1');
      setCurrentTab('dashboard');
      alert('Banco redimensionado com sucesso!');
    }
  };

  // HANDLERS FOR DYNAMIC INTERACTIVE FLOWS

  // 1. Suggestion handler
  const handleAddSuggestion = (content: string) => {
    const newSug: SuggestionIdea = {
      id: `sug-${Date.now()}`,
      authorName: currentUser.name,
      content,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      likes: 0
    };
    setSuggestions(prev => [...prev, newSug]);
  };

  // 2. Event subscription handler
  const handleEnrollInEvent = (eventId: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          isEnrolled: true,
          participantsCount: evt.participantsCount + 1
        };
      }
      return evt;
    }));
  };

  // 3. Admin create event handler
  const handleAddEvent = (title: string, category: any, date: string, time: string, desc: string, instructor: string) => {
    const newEvt: HealthEvent = {
      id: `evt-${Date.now()}`,
      title,
      category,
      date,
      time,
      description: desc,
      instructorName: instructor,
      instructorAvatar: currentUser.avatar,
      status: 'upcoming',
      participantsCount: 0,
      isEnrolled: false
    };
    setEvents(prev => [...prev, newEvt]);
  };

  // 4. Create support material guide handler
  const handleAddMaterial = (title: string, category: any, type: any, description: string, restricted: boolean) => {
    const newMat: SupportMaterial = {
      id: `mat-${Date.now()}`,
      title,
      category,
      type,
      description,
      downloadUrl: '#',
      authorName: currentUser.name,
      dateAdded: new Date().toISOString().substring(0, 10),
      restrictedToMembers: restricted
    };
    setMaterials(prev => [...prev, newMat]);
  };

  // 5. Submit distress help request handler
  const handleHelpSubmit = (urgency: 'baixa' | 'media' | 'alta' | 'urgente', desc: string) => {
    const newReq: SupportRequest = {
      id: `req-${Date.now()}`,
      patientName: currentUser.name,
      patientEmail: currentUser.email,
      urgency,
      description: desc,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Aberto'
    };
    setHelpRequests(prev => [...prev, newReq]);
  };

  // 6. Accept, update or close help tickets handler
  const handleTriageUpdate = (requestId: string, status: 'Aberto' | 'Em Atendimento' | 'Concluído', assignedName?: string) => {
    setHelpRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status,
          assignedProfessional: assignedName || req.assignedProfessional
        };
      }
      return req;
    }));
  };

  // 7. Publish Forum Topic
  const handleAddForumTopic = (title: string, category: string, content: string) => {
    const newTopic: ForumTopic = {
      id: `top-${Date.now()}`,
      title,
      category,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      likes: 0,
      views: 0,
      replies: []
    };
    setForumTopics(prev => [...prev, newTopic]);
  };

  // 8. Add Reply to Forum Topic
  const handleAddReply = (topicId: string, content: string, isExpertReply: boolean) => {
    const newRep: ForumReply = {
      id: `rep-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isExpertReply
    };
    setForumTopics(prev => prev.map(top => {
      if (top.id === topicId) {
        return {
          ...top,
          replies: [...top.replies, newRep],
          isSolved: isExpertReply ? true : top.isSolved
        };
      }
      return top;
    }));
  };

  // 9. Like Topic
  const handleLikeTopic = (topicId: string) => {
    setForumTopics(prev => prev.map(top => {
      if (top.id === topicId) {
        return {
          ...top,
          likes: top.likes + 1
        };
      }
      return top;
    }));
  };

  // 10. Approve Pending registration request
  const handleApproveMembership = (userId: string) => {
    setUsers(prev => prev.map(usr => {
      if (usr.id === userId) {
        return {
          ...usr,
          approvalStatus: 'approved'
        };
      }
      return usr;
    }));
  };

  // 11. Promote/Demote User Role Level in dashboard
  const handleToggleUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(usr => {
      if (usr.id === userId) {
        return {
          ...usr,
          role: newRole
        };
      }
      return usr;
    }));
  };

  // 12. Create blog publication
  const handleAddBlog = (title: string, excerpt: string, content: string, category: string, imageUrl: string) => {
    const newBlog: BlogPost = {
      id: `blog-${Date.now()}`,
      title,
      excerpt,
      content,
      category,
      imageUrl,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      date: new Date().toISOString().substring(0, 10),
      readTime: '5 min'
    };
    setBlogs(prev => [...prev, newBlog]);
  };

  // 13. Update professional profile details
  const handleUpdateProfessional = (updatedProf: ProfessionalProfile) => {
    setProfessionals(prev => {
      const exists = prev.some(p => p.id === updatedProf.id || p.userId === updatedProf.userId);
      if (exists) {
        return prev.map(p => p.userId === updatedProf.userId || p.id === updatedProf.id ? { ...p, ...updatedProf } : p);
      } else {
        return [...prev, updatedProf];
      }
    });
  };

  // BADGE COUNTERS DYNAMIC RETRIEVAL
  const pendingApprovalsCount = users.filter(u => u.approvalStatus === 'pending').length;
  const helpRequestsCount = helpRequests.filter(r => r.status === 'Aberto').length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none" id="melodias-root-container">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <Sidebar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={currentUser.role}
        userName={currentUser.name}
        userAvatar={currentUser.avatar}
        pendingRequestsCount={pendingApprovalsCount}
        openHelpRequestsCount={helpRequestsCount}
        onLogout={handleReset}
      />

      {/* CORE WORKSPACE CONTENT AREA WITH RESTRICTED SCROLL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER TOOL PANEL WITH SWITCHABLE SIMULATED USER */}
        <Header 
          currentUser={currentUser}
          availableUsers={users}
          onUserSwitch={(userId) => {
            setCurrentUserId(userId);
            // Auto switch tabs if the new user is not permitted on the current view to avoid blank views
            const targetUser = users.find(u => u.id === userId);
            if (targetUser && targetUser.role === 'member') {
              if (['admin-materiais', 'admin-solicitacoes', 'admin-configuracoes', 'usuarios-admin'].includes(currentTab)) {
                setCurrentTab('dashboard');
              }
            }
          }}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* CONTAINER FOR MAIN VIEWS SCROLLABLE FOR STRETCH REDUCTION */}
        <main className="flex-1 overflow-y-auto p-12 bg-slate-50/50 custom-scrollbar">
          
          {currentTab === 'projetos-melodias' && (
            <ProjectsView />
          )}
          
          {currentTab === 'dashboard' && (
            <DashboardView 
              currentUser={currentUser}
              totalMembersCount={users.length}
              activeMembersCount={users.filter(u => u.approvalStatus === 'approved').length}
              pendingApprovalCount={pendingApprovalsCount}
              enrollmentsCount={events.filter(e => e.isEnrolled).length + 12}
              materialsCount={materials.length}
              forumCount={forumTopics.length}
              suggestionsCount={suggestions.length}
              suggestions={suggestions}
              onsetTab={setCurrentTab}
              onAddSuggestion={handleAddSuggestion}
              upcomingEventsCount={events.filter(e => e.status==='upcoming').length}
            />
          )}

          {currentTab === 'aprendizados' && (
            <LearningsView 
              blogs={blogs}
              currentUser={currentUser}
              onAddBlog={handleAddBlog}
            />
          )}

          {currentTab === 'materiais-apoio' && (
            <MaterialsView 
              materials={materials}
              currentUser={currentUser}
              onAddMaterial={handleAddMaterial}
            />
          )}

          {currentTab === 'forum' && (
            <ForumView 
              topics={forumTopics}
              currentUser={currentUser}
              onAddTopic={handleAddForumTopic}
              onAddReply={handleAddReply}
              onLikeTopic={handleLikeTopic}
            />
          )}

          {/* ADMINISTRATION CATEGORIES */}
          {currentTab === 'admin-materiais' && (
            <MaterialsView 
              materials={materials}
              currentUser={currentUser}
              onAddMaterial={handleAddMaterial}
            />
          )}

          {currentTab === 'admin-sugestoes' && (
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 border-b pb-2">💡 Caixa de Sugestões dos Associados</h3>
              <p className="text-xs text-slate-450">Listagem de conselhos propostos por membros para a plataforma.</p>
              <div className="space-y-3">
                {suggestions.map(sug => (
                  <div key={sug.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                    <p className="text-xs text-slate-700 italic">"{sug.content}"</p>
                    <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                      <span>Proponente: {sug.authorName}</span>
                      <span>Enviado em: {sug.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'admin-solicitacoes' && (
            <AdminUsersView 
              users={users}
              currentUser={currentUser}
              onApproveUser={handleApproveMembership}
              onToggleUserRole={handleToggleUserRole}
              viewType="solicitacoes"
            />
          )}

          {currentTab === 'admin-configuracoes' && (
            <div className="bg-white border p-8 rounded-2xl shadow-sm space-y-6 max-w-2xl">
              <h3 className="text-base font-bold text-slate-800 pb-3 border-b">⚙️ Configurações Gerais do Sistema Melodias</h3>
              
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-[#581a2e]/5 border border-[#581a2e]/10 rounded-xl">
                  <p className="font-bold text-slate-850">Backup em Tempo Real</p>
                  <p className="text-slate-500 mt-1">Todas as sessões abertas de triagem, comentários de fórum e agendamentos estão consolidados localmente no seu navegador para uso demonstrativo imediato.</p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-700">Integridade dos Profissionais:</p>
                  <p className="text-slate-500 font-sans leading-relaxed">Cada psicólogo verificado tem responsabilidade técnica sobre suas respostas no fórum, necessitando o registro CRP ativo no conselho regional correspondente.</p>
                </div>
              </div>
            </div>
          )}

          {/* COMMUNITY CHANNELS */}
          {currentTab === 'preciso-ajuda' && (
            <HelpRequestView 
              requests={helpRequests}
              currentUser={currentUser}
              onSubmitRequest={handleHelpSubmit}
              onUpdateStatus={handleTriageUpdate}
            />
          )}

          {currentTab === 'diretorio-membros' && (
            <DirectoryView 
              professionals={professionals}
              currentUser={currentUser}
              onUpdateProfessional={handleUpdateProfessional}
            />
          )}

          {currentTab === 'encontros-eventos' && (
            <EventsView 
              events={events}
              currentUser={currentUser}
              onEnrollInEvent={handleEnrollInEvent}
              onAddEvent={handleAddEvent}
            />
          )}

          {/* SUPER ADMIN LEVEL */}
          {currentTab === 'usuarios-admin' && (
            <AdminUsersView 
              users={users}
              currentUser={currentUser}
              onApproveUser={handleApproveMembership}
              onToggleUserRole={handleToggleUserRole}
              viewType="usuarios"
            />
          )}

        </main>
      </div>

    </div>
  );
}
