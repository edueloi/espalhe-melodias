import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun,
  Users,
  ShieldCheck,
  Menu,
  Sparkles,
  Info
} from 'lucide-react';
import { UserRole, AppUser } from '../types';

interface HeaderProps {
  currentUser: AppUser;
  availableUsers: AppUser[];
  onUserSwitch: (userId: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function Header({
  currentUser,
  availableUsers,
  onUserSwitch,
  searchTerm,
  setSearchTerm
}: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showRoleTour, setShowRoleTour] = useState(true);

  const mockNotifications = [
    { id: 1, text: 'Nova solicitação de ajuda urgente recebida (Mariana Duarte).', time: 'Há 5 min', unread: true },
    { id: 2, text: 'Gabriel Souza comentou na publicação de Ansiedade.', time: 'Há 2h', unread: false },
    { id: 3, text: 'Seu cadastro profissional foi verificado e aprovado!', time: 'Há 1 dia', unread: false }
  ];

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'super-admin': return 'bg-[#581a2e] text-pink-100 hover:bg-[#6b253b]';
      case 'professional': return 'bg-cyan-900 text-cyan-100 hover:bg-cyan-950';
      case 'member': return 'bg-emerald-950 text-emerald-100 hover:bg-emerald-900';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super-admin': return 'Super Admin - Acesso Total';
      case 'professional': return 'Psicólogo - Consulta e Suporte';
      case 'member': return 'Membro - Conteúdos e Fórum';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm h-20 flex items-center justify-between px-8">
      
      {/* Search Input */}
      <div className="w-1/3 min-w-[240px]">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" />
          </span>
          <input
            id="system-search-bar"
            type="text"
            placeholder="Pesquisar profissionais, fórum, materiais ou eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-slate-700 bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-850 focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Action Trays, Permissions Simulation Switcher & User Profile */}
      <div className="flex items-center space-x-6">
        
        {/* SIMULADOR DE ACESSOS / PERMISSÕES (Crucial Feature requested by user!) */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-slate-50 to-slate-100 p-2 rounded-xl border border-slate-200">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-end">
              <Sparkles className="w-3 h-3 text-[#a855f7] mr-1" /> Simular Acesso
            </span>
            <span className="text-xs font-semibold text-slate-650">Trocar de Perfil:</span>
          </div>
          <select
            id="user-role-switcher"
            value={currentUser.id}
            onChange={(e) => onUserSwitch(e.target.value)}
            className="text-xs bg-white text-slate-800 font-bold border border-slate-300 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-[#581a2e] shadow-sm hover:border-[#581a2e] transition"
          >
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role === 'super-admin' ? 'Admin' : user.role === 'professional' ? 'Psicólogo' : 'Membro'})
              </option>
            ))}
          </select>
        </div>

        {/* Notifications and Settings Simulation */}
        <div className="relative flex items-center space-x-3">
          
          {/* Notifications Button */}
          <button 
            id="btn-notifications"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition shadow-inner"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-ping"></span>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Simulated Darkmode Indicator */}
          <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition shadow-inner cursor-pointer" title="Tema Claro (Melodias Premium, altere nos controles)">
            <Moon className="w-5 h-5" />
          </div>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 top-14 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                <span className="text-sm font-bold text-slate-800">Mensagens & Alertas</span>
                <span className="text-[10px] bg-pink-100 text-pink-850 font-bold px-2 py-0.5 rounded-full">3 novas</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className={`p-2.5 rounded-lg text-xs transition ${notif.unread ? 'bg-pink-50/50 border-l-4 border-[#581a2e]' : 'hover:bg-slate-50'}`}>
                    <p className="text-slate-700 font-medium">{notif.text}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setNotificationsOpen(false)}
                className="w-full text-center text-xs font-semibold text-[#581a2e] pt-2 border-t border-slate-150 mt-2 block hover:underline"
              >
                Fechar Painel
              </button>
            </div>
          )}
        </div>

        {/* Rightmost Profile Display matching screenshot header */}
        <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
          <div className="text-right">
            <span className="block text-sm font-bold text-slate-800 leading-tight">{currentUser.name}</span>
            <span className={`inline-flex items-center px-2 py-0.5 mt-0.5 rounded-md text-[10px] font-bold tracking-wide shadow-sm border border-slate-200/50 ${getRoleBadgeColor(currentUser.role)}`}>
              {getRoleLabel(currentUser.role)}
            </span>
          </div>
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-11 h-11 rounded-xl object-cover border border-slate-350 shadow-md transform hover:scale-105 transition duration-150"
          />
        </div>

      </div>

    </header>
  );
}
