import React from 'react';
import { AppUser, UserRole } from '../types';
import { 
  UserCheck, 
  UserPlus2, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  Key,
  Database,
  Search
} from 'lucide-react';

interface AdminUsersViewProps {
  users: AppUser[];
  currentUser: AppUser;
  onApproveUser: (userId: string) => void;
  onToggleUserRole: (userId: string, newRole: UserRole) => void;
  viewType: 'solicitacoes' | 'usuarios';
}

export default function AdminUsersView({
  users,
  currentUser,
  onApproveUser,
  onToggleUserRole,
  viewType
}: AdminUsersViewProps) {
  
  const pendingUsers = users.filter(usr => usr.approvalStatus === 'pending');
  const activeUsers = users.filter(usr => usr.approvalStatus === 'approved');

  if (viewType === 'solicitacoes') {
    return (
      <div className="space-y-6 animate-fadeIn" id="membership-requests-dashboard">
        <div className="bg-white border p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-serif font-bold text-slate-800 tracking-tight flex items-center">
            <UserPlus2 className="w-5.5 h-5.5 mr-2 text-rose-500" />
            Solicitações de Cadastro Aguardando Aprovação
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Membros que enviaram pedido de entrada para o ecossistema Melodias. Você precisa revisar os dados de CRP ou e-mail antes de habilitar acessos ao fórum.
          </p>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-500">✨ Excelente! Não há solicitações pendentes de autorização no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map(usr => (
              <div key={usr.id} className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center justify-between shadow-sm animate-scaleUp">
                <div className="flex items-center space-x-3.5">
                  <img src={usr.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{usr.name}</h4>
                    <p className="text-xs text-slate-500 font-medium flex items-center">
                      <Mail className="w-3.5 h-3.5 text-slate-400 mr-1" /> {usr.email}
                    </p>
                    <span className="inline-block mt-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded">
                      ⌛ AGUARDANDO CONTROLES
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    id={`btn-approve-${usr.id}`}
                    onClick={() => {
                      onApproveUser(usr.id);
                      alert(`✅ O cadastro de ${usr.name} foi validado com sucesso! Ela(e) já possui acesso liberado ao fórum.`);
                    }}
                    className="px-4 py-2 bg-[#581a2e] hover:bg-[#3d1220] text-see-50 text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
                  >
                    Homologar e Habilitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- FULL USER LIST DIRECTORY FOR SYSTEM ADMINS ---
  return (
    <div className="space-y-6 animate-fadeIn" id="registered-users-directory">
      <div className="bg-white border p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-800 tracking-tight flex items-center">
            <Key className="w-5.5 h-5.5 mr-2 text-[#581a2e]" />
            Gerenciador de Usuários e Permissões Administrativas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Modifique níveis de acesso de membros para profissionais de psicologia para habilitar escrita de artigos de blog científicos.
          </p>
        </div>
        <span className="text-xs bg-[#581a2e]/5 text-[#581a2e] font-bold px-3 py-1 rounded-xl">
          Total Ativos: {activeUsers.length}
        </span>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase tracking-widest">
              <th className="p-4 pl-6">Foto & Informação</th>
              <th className="p-4">Cargo / Nível</th>
              <th className="p-4">Ação de Cargo</th>
              <th className="p-4 text-right pr-6">Status Interno</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {users.map(usr => (
              <tr key={usr.id} className="hover:bg-slate-50/40">
                <td className="p-4 pl-6 flex items-center space-x-3">
                  <img src={usr.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <h5 className="font-bold text-slate-800">{usr.name}</h5>
                    <span className="text-[10px] text-slate-400 font-bold">{usr.email}</span>
                  </div>
                </td>

                <td className="p-4 capitalize font-semibold">
                  {usr.role === 'super-admin' ? '👑 Super Admin' : usr.role === 'professional' ? '🩺 Psicólogo' : '👥 Membro'}
                </td>

                <td className="p-4">
                  {usr.id === currentUser.id ? (
                    <span className="text-[10px] text-slate-400 italic">Sua sessão ativa</span>
                  ) : (
                    <select
                      value={usr.role}
                      onChange={(e) => onToggleUserRole(usr.id, e.target.value as UserRole)}
                      className="bg-white border border-slate-200 text-xs py-1 px-2 rounded-lg font-medium text-slate-705"
                    >
                      <option value="member">Membro Associado</option>
                      <option value="professional">Psicólogo Clínico</option>
                      <option value="super-admin">Super Admin</option>
                    </select>
                  )}
                </td>

                <td className="p-4 text-right pr-6">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    usr.approvalStatus === 'approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-700 font-bold'
                  }`}>
                    {usr.approvalStatus === 'approved' ? 'Autorizado' : 'Aguardando'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
