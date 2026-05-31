import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Globe,
  RotateCcw,
  Sparkles,
  X,
  ChevronDown,
  Menu
} from 'lucide-react';
import { UserRole, AppUser } from '../types';

interface HeaderProps {
  currentUser: AppUser;
  availableUsers: AppUser[];
  onUserSwitch: (userId: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onGoToPublicSite: () => void;
  onResetData?: () => void;
  onToggleSidebar?: () => void;
}

const notifications: Array<{ id: number; text: string; time: string; unread: boolean }> = []; /*
  { id: 1, text: 'Nova solicitação de ajuda urgente (Mariana Duarte).', time: 'Há 5 min', unread: true },
  { id: 2, text: 'Gabriel Souza comentou na publicação de Ansiedade.', time: 'Há 2h', unread: false },
  { id: 3, text: 'Seu cadastro profissional foi verificado e aprovado!', time: 'Há 1 dia', unread: false },
*/

const unreadCount = notifications.filter(n => n.unread).length;

function getRoleBadge(role: UserRole) {
  switch (role) {
    case 'super-admin': return { label: 'Super Admin', cls: 'bg-[#581a2e]/90 text-pink-100' };
    case 'professional': return { label: 'Psicólogo', cls: 'bg-cyan-800 text-cyan-100' };
    case 'member': return { label: 'Membro', cls: 'bg-emerald-800 text-emerald-100' };
  }
}

export default function Header({
  currentUser,
  availableUsers,
  onUserSwitch,
  searchTerm,
  setSearchTerm,
  onGoToPublicSite,
  onResetData,
  onToggleSidebar,
}: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const roleBadge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100/80 shadow-[0_1px_12px_0_rgba(0,0,0,0.06)]">
      <div className="h-16 flex items-center gap-3 px-4 md:px-6">

        {/* Hamburger — mobile only */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden shrink-0 p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <div className={`flex-1 max-w-md relative transition-all duration-200 ${searchFocused ? 'max-w-xl' : ''}`}>
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className={`w-4 h-4 transition-colors ${searchFocused ? 'text-[#581a2e]' : 'text-slate-400'}`} />
          </span>
          <input
            id="system-search-bar"
            type="text"
            placeholder="Pesquisar…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-sm pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#581a2e]/30 focus:border-[#581a2e]/50 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right-side actions */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0">

          {/* Simulador de acesso — colapsado em mobile */}
          {availableUsers.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:block">Perfil</span>
            <select
              id="user-role-switcher"
              value={currentUser.id}
              onChange={e => onUserSwitch(e.target.value)}
              className="text-xs bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer max-w-[130px] md:max-w-[180px]"
            >
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role === 'super-admin' ? 'Admin' : user.role === 'professional' ? 'Psicólogo' : 'Membro'})
                </option>
                ))}
              </select>
          </div>
          )}

          {/* Site público */}
          <button
            onClick={onGoToPublicSite}
            title="Ver Site Público"
            className="p-2 rounded-xl text-slate-500 hover:bg-brand-moss/10 hover:text-brand-moss transition"
          >
            <Globe className="w-5 h-5" />
          </button>

          {/* Reset */}
          {onResetData && (
          <button
            onClick={onResetData}
            title="Redefinir dados"
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <RotateCcw className="w-4.5 h-4.5" />
          </button>
          )}

          {/* Notificações */}
          <div ref={notifRef} className="relative">
            <button
              id="btn-notifications"
              onClick={() => setNotifOpen(v => !v)}
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-800">Notificações</span>
                  <span className="text-[10px] bg-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-full">{unreadCount} nova{unreadCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                  {notifications.length === 0 && (
                    <div className="px-4 py-6 text-xs text-slate-400 text-center">
                      Nenhuma notificaÃ§Ã£o no momento.
                    </div>
                  )}
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 text-xs transition ${notif.unread ? 'bg-pink-50/60' : 'hover:bg-slate-50'}`}
                    >
                      {notif.unread && <span className="inline-block w-1.5 h-1.5 bg-[#581a2e] rounded-full mr-1.5 mb-0.5" />}
                      <p className="text-slate-700 font-medium leading-snug">{notif.text}</p>
                      <p className="text-slate-400 mt-0.5">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="w-full py-2.5 text-xs font-semibold text-[#581a2e] hover:bg-slate-50 border-t border-slate-100 transition"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>

          {/* Perfil do usuário */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-slate-100 transition group"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 group-hover:ring-[#581a2e]/40 transition"
              />
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wide ${roleBadge.cls}`}>{roleBadge.label}</span>
              </div>
              <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-lg object-cover" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500">{currentUser.email}</p>
                  </div>
                </div>
                {/* Simulador visível no mobile via dropdown */}
                {availableUsers.length > 0 && (
                <div className="sm:hidden px-4 py-3 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500" /> Simular Perfil
                  </p>
                  <select
                    value={currentUser.id}
                    onChange={e => { onUserSwitch(e.target.value); setProfileOpen(false); }}
                    className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role === 'super-admin' ? 'Admin' : user.role === 'professional' ? 'Psicólogo' : 'Membro'})
                      </option>
                      ))}
                  </select>
                </div>
                )}
                <button
                  onClick={() => { onGoToPublicSite(); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 transition"
                >
                  <Globe className="w-4 h-4 text-slate-400" />
                  Ver Site Público
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
