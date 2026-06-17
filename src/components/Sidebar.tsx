import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  MessageSquare,
  FolderLock,
  Lightbulb,
  UserPlus2,
  Settings,
  HeartPulse,
  Users,
  CalendarDays,
  LogOut,
  HelpCircle,
  FileHeart,
  Key,
  Sparkles,
  Globe,
  Link2,
} from 'lucide-react';
import { UserRole } from '../types';
import { SIDEBAR_SPACING, ICON_SIZES, MARGIN, CONTENT_SPACING } from '@/src/theme';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  userName: string;
  userAvatar: string;
  pendingRequestsCount: number;
  openHelpRequestsCount: number;
  onLogout: () => void;
  onGoToPublicSite: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  userRole,
  userName,
  userAvatar,
  pendingRequestsCount,
  openHelpRequestsCount,
  onLogout,
  onGoToPublicSite
}: SidebarProps) {
  
  // Custom navigation items based on permission roles
  const systemTabs = [
    { id: 'projetos-melodias', label: 'Nossos Projetos ✦', icon: Sparkles },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'aprendizados', label: 'Aprendizados', icon: GraduationCap },
    { id: 'materiais-apoio', label: 'Materiais de Apoio', icon: BookOpen },
    { id: 'forum', label: 'Fórum', icon: MessageSquare }
  ];

  const adminTabs = [
    { id: 'admin-materiais', label: 'Materiais', icon: FileHeart, minRole: 'professional' },
    { id: 'admin-sugestoes', label: 'Sugestões', icon: Lightbulb, minRole: 'member' }, // all can see & post suggestions
    { id: 'admin-solicitacoes', label: 'Solicitações', icon: UserPlus2, minRole: 'super-admin', badge: pendingRequestsCount },
    { id: 'admin-configuracoes', label: 'Configurações', icon: Settings, minRole: 'professional' }
  ];

  const communityTabs = [
    { id: 'preciso-ajuda', label: 'Preciso de Ajuda', icon: HeartPulse, badge: openHelpRequestsCount },
    { id: 'diretorio-membros', label: 'Diretório / Profissionais', icon: Users },
    { id: 'encontros-eventos', label: 'Encontros & Eventos', icon: CalendarDays }
  ];

  const superAdminTabs = [
    { id: 'usuarios-admin', label: 'Usuários do Sistema', icon: Key, minRole: 'super-admin' },
    { id: 'invite-links',   label: 'Links de Convite',   icon: Link2, minRole: 'super-admin' },
  ];

  const hasAccess = (itemMinRole?: string) => {
    if (!itemMinRole) return true;
    if (userRole === 'super-admin') return true;
    if (userRole === 'professional') {
      return itemMinRole === 'professional' || itemMinRole === 'member';
    }
    return itemMinRole === 'member';
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super-admin': return '👑 SUPER ADMIN';
      case 'professional': return '🩺 PSICÓLOGO / PROF';
      case 'member': return '👥 ASSOC. MEMBRO';
      default: return 'USUÁRIO';
    }
  };

  return (
    <aside id="system-sidebar" className={`${SIDEBAR_SPACING.width} bg-brand-navy-dark text-slate-300 flex flex-col h-screen border-r border-[#1e2e42] shrink-0 sticky top-0 overflow-y-auto`}>
      {/* Brand Logo - Melodias */}
      <div className="px-3 sm:px-4 md:px-5 py-4 sm:py-5 border-b border-[#1e2e42] flex items-center justify-start gap-2 sm:gap-3 bg-brand-navy/60">
        <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-brand-clay to-brand-moss flex items-center justify-center text-white shadow-lg shrink-0">
          <span className="text-sm sm:text-lg font-serif font-black italic">♩Ψ</span>
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <span className="font-serif text-sm sm:text-lg font-black tracking-wide text-brand-cream leading-none truncate">Espalhe</span>
          <span className="font-script text-lg sm:text-2xl text-brand-clay-light font-normal leading-none -mt-0.5 sm:-mt-1.5 pl-0.5 truncate">Melodias</span>
        </div>
      </div>

      {/* Nav Link Groups */}
      <div className={`flex-1 ${SIDEBAR_SPACING.padding} ${SIDEBAR_SPACING.gap} overflow-y-auto custom-scrollbar`}>
        
        {/* NAVEGAÇÃO PRINCIPAL */}
        <div className="space-y-1 sm:space-y-1.5">
          {systemTabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`sidebar-tab-${tab.id}`}
                onClick={() => setCurrentTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-moss text-white shadow-md shadow-brand-moss/20 font-semibold border-l-4 border-brand-clay'
                    : 'text-slate-400 hover:bg-brand-navy-light/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isActive ? 'text-brand-clay-light' : 'text-slate-450 group-hover:text-brand-clay-light'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ADMINISTRAÇÃO */}
        <div className="space-y-1 sm:space-y-1.5">
          <p className="px-3 sm:px-4 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-slate-500">Administração</p>
          {adminTabs.filter(tab => hasAccess(tab.minRole)).map((tab) => {
            const IconComponent = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`sidebar-tab-${tab.id}`}
                onClick={() => setCurrentTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-moss text-white shadow-md border-l-4 border-brand-clay'
                    : 'text-slate-400 hover:bg-brand-navy-light/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isActive ? 'text-brand-clay-light' : 'text-slate-450 group-hover:text-brand-clay-light'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge && tab.badge > 0 ? (
                  <span className="bg-brand-clay text-white font-semibold text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex items-center justify-center animate-pulse min-w-[20px] shrink-0">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* COMUNIDADE */}
        <div className="space-y-1 sm:space-y-1.5">
          <p className="px-3 sm:px-4 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-slate-500">Comunidade</p>
          {communityTabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`sidebar-tab-${tab.id}`}
                onClick={() => setCurrentTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-moss text-white shadow-md border-l-4 border-brand-clay'
                    : 'text-slate-400 hover:bg-brand-navy-light/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isActive ? 'text-brand-clay-light' : 'text-slate-450 group-hover:text-brand-clay-light'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge && tab.badge > 0 ? (
                  <span className="bg-[#f59e0b] text-slate-950 font-bold text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px] shrink-0">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* SUPER ADMIN */}
        {userRole === 'super-admin' && (
          <div className="space-y-1 sm:space-y-1.5">
            <p className="px-3 sm:px-4 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-slate-500">Super Admin</p>
            {superAdminTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`sidebar-tab-${tab.id}`}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-brand-moss text-white shadow-md border-l-4 border-brand-clay'
                      : 'text-slate-400 hover:bg-brand-navy-light/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isActive ? 'text-brand-clay-light' : 'text-slate-450 group-hover:text-brand-clay-light'}`} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* User Session Info */}
      <div className="p-3 sm:p-4 border-t border-[#1e2e42] bg-[#0c141e] shrink-0 space-y-2.5 sm:space-y-3">
        <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-brand-navy-light/30 border border-[#1e2e42] rounded-lg sm:rounded-xl">
          <img
            src={userAvatar}
            alt={userName}
            className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg object-cover border-2 border-brand-clay/70 shadow-inner shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{userName}</p>
            <p className="text-[9px] sm:text-[10px] font-semibold text-brand-clay-light truncate tracking-wide">{getRoleLabel(userRole)}</p>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
          <button
            onClick={onGoToPublicSite}
            className="w-full h-8 sm:h-9 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-brand-moss/10 text-brand-moss-light hover:bg-brand-moss/20 hover:text-brand-cream border border-brand-moss/30 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Ver Site Público</span>
            <span className="sm:hidden">Site Público</span>
          </button>
          <button
            id="btn-logout"
            onClick={onLogout}
            className="w-full h-8 sm:h-9 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-brand-clay/10 text-brand-clay-light hover:bg-brand-clay/20 hover:text-brand-cream border border-brand-clay/30 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Sair da Conta</span>
            <span className="sm:hidden">Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
