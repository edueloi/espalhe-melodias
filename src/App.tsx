import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { tokenStore, professionalsApi } from './lib/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import DirectoryView from './components/DirectoryView';
import ForumView from './components/ForumView';
import MaterialsView from './components/MaterialsView';
import HelpRequestView from './components/HelpRequestView';
import EventsView from './components/EventsView';
import GalleryAdminView from './components/GalleryAdminView';
import LearningsView from './components/LearningsView';
import AdminUsersView from './components/AdminUsersView';
import InviteLinksView from './components/InviteLinksView';
import ConfigView from './components/ConfigView';
import SugestoesView from './components/SugestoesView';
import ProjectsView from './components/ProjectsView';
import LoginView from './components/LoginView';
import PublicSite from './components/PublicSite';
import InviteRegisterView from './components/InviteRegisterView';
import ResetPasswordView from './components/ResetPasswordView';
import EventPublicView from './components/EventPublicView';
import ProfessionalPublicPage from './components/ProfessionalPublicPage';
import WelcomeOnboardingModal from './components/WelcomeOnboardingModal';
import { ToastProvider } from './components/ui';
import { LayoutProvider } from './components/layouts';

type AppView = 'public' | 'login' | 'member-area' | 'invite' | 'event-public' | 'prof-public' | 'reset-password';
type PublicSection = 'home' | 'about' | 'blog' | 'gallery' | 'events' | 'contact';

// Mapa seção pública → segmento de URL
const PUBLIC_SECTION_TO_PATH: Record<PublicSection, string> = {
  home:    '/',
  about:   '/quem-somos',
  blog:    '/blog',
  gallery: '/galeria',
  events:  '/eventos',
  contact: '/contato',
};

const PATH_TO_PUBLIC_SECTION: Record<string, PublicSection> = Object.fromEntries(
  Object.entries(PUBLIC_SECTION_TO_PATH).map(([section, path]) => [path, section as PublicSection]),
);

// Mapa tab → segmento de URL
const TAB_TO_PATH: Record<string, string> = {
  'projetos-melodias':   '/apresentacao',
  'dashboard':           '/dashboard',
  'aprendizados':        '/blog',
  'materiais-apoio':     '/materiais',
  'forum':               '/forum',
  'admin-materiais':     '/admin-materiais',
  'admin-sugestoes':     '/sugestoes',
  'admin-solicitacoes':  '/solicitacoes',
  'admin-configuracoes': '/configuracoes',
  'preciso-ajuda':       '/ajuda',
  'diretorio-membros':   '/diretorio',
  'encontros-eventos':   '/eventos',
  'galeria-site':        '/galeria-admin',
  'usuarios-admin':      '/usuarios',
  'invite-links':        '/convites',
};

const PATH_TO_TAB: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_TO_PATH).map(([tab, path]) => [path, tab])
);

function getPath() {
  return window.location.pathname;
}

function detectView(): { view: AppView; tab: string; publicSection: PublicSection; inviteToken: string; eventPublicId: string; profPublicId: string; forumTopicId: string; resetToken: string } {
  const path = getPath();
  const empty = { inviteToken: '', eventPublicId: '', profPublicId: '', forumTopicId: '', resetToken: '' };
  if (path === '/login') return { view: 'login', tab: 'projetos-melodias', publicSection: 'home', ...empty };
  if (path === '/redefinir-senha') {
    const resetToken = new URLSearchParams(window.location.search).get('token') ?? '';
    return { view: 'reset-password', tab: 'projetos-melodias', publicSection: 'home', ...empty, resetToken };
  }
  if (path.startsWith('/convite/')) {
    return { view: 'invite', tab: 'projetos-melodias', publicSection: 'home', ...empty, inviteToken: path.replace('/convite/', '') };
  }
  if (path.startsWith('/evento/')) {
    return { view: 'event-public', tab: 'projetos-melodias', publicSection: 'home', ...empty, eventPublicId: path.replace('/evento/', '') };
  }
  if (path.startsWith('/profissional/')) {
    return { view: 'prof-public', tab: 'projetos-melodias', publicSection: 'home', ...empty, profPublicId: path.replace('/profissional/', '') };
  }
  if (path.startsWith('/forum/')) {
    return { view: 'member-area', tab: 'forum', publicSection: 'home', ...empty, forumTopicId: path.replace('/forum/', '') };
  }
  if (path.startsWith('/blog/')) {
    return { view: 'public', tab: 'projetos-melodias', publicSection: 'blog', ...empty };
  }

  // Sessão ativa: alguns paths (ex: /eventos, /blog) existem tanto no site público
  // quanto na área de membros. Se o usuário está logado, prioriza a área de membros
  // para não "deslogar" visualmente ao dar refresh numa dessas rotas.
  const hasSession = Boolean(tokenStore.get());
  const tab = PATH_TO_TAB[path];
  if (hasSession && tab) return { view: 'member-area', tab, publicSection: 'home', ...empty };

  const publicSection = PATH_TO_PUBLIC_SECTION[path];
  if (publicSection) return { view: 'public', tab: 'projetos-melodias', publicSection, ...empty };
  if (tab) return { view: 'member-area', tab, publicSection: 'home', ...empty };
  return { view: 'public', tab: 'projetos-melodias', publicSection: 'home', ...empty };
}

