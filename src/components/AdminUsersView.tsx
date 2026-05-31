import React, { useState, useEffect } from 'react';
import {
  UserCheck, UserPlus2, Key, Search, Crown,
  Stethoscope, Users, Clock, CheckCircle2, AlertCircle,
  Shield, Sparkles, RefreshCw, ChevronDown, Plus
} from 'lucide-react';
import { usersApi, type User } from '../lib/api';

type UserRole = 'super-admin' | 'professional' | 'member';
import { useAuth } from '../lib/auth';
import { PageWrapper, SectionTitle, ContentCard } from './ui/PageWrapper';
import { Badge } from './ui/Badge';
import {
  Button, Modal, ModalFooter,
  Input, Select, FormRow, Divider,
  useToast,
} from './ui';

const ROLE_META: Record<UserRole, { label: string; icon: React.ElementType; badge: 'danger'|'info'|'success' }> = {
  'super-admin': { label: 'Super Admin', icon: Crown,       badge: 'danger'  },
  'professional':{ label: 'Psicólogo',  icon: Stethoscope, badge: 'info'    },
  'member':      { label: 'Membro',     icon: Users,       badge: 'success' },
};

function RoleBadge({ role }: { role: UserRole }) {
  const m = ROLE_META[role];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
      m.badge === 'danger'  ? 'bg-[#581a2e]/10 text-[#581a2e] border-[#581a2e]/20' :
      m.badge === 'info'    ? 'bg-cyan-50 text-cyan-800 border-cyan-200' :
                               'bg-emerald-50 text-emerald-800 border-emerald-200'
    }`}>
      <Icon className="w-3 h-3" />{m.label}
    </span>
  );
}

// ── SOLICITAÇÕES ──────────────────────────────────────────────────────────────
function SolicitacoesView() {
  const { user: me } = useAuth();
  const [users, setUsers]         = useState<User[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string|null>(null);
  const [approving, setApproving] = useState<string|null>(null);

  const load = () => {
    setLoading(true);
    usersApi.list({ status: 'pending', limit: 50 })
      .then(res => { setUsers(res.data); setError(null); })
      .catch(() => setError('Erro ao carregar solicitações.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (u: User) => {
    setApproving(u.id);
    try {
      await usersApi.setApproval(u.id, 'approved');
      setUsers(prev => prev.filter(x => x.id !== u.id));
    } catch { setError('Erro ao aprovar usuário.'); }
    finally { setApproving(null); }
  };

  const pending  = users;
  const [approved, setApproved] = useState<User[]>([]);

  useEffect(() => {
    usersApi.list({ status: 'approved', limit: 50 })
      .then(res => setApproved(res.data))
      .catch(() => {});
  }, [users.length]);

  return (
    <PageWrapper id="membership-requests-dashboard">
      <div className="space-y-5 sm:space-y-6 animate-fadeIn">

        <ContentCard padding="md" id="solicitacoes-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${pending.length > 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                <UserPlus2 className={`w-5 h-5 ${pending.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">Solicitações de Cadastro</h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">Revise os dados antes de habilitar o acesso ao sistema.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pending.length > 0 && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <AlertCircle className="w-4 h-4" />{pending.length} pendente{pending.length !== 1 ? 's' : ''}
                </div>
              )}
              <button onClick={load} className="p-2 text-slate-400 hover:text-brand-clay rounded-lg transition">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-brand-sand/60">
            {[
              { label: 'Pendentes', value: pending.length,  color: pending.length > 0 ? 'text-amber-600' : 'text-slate-400' },
              { label: 'Ativos',   value: approved.length, color: 'text-emerald-600' },
              { label: 'Total',    value: pending.length + approved.length, color: 'text-brand-navy' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </ContentCard>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
            <button onClick={load} className="ml-auto text-xs font-bold underline">Tentar novamente</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />Carregando...
          </div>
        ) : pending.length === 0 ? (
          <ContentCard padding="lg">
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-100 mx-auto mb-3" />
              <p className="text-sm font-bold text-brand-navy">Tudo em dia!</p>
              <p className="text-xs text-slate-400 mt-1">Não há solicitações pendentes.</p>
            </div>
          </ContentCard>
        ) : (
          <div id="solicitacoes-list" className="space-y-3">
            <SectionTitle title="Aguardando Aprovação" icon={Clock} />
            {pending.map(u => (
              <div key={u.id} id={`request-card-${u.id}`}>
              <ContentCard padding="md">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative shrink-0">
                      <img src={u.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=48`}
                        alt={u.name} className="w-11 h-11 rounded-xl object-cover border-2 border-brand-sand shadow-sm" />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                        <Clock className="w-2.5 h-2.5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-brand-navy">{u.name}</p>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      {u.specialty && <p className="text-[11px] text-brand-clay font-semibold mt-0.5">{u.specialty}</p>}
                      {u.crp && <p className="text-[11px] text-slate-400 font-mono">{u.crp}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />Pendente
                    </span>
                    <button id={`btn-approve-${u.id}`} onClick={() => handleApprove(u)} disabled={approving === u.id}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase rounded-xl transition ${
                        approving === u.id ? 'bg-emerald-100 text-emerald-600 cursor-default' : 'bg-brand-clay hover:bg-brand-clay-dark text-white shadow-md shadow-brand-clay/20'
                      }`}>
                      {approving === u.id ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Aprovando...</> : <><CheckCircle2 className="w-3.5 h-3.5" />Aprovar</>}
                    </button>
                  </div>
                </div>
              </ContentCard>
              </div>
            ))}
          </div>
        )}

        {approved.length > 0 && (
          <div id="approved-list">
            <SectionTitle title="Membros Ativos" icon={UserCheck} divider />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {approved.map(u => (
                <div key={u.id} className="flex items-center gap-3 bg-white border border-brand-sand/60 rounded-xl p-3 hover:shadow-sm transition">
                  <img src={u.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=36`}
                    alt={u.name} className="w-9 h-9 rounded-lg object-cover border border-brand-sand shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-brand-navy truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                  </div>
                  <RoleBadge role={u.role} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

// ── ESPECIALIDADES ────────────────────────────────────────────────────────────
const ESPECIALIDADES = [
  { value: 'psicologo', label: 'Psicólogo(a)' },
  { value: 'psicopedagogo', label: 'Psicopedagogo(a)' },
  { value: 'pediatra', label: 'Pediatra' },
  { value: 'psiquiatra', label: 'Psiquiatra' },
  { value: 'terapeuta_ocupacional', label: 'Terapeuta Ocupacional' },
  { value: 'medico', label: 'Médico(a)' },
  { value: 'outro', label: 'Outro' },
];

interface NovoUsuarioForm {
  name: string;
  email: string;
  password: string;
  especialidade: string;
  especialidadeCustom: string;
  genero: string;
  whatsapp: string;
  role: string;
}

function formatWhatsapp(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}

// ── GERENCIADOR DE USUÁRIOS ───────────────────────────────────────────────────
function UsuariosView() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState<'all'|UserRole>('all');
  const [error, setError]     = useState<string|null>(null);
  const [changingRole, setChangingRole] = useState<string|null>(null);

  // modal novo usuário
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<NovoUsuarioForm>({
    name: '', email: '', password: '', especialidade: '', especialidadeCustom: '',
    genero: '', whatsapp: '', role: 'member',
  });

  const resetForm = () => setForm({
    name: '', email: '', password: '', especialidade: '', especialidadeCustom: '',
    genero: '', whatsapp: '', role: 'member',
  });

  const handleCriarUsuario = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error('Nome, e-mail e senha são obrigatórios.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setSalvando(true);
    try {
      const especialidade = form.especialidade === 'outro'
        ? form.especialidadeCustom.trim()
        : ESPECIALIDADES.find(e => e.value === form.especialidade)?.label ?? '';
      await usersApi.create({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        specialty: especialidade || undefined,
        whatsapp: form.whatsapp || undefined,
        gender: form.genero || undefined,
      });
      toast.success('Usuário criado com sucesso!');
      setModalAberto(false);
      resetForm();
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar usuário.';
      toast.error(msg);
    } finally {
      setSalvando(false);
    }
  };

  const load = () => {
    setLoading(true);
    usersApi.list({
      search: search || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      limit: 100,
    })
      .then(res => { setUsers(res.data); setError(null); })
      .catch(() => setError('Erro ao carregar usuários.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, roleFilter]);

  const handleChangeRole = async (id: string, role: UserRole) => {
    setChangingRole(id);
    try {
      await usersApi.changeRole(id, role);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    } catch { setError('Erro ao alterar cargo.'); }
    finally { setChangingRole(null); }
  };

  const stats = {
    admins:  users.filter(u => u.role === 'super-admin').length,
    pros:    users.filter(u => u.role === 'professional').length,
    members: users.filter(u => u.role === 'member').length,
  };

  return (
    <PageWrapper id="registered-users-directory">
      <div className="space-y-5 sm:space-y-6 animate-fadeIn">

        <ContentCard padding="md" id="usuarios-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-brand-navy/5 rounded-xl shrink-0">
                <Key className="w-5 h-5 text-brand-navy" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">Gerenciador de Usuários</h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">Modifique níveis de acesso e gerencie permissões do sistema.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-brand-navy/5 border border-brand-navy/10 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-navy shrink-0">
                <Shield className="w-4 h-4" />{users.filter(u => u.approval_status === 'approved').length} ativos
              </div>
              <Button size="sm" iconLeft={<Plus size={13} />} onClick={() => setModalAberto(true)}>
                Novo Usuário
              </Button>
              <button onClick={load} className="p-2 text-slate-400 hover:text-brand-clay rounded-lg transition">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-brand-sand/60">
            {[
              { label: 'Admins',    value: stats.admins,  color: 'text-[#581a2e]' },
              { label: 'Psicólogos',value: stats.pros,    color: 'text-cyan-700'  },
              { label: 'Membros',   value: stats.members, color: 'text-emerald-700'},
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </ContentCard>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
            <button onClick={load} className="ml-auto text-xs font-bold underline">Tentar novamente</button>
          </div>
        )}

        <div id="usuarios-filters" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input id="usuarios-search" type="text" placeholder="Buscar por nome ou e-mail..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full text-xs text-brand-navy bg-white border border-brand-sand pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-navy transition" />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'super-admin', 'professional', 'member'] as const).map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition whitespace-nowrap ${
                  roleFilter === r ? 'bg-brand-navy text-white border-transparent' : 'bg-white text-slate-600 border-brand-sand hover:bg-brand-sand/30'
                }`}>
                {r === 'all' ? 'Todos' : r === 'super-admin' ? 'Admins' : r === 'professional' ? 'Psicólogos' : 'Membros'}
              </button>
            ))}
          </div>
        </div>

        <ContentCard padding="none" id="usuarios-table">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl sm:rounded-3xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-brand-sand/60">
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuário</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cargo</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alterar Nível</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand/40">
                {users.map(u => (
                  <tr key={u.id} id={`user-row-${u.id}`} className="hover:bg-brand-sand/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img src={u.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=36`}
                            alt={u.name} className="w-9 h-9 rounded-xl object-cover border border-brand-sand" />
                          {u.id === me?.id && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-moss rounded-full border-2 border-white flex items-center justify-center">
                              <Sparkles className="w-2 h-2 text-white" />
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
                            {u.name}
                            {u.id === me?.id && <span className="text-[9px] bg-brand-moss/10 text-brand-moss px-1.5 py-0.5 rounded font-semibold">Você</span>}
                          </p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                    <td className="px-5 py-3.5">
                      {u.id === me?.id ? (
                        <span className="text-[10px] text-slate-400 italic">Sessão atual</span>
                      ) : changingRole === u.id ? (
                        <span className="flex items-center gap-1.5 text-xs text-slate-400"><RefreshCw className="w-3.5 h-3.5 animate-spin" />Alterando...</span>
                      ) : (
                        <div className="relative inline-block">
                          <select id={`role-select-${u.id}`} value={u.role}
                            onChange={e => handleChangeRole(u.id, e.target.value as UserRole)}
                            className="text-xs bg-white border border-brand-sand text-brand-navy py-1.5 pl-3 pr-7 rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-brand-clay transition appearance-none cursor-pointer hover:border-brand-clay">
                            <option value="member">Membro</option>
                            <option value="professional">Psicólogo</option>
                            <option value="super-admin">Super Admin</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        u.approval_status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {u.approval_status === 'approved'
                          ? <><CheckCircle2 className="w-3 h-3" />Ativo</>
                          : <><Clock className="w-3 h-3" />Pendente</>
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-brand-sand/40">
            {users.map(u => (
              <div key={u.id} id={`user-card-mobile-${u.id}`} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={u.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=40`}
                    alt={u.name} className="w-10 h-10 rounded-xl object-cover border border-brand-sand shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-brand-navy truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {u.approval_status === 'approved' ? 'Ativo' : 'Pendente'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <RoleBadge role={u.role} />
                  {u.id !== me?.id ? (
                    <select value={u.role} onChange={e => handleChangeRole(u.id, e.target.value as UserRole)}
                      className="text-xs bg-white border border-brand-sand text-brand-navy py-1.5 px-3 rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-brand-clay">
                      <option value="member">Membro</option>
                      <option value="professional">Psicólogo</option>
                      <option value="super-admin">Super Admin</option>
                    </select>
                  ) : <span className="text-[10px] text-slate-400 italic">Você</span>}
                </div>
              </div>
            ))}
          </div>

          {!loading && users.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-semibold">Nenhum usuário encontrado</p>
            </div>
          )}
          {loading && (
            <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />Carregando...
            </div>
          )}
        </ContentCard>
      </div>

      {/* ── Modal: Novo Usuário ────────────────────────────────────────────── */}
      <Modal
        isOpen={modalAberto}
        onClose={() => { setModalAberto(false); resetForm(); }}
        title="Novo Usuário"
        size="lg"
        footer={
          <ModalFooter>
            <Button variant="outline" onClick={() => { setModalAberto(false); resetForm(); }}>Cancelar</Button>
            <Button loading={salvando} onClick={handleCriarUsuario}>Criar Usuário</Button>
          </ModalFooter>
        }
      >
        <div className="space-y-4">
          <FormRow cols={2}>
            <Input
              label="Nome completo"
              placeholder="Ex: Maria Souza"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </FormRow>

          <FormRow cols={2}>
            <Input
              label="Senha de acesso"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            <Input
              label="WhatsApp"
              placeholder="(00) 00000-0000"
              value={form.whatsapp}
              onChange={e => setForm(f => ({ ...f, whatsapp: formatWhatsapp(e.target.value) }))}
            />
          </FormRow>

          <FormRow cols={2}>
            <Select
              label="Especialidade"
              placeholder="Selecione..."
              options={ESPECIALIDADES}
              value={form.especialidade}
              onChange={e => setForm(f => ({ ...f, especialidade: e.target.value, especialidadeCustom: '' }))}
            />
            <Select
              label="Gênero"
              placeholder="Selecione..."
              options={[
                { value: 'nao_declarado', label: 'Não declarado' },
                { value: 'masculino', label: 'Masculino' },
                { value: 'feminino', label: 'Feminino' },
              ]}
              value={form.genero}
              onChange={e => setForm(f => ({ ...f, genero: e.target.value }))}
            />
          </FormRow>

          {form.especialidade === 'outro' && (
            <Input
              label="Qual é a especialidade?"
              placeholder="Digite a especialidade..."
              value={form.especialidadeCustom}
              onChange={e => setForm(f => ({ ...f, especialidadeCustom: e.target.value }))}
            />
          )}

          <Divider />

          <Select
            label="Permissão / Nível de acesso"
            options={[
              { value: 'member', label: 'Membro — acesso básico à plataforma' },
              { value: 'professional', label: 'Editor — pode publicar conteúdos, materiais, criar enquetes e eventos' },
              { value: 'super-admin', label: 'Admin — acesso total, incluindo gestão de usuários e links' },
            ]}
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          />
        </div>
      </Modal>
    </PageWrapper>
  );
}

// ── EXPORT ────────────────────────────────────────────────────────────────────
interface AdminUsersViewProps {
  users?: never[];
  currentUser?: never;
  onApproveUser?: never;
  onToggleUserRole?: never;
  viewType: 'solicitacoes' | 'usuarios';
}

export default function AdminUsersView({ viewType }: AdminUsersViewProps) {
  if (viewType === 'solicitacoes') return <SolicitacoesView />;
  return <UsuariosView />;
}