// ─── Inner app (needs AuthContext) ────────────────────────────────────────────

function AppInner() {
  const { user, loading, logout } = useAuth();

  const initial = detectView();
  const [appView,      setAppView]      = useState<AppView>(initial.view);
  const [currentTab,   setCurrentTabRaw] = useState<string>(initial.tab);
  const [publicSection, setPublicSectionRaw] = useState<PublicSection>(initial.publicSection);
  const [inviteToken,    setInviteToken]    = useState<string>(initial.inviteToken);
  const [eventPublicId,  setEventPublicId]  = useState<string>(initial.eventPublicId);
  const [profPublicId,   setProfPublicId]   = useState<string>(initial.profPublicId);
  const [forumTopicId,   setForumTopicId]   = useState<string>(initial.forumTopicId);
  const [resetToken,     setResetToken]     = useState<string>(initial.resetToken);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [autoOpenProfile, setAutoOpenProfile] = useState(false);
  const [mySitePath,   setMySitePath]   = useState<string | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  // Descobre a URL do site público do próprio usuário (quando ele tem perfil profissional)
  useEffect(() => {
    if (!user || user.role === 'member') { setMySitePath(null); return; }
    let cancelled = false;
    professionalsApi.list({ limit: 200 })
      .then(res => {
        if (cancelled) return;
        const own = res.data.find(p => p.user_id === user.id);
        setMySitePath(own ? `/profissional/${own.slug ?? own.user_id}` : null);
      })
      .catch(() => setMySitePath(null));
    return () => { cancelled = true; };
  }, [user]);

  // Atualiza a URL quando muda de view, tab ou seção pública (history API, sem #)
  useEffect(() => {
    if (appView === 'public') {
      const path = PUBLIC_SECTION_TO_PATH[publicSection];
      const isBlogArticle = publicSection === 'blog' && getPath().startsWith('/blog/');
      if (!isBlogArticle && getPath() !== path) window.history.replaceState(null, '', path);
    } else if (appView === 'login') {
      if (getPath() !== '/login') window.history.replaceState(null, '', '/login');
    } else if (appView === 'member-area') {
      const path = TAB_TO_PATH[currentTab] ?? `/${currentTab}`;
      if (getPath() !== path) window.history.replaceState(null, '', path);
    }
  }, [appView, currentTab, publicSection]);

  // Redireciona quando sessão restaurada na tela de login
  useEffect(() => {
    if (!loading && user && appView === 'login') {
      setAppView('member-area');
      setCurrentTabRaw('dashboard');
    }
  }, [loading, user, appView]);

  // Navega quando usuário usa botão voltar/avançar do browser
  useEffect(() => {
    const onPop = () => {
      const detected = detectView();
      setAppView(detected.view);
      setCurrentTabRaw(detected.tab);
      setPublicSectionRaw(detected.publicSection);
      setInviteToken(detected.inviteToken);
      setEventPublicId(detected.eventPublicId);
      setProfPublicId(detected.profPublicId);
      setForumTopicId(detected.forumTopicId);
      setResetToken(detected.resetToken);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const setPublicSection = (section: PublicSection) => {
    setPublicSectionRaw(section);
    const path = PUBLIC_SECTION_TO_PATH[section];
    window.history.pushState(null, '', path);
  };

  const setCurrentTab = (tab: string) => {
    setCurrentTabRaw(tab);
    setSidebarOpen(false);
    if (tab !== 'diretorio-membros') setAutoOpenProfile(false);
    const path = TAB_TO_PATH[tab] ?? `/${tab}`;
    window.history.pushState(null, '', path);
  };

  const handleLoginSuccess = () => {
    setAppView('member-area');
    setCurrentTabRaw('dashboard');
    window.history.replaceState(null, '', '/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    setAppView('public');
    setCurrentTabRaw('projetos-melodias');
    window.history.replaceState(null, '', '/');
  };

  // ── REDEFINIR SENHA ────────────────────────────────────────────────────────────

  if (appView === 'reset-password') {
    return (
      <ResetPasswordView
        token={resetToken}
        onGoToLogin={() => {
          setAppView('login');
          window.history.replaceState(null, '', '/login');
        }}
      />
    );
  }

  // ── EVENTO PÚBLICO ───────────────────────────────────────────────────────────

  if (appView === 'event-public') {
    return <EventPublicView eventId={eventPublicId} />;
  }

  // ── PROFISSIONAL PÚBLICO ──────────────────────────────────────────────────────

  if (appView === 'prof-public') {
    return <ProfessionalPublicPage userId={profPublicId} />;
  }

  // ── INVITE REGISTER ──────────────────────────────────────────────────────────

  if (appView === 'invite') {
    return (
      <InviteRegisterView
        token={inviteToken}
        onSuccess={() => {
          window.location.href = '/dashboard';
        }}
      />
    );
  }

  // ── LOADING ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-clay to-brand-moss flex items-center justify-center shadow-xl mx-auto">
            <span className="text-2xl text-white font-serif font-black italic">♩Ψ</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-500 text-sm">
            <span className="animate-spin text-lg">⟳</span>
            <span>Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  // ── PUBLIC SITE ───────────────────────────────────────────────────────────────

  if (appView === 'public') {
    return (
      <PublicSite
        blogs={[]}
        events={[]}
        initialSection={publicSection}
        onSectionChange={setPublicSection}
        onGoToLogin={() => {
          setAppView('login');
          window.history.pushState(null, '', '/login');
        }}
      />
    );
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────────────

  if (appView === 'login') {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onGoToPublicSite={() => {
          setAppView('public');
          window.history.pushState(null, '', '/');
        }}
      />
    );
  }

  // ── MEMBER AREA ───────────────────────────────────────────────────────────────

  if (!user) {
    setAppView('login');
    window.history.replaceState(null, '', '/login');
    return null;
  }

  const userForComponents = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    approvalStatus: (user.approvalStatus as 'approved' | 'pending' | 'rejected') ?? 'approved',
  };

  const showOnboarding = !onboardingDismissed && user.profileCompleted === false;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none" id="melodias-root-container">

      {showOnboarding && (
        <WelcomeOnboardingModal
          userName={user.name}
          onCompleteProfile={() => {
            setOnboardingDismissed(true);
            setAutoOpenProfile(true);
            setCurrentTab('diretorio-membros');
          }}
          onSkipped={() => setOnboardingDismissed(true)}
        />
      )}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          userRole={user.role}
          userName={user.name}
          userAvatar={user.avatar}
          pendingRequestsCount={0}
          openHelpRequestsCount={0}
          onLogout={handleLogout}
          onGoToPublicSite={() => {
            setAppView('public');
            window.history.pushState(null, '', '/');
          }}
        />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">

        <Header
          currentUser={userForComponents as never}
          availableUsers={[]}
          onUserSwitch={() => {}}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onGoToPublicSite={() => {
            setAppView('public');
            window.history.pushState(null, '', '/');
          }}
          onGoToProfile={() => {
            setAutoOpenProfile(true);
            setCurrentTab('diretorio-membros');
          }}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">

          {currentTab === 'projetos-melodias' && <ProjectsView />}

          {currentTab === 'dashboard' && (
            <DashboardView
              currentUser={userForComponents as never}
              onsetTab={setCurrentTab}
            />
          )}

          {currentTab === 'aprendizados' && (
            <LearningsView currentUser={userForComponents as never} />
          )}

          {currentTab === 'materiais-apoio' && (
            <MaterialsView currentUser={userForComponents as never} />
          )}

          {currentTab === 'forum' && (
            <ForumView
              currentUser={userForComponents as never}
              initialTopicId={forumTopicId || undefined}
              onTopicOpen={id => {
                setForumTopicId(id);
                window.history.pushState(null, '', `/forum/${id}`);
              }}
              onTopicClose={() => {
                setForumTopicId('');
                window.history.pushState(null, '', '/forum');
              }}
            />
          )}

          {currentTab === 'admin-materiais' && (
            <MaterialsView currentUser={userForComponents as never} />
          )}

          {currentTab === 'admin-sugestoes' && <SugestoesView isAdmin />}

          {currentTab === 'admin-solicitacoes' && <AdminUsersView viewType="solicitacoes" />}

          {currentTab === 'admin-configuracoes' && (
            <ConfigView
              currentUser={userForComponents as never}
              onResetData={() => {}}
              totalUsers={0}
              totalMaterials={0}
              totalTopics={0}
              totalEvents={0}
            />
          )}

          {currentTab === 'preciso-ajuda' && <HelpRequestView />}

          {currentTab === 'diretorio-membros' && (
            <DirectoryView
              autoOpenOwnProfile={autoOpenProfile}
              key={autoOpenProfile ? 'auto-profile' : 'default'}
            />
          )}

          {currentTab === 'encontros-eventos' && <EventsView />}

          {currentTab === 'galeria-site' && (
            <GalleryAdminView currentUser={userForComponents as never} />
          )}

          {currentTab === 'usuarios-admin' && <AdminUsersView viewType="usuarios" />}

          {currentTab === 'invite-links' && <InviteLinksView />}

        </main>
      </div>
    </div>
  );
}

// ─── Root com AuthProvider ────────────────────────────────────────────────────

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <LayoutProvider>
          <AppInner />
        </LayoutProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
