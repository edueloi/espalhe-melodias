import React, { useState, useEffect, useMemo } from 'react';
import {
  Link2, Plus, Copy, RefreshCw, Trash2, RotateCcw,
  Users, Clock, CheckCircle2, XCircle, Eye, AlertCircle,
  Shield, ChevronDown, Mail, Send, Ban, HandHeart,
} from 'lucide-react';
import { inviteLinksApi, emailInvitesApi, type InviteLink, type EmailInvite } from '../lib/api';
import {
  PageWrapper, SectionTitle, ContentCard, StatGrid, StatCard, FormRow,
  Button, IconButton, Modal, ModalFooter, ConfirmModal,
  Input, Select, Badge, EmptyState, GridTable, Column,
  FilterLine, FilterLineSection, FilterLineItem, FilterLineSearch, FilterLineSegmented,
  useToast,
} from './ui';

// ── Helpers ───────────────────────────────────────────────────────────────────

function copyToClipboard(text: string, toast: ReturnType<typeof useToast>) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success('Link copiado!');
  }).catch(() => toast.error('Não foi possível copiar.'));
}

function buildLink(token: string): string {
  return `${window.location.origin}/convite/${token}`;
}

function statusBadge(link: InviteLink) {
  const expired = new Date(link.expires_at) < new Date();
  const esgotado = link.max_uses !== null && link.uses_count >= link.max_uses;
  if (!link.is_active) return <Badge color="default" dot>Desativado</Badge>;
  if (expired)         return <Badge color="danger"  dot>Expirado</Badge>;
  if (esgotado)        return <Badge color="warning" dot>Esgotado</Badge>;
  return                      <Badge color="success" dot>Ativo</Badge>;
}

const VALIDITY_OPTIONS = [
  { value: '1',  label: '1 dia'  },
  { value: '3',  label: '3 dias' },
  { value: '7',  label: '7 dias' },
  { value: '15', label: '15 dias' },
  { value: '30', label: '30 dias' },
];

const ACCESS_OPTIONS = [
  { value: 'member',       label: 'Membro — acesso básico' },
  { value: 'professional', label: 'Editor — publica conteúdos e eventos' },
  { value: 'super-admin',  label: 'Admin — acesso total' },
];

const ROLE_LABELS: Record<string, string> = {
  'member':       'Membro',
  'professional': 'Editor',
  'super-admin':  'Admin',
};

const ROLE_COLORS: Record<string, 'success' | 'info' | 'danger'> = {
  'member':       'success',
  'professional': 'info',
  'super-admin':  'danger',
};

// ── Modal: Ver Inscrições ─────────────────────────────────────────────────────

interface VerInscricoesModalProps {
  link: InviteLink | null;
  onClose: () => void;
}

interface InviteUse {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  used_at: string;
}

function VerInscricoesModal({ link, onClose }: VerInscricoesModalProps) {
  const [uses, setUses] = useState<InviteUse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!link) return;
    setLoading(true);
    inviteLinksApi.getUses(link.id)
      .then(setUses)
      .catch(() => setUses([]))
      .finally(() => setLoading(false));
  }, [link?.id]);

  const cols: Column<InviteUse>[] = [
    { header: 'Nome', accessor: 'user_name' },
    { header: 'E-mail', accessor: 'user_email', hideOnMobile: true },
    {
      header: 'Data',
      render: row => new Date(row.used_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
      hideOnMobile: true,
    },
  ];

  return (
    <Modal
      isOpen={!!link}
      onClose={onClose}
      title={`Inscrições — ${link?.label || 'Link'}`}
      size="lg"
      footer={<ModalFooter><Button variant="outline" onClick={onClose}>Fechar</Button></ModalFooter>}
    >
      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-sm">
          <RefreshCw size={14} className="animate-spin" />Carregando...
        </div>
      ) : uses.length === 0 ? (
        <EmptyState
          title="Nenhuma inscrição ainda"
          description="Ninguém se cadastrou por este link ainda."
          icon={Users}
        />
      ) : (
        <GridTable
          data={uses}
          keyExtractor={u => u.id}
          columns={cols}
          renderMobileItem={u => (
            <div>
              <p className="text-sm font-bold text-zinc-900">{u.user_name}</p>
              <p className="text-xs text-zinc-400">{u.user_email}</p>
            </div>
          )}
        />
      )}
    </Modal>
  );
}

// ── Modal: Convidar por E-mail ────────────────────────────────────────────────

const EMAIL_INVITE_STATUS_LABEL: Record<string, { label: string; color: 'success' | 'warning' | 'danger' | 'default' }> = {
  pending: { label: 'Aguardando', color: 'warning' },
  used:    { label: 'Aceito', color: 'success' },
  expired: { label: 'Expirado', color: 'default' },
  revoked: { label: 'Revogado', color: 'danger' },
};

interface ConvidarPorEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

function ConvidarPorEmailModal({ isOpen, onClose, onSent }: ConvidarPorEmailModalProps) {
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({ invitedName: '', invitedEmail: '', role: 'member', validity: '7' });

  const handleEnviar = async () => {
    if (!form.invitedName.trim() || !form.invitedEmail.trim()) {
      toast.error('Preencha o nome e o e-mail da pessoa convidada.');
      return;
    }
    setEnviando(true);
    try {
      await emailInvitesApi.create({
        invitedName: form.invitedName.trim(),
        invitedEmail: form.invitedEmail.trim(),
        role: form.role,
        validityDays: parseInt(form.validity),
      });
      toast.success('Convite enviado por e-mail! 💌');
      setForm({ invitedName: '', invitedEmail: '', role: 'member', validity: '7' });
      onSent();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar convite.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convidar por E-mail"
      size="md"
      footer={
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button loading={enviando} onClick={handleEnviar} iconLeft={<Send size={14} />}>
            Enviar Convite
          </Button>
        </ModalFooter>
      }
    >
      <div className="space-y-4">
        <ContentCard padding="sm">
          <div className="flex items-start gap-2 text-xs text-brand-clay">
            <HandHeart size={13} className="shrink-0 mt-0.5" />
            <span>Enviaremos um e-mail carinhoso e personalizado para essa pessoa, com um link exclusivo para ela se cadastrar.</span>
          </div>
        </ContentCard>

        <Input
          label="Nome da pessoa convidada"
          placeholder="Ex: Maria Silva"
          value={form.invitedName}
          onChange={e => setForm(f => ({ ...f, invitedName: e.target.value }))}
        />
        <Input
          label="E-mail da pessoa convidada"
          type="email"
          placeholder="maria@exemplo.com"
          value={form.invitedEmail}
          onChange={e => setForm(f => ({ ...f, invitedEmail: e.target.value }))}
        />

        <FormRow cols={2}>
          <Select
            label="Validade do convite"
            options={VALIDITY_OPTIONS}
            value={form.validity}
            onChange={e => setForm(f => ({ ...f, validity: e.target.value }))}
          />
          <Select
            label="Nível de acesso"
            options={ACCESS_OPTIONS}
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          />
        </FormRow>
      </div>
    </Modal>
  );
}

// ── View Principal ────────────────────────────────────────────────────────────

export default function InviteLinksView() {
  const toast = useToast();
  const [tab, setTab] = useState<'links' | 'email'>('links');
  const [links, setLinks] = useState<InviteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // modal gerar link
  const [modalGerar, setModalGerar] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [formGerar, setFormGerar] = useState({ label: '', validity: '7', role: 'member', maxUses: '' });

  // modal ver inscrições
  const [linkInscricoes, setLinkInscricoes] = useState<InviteLink | null>(null);

  // modal confirmar delete/desativar
  const [confirmarDeletar, setConfirmarDeletar] = useState<string | null>(null);
  const [deletando, setDeletando] = useState(false);

  // convites por e-mail
  const [emailInvites, setEmailInvites] = useState<EmailInvite[]>([]);
  const [loadingEmailInvites, setLoadingEmailInvites] = useState(true);
  const [modalConvidarEmail, setModalConvidarEmail] = useState(false);
  const [confirmarRevogar, setConfirmarRevogar] = useState<string | null>(null);

  const loadEmailInvites = () => {
    setLoadingEmailInvites(true);
    emailInvitesApi.list()
      .then(setEmailInvites)
      .catch(() => toast.error('Erro ao carregar convites por e-mail.'))
      .finally(() => setLoadingEmailInvites(false));
  };

  useEffect(() => { loadEmailInvites(); }, []);

  const handleReenviar = async (id: string) => {
    try {
      await emailInvitesApi.resend(id);
      toast.success('Convite reenviado!');
      loadEmailInvites();
    } catch {
      toast.error('Erro ao reenviar convite.');
    }
  };

  const handleRevogar = async () => {
    if (!confirmarRevogar) return;
    try {
      await emailInvitesApi.revoke(confirmarRevogar);
      toast.success('Convite revogado.');
      setConfirmarRevogar(null);
      loadEmailInvites();
    } catch {
      toast.error('Erro ao revogar convite.');
    }
  };

  const load = () => {
    setLoading(true);
    inviteLinksApi.list()
      .then(setLinks)
      .catch(() => toast.error('Erro ao carregar links.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtrados = useMemo(() => {
    const now = new Date();
    return links.filter(l => {
      const match = !busca || l.label.toLowerCase().includes(busca.toLowerCase());
      if (!match) return false;
      if (filtroStatus === 'ativos') {
        return l.is_active && new Date(l.expires_at) >= now;
      }
      if (filtroStatus === 'expirados') {
        return !l.is_active || new Date(l.expires_at) < now;
      }
      return true;
    });
  }, [links, busca, filtroStatus]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: links.length,
      ativos: links.filter(l => l.is_active && new Date(l.expires_at) >= now).length,
      usos: links.reduce((acc, l) => acc + l.uses_count, 0),
    };
  }, [links]);

  const handleGerar = async () => {
    setGerando(true);
    try {
      await inviteLinksApi.create({
        label: formGerar.label || 'Link de convite',
        validityDays: parseInt(formGerar.validity),
        role: formGerar.role,
        maxUses: formGerar.maxUses ? parseInt(formGerar.maxUses) : null,
      });
      toast.success('Link gerado com sucesso!');
      setModalGerar(false);
      setFormGerar({ label: '', validity: '7', role: 'member', maxUses: '' });
      load();
    } catch {
      toast.error('Erro ao gerar link.');
    } finally {
      setGerando(false);
    }
  };

  const handleReativar = async (id: string) => {
    try {
      await inviteLinksApi.reactivate(id);
      toast.success('Link reativado!');
      load();
    } catch {
      toast.error('Erro ao reativar.');
    }
  };

  const handleDeletar = async () => {
    if (!confirmarDeletar) return;
    setDeletando(true);
    try {
      await inviteLinksApi.delete(confirmarDeletar);
      toast.success('Link removido.');
      setConfirmarDeletar(null);
      load();
    } catch {
      toast.error('Erro ao remover link.');
    } finally {
      setDeletando(false);
    }
  };

  const colunas: Column<InviteLink>[] = [
    {
      header: 'Label / Identificação',
      render: row => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-zinc-900">{row.label}</span>
          <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[180px]">{buildLink(row.token)}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: row => statusBadge(row),
      hideOnMobile: false,
    },
    {
      header: 'Acesso',
      render: row => (
        <Badge color={ROLE_COLORS[row.role] ?? 'default'}>
          {ROLE_LABELS[row.role] ?? row.role}
        </Badge>
      ),
      hideOnMobile: true,
    },
    {
      header: 'Inscrições',
      render: row => (
        <span className="text-sm font-bold text-zinc-800">
          {row.uses_count}{row.max_uses !== null ? `/${row.max_uses}` : ''}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      header: 'Expira em',
      render: row => (
        <span className="text-xs text-zinc-500">
          {new Date(row.expires_at).toLocaleDateString('pt-BR')}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      header: '',
      render: row => {
        const expired = new Date(row.expires_at) < new Date();
        const isInactive = !row.is_active || expired;
        return (
          <div className="flex items-center gap-1.5 justify-end">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => setLinkInscricoes(row)}
              title="Ver inscrições"
            >
              <Eye size={14} />
            </IconButton>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(buildLink(row.token), toast)}
              title="Copiar link"
            >
              <Copy size={14} />
            </IconButton>
            {isInactive && (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => handleReativar(row.id)}
                title="Reativar"
              >
                <RotateCcw size={14} />
              </IconButton>
            )}
            <IconButton
              variant="danger"
              size="sm"
              onClick={() => setConfirmarDeletar(row.id)}
              title="Deletar"
            >
              <Trash2 size={14} />
            </IconButton>
          </div>
        );
      },
      className: 'text-right',
    },
  ];

  const emailStats = useMemo(() => ({
    total: emailInvites.length,
    pendentes: emailInvites.filter(i => i.status === 'pending').length,
    aceitos: emailInvites.filter(i => i.status === 'used').length,
  }), [emailInvites]);

  return (
    <PageWrapper>
      <SectionTitle
        title="Convites"
        description="Convide novos membros por link compartilhável ou por e-mail personalizado"
        icon={Link2}
        action={
          tab === 'links' ? (
            <Button iconLeft={<Plus size={14} />} onClick={() => setModalGerar(true)}>
              Gerar Novo Link
            </Button>
          ) : (
            <Button iconLeft={<Mail size={14} />} onClick={() => setModalConvidarEmail(true)}>
              Convidar por E-mail
            </Button>
          )
        }
        divider
      />

      {/* Abas */}
      <div className="flex gap-1 bg-white border border-zinc-200 rounded-xl p-1 w-fit mb-5">
        {[
          { key: 'links' as const, label: 'Links Genéricos', icon: Link2 },
          { key: 'email' as const, label: 'Convite por E-mail', icon: Mail },
        ].map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                active ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Icon size={13} />{t.label}
            </button>
          );
        })}
      </div>

      {tab === 'email' ? (
        <>
          {/* Stats */}
          <StatGrid cols={3} className="mb-5">
            <StatCard title="Total de convites" value={emailStats.total} icon={Mail} delay={0} />
            <StatCard title="Aguardando resposta" value={emailStats.pendentes} icon={Clock} color="warning" delay={0.05} />
            <StatCard title="Convites aceitos" value={emailStats.aceitos} icon={CheckCircle2} color="success" delay={0.1} />
          </StatGrid>

          {loadingEmailInvites ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400 text-sm">
              <RefreshCw size={14} className="animate-spin" />Carregando...
            </div>
          ) : emailInvites.length === 0 ? (
            <EmptyState
              title="Nenhum convite enviado ainda"
              description="Convide uma pessoa específica por e-mail — ela receberá um convite personalizado com um link exclusivo."
              icon={Mail}
              action={<Button size="sm" iconLeft={<Mail size={13} />} onClick={() => setModalConvidarEmail(true)}>Convidar por E-mail</Button>}
            />
          ) : (
            <GridTable
              data={emailInvites}
              keyExtractor={i => i.id}
              columns={[
                {
                  header: 'Convidado(a)',
                  render: row => (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-zinc-900">{row.invited_name}</span>
                      <span className="text-xs text-zinc-400">{row.invited_email}</span>
                    </div>
                  ),
                },
                {
                  header: 'Status',
                  render: row => {
                    const s = EMAIL_INVITE_STATUS_LABEL[row.status] ?? { label: row.status, color: 'default' as const };
                    return <Badge color={s.color} dot>{s.label}</Badge>;
                  },
                },
                {
                  header: 'Acesso',
                  render: row => <Badge color={ROLE_COLORS[row.role] ?? 'default'}>{ROLE_LABELS[row.role] ?? row.role}</Badge>,
                  hideOnMobile: true,
                },
                {
                  header: 'Expira em',
                  render: row => <span className="text-xs text-zinc-500">{new Date(row.expires_at).toLocaleDateString('pt-BR')}</span>,
                  hideOnMobile: true,
                },
                {
                  header: '',
                  render: row => (
                    <div className="flex items-center gap-1.5 justify-end">
                      {row.status === 'pending' && (
                        <>
                          <IconButton variant="ghost" size="sm" onClick={() => handleReenviar(row.id)} title="Reenviar convite">
                            <Send size={14} />
                          </IconButton>
                          <IconButton variant="danger" size="sm" onClick={() => setConfirmarRevogar(row.id)} title="Revogar convite">
                            <Ban size={14} />
                          </IconButton>
                        </>
                      )}
                    </div>
                  ),
                  className: 'text-right',
                },
              ]}
              renderMobileItem={i => (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{i.invited_name}</p>
                    <p className="text-xs text-zinc-400 truncate">{i.invited_email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge color={EMAIL_INVITE_STATUS_LABEL[i.status]?.color ?? 'default'} size="sm" dot>
                        {EMAIL_INVITE_STATUS_LABEL[i.status]?.label ?? i.status}
                      </Badge>
                      <Badge color={ROLE_COLORS[i.role] ?? 'default'} size="sm">{ROLE_LABELS[i.role] ?? i.role}</Badge>
                    </div>
                  </div>
                  {i.status === 'pending' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <IconButton variant="ghost" size="sm" onClick={() => handleReenviar(i.id)}><Send size={13} /></IconButton>
                      <IconButton variant="danger" size="sm" onClick={() => setConfirmarRevogar(i.id)}><Ban size={13} /></IconButton>
                    </div>
                  )}
                </div>
              )}
            />
          )}

          <ConvidarPorEmailModal
            isOpen={modalConvidarEmail}
            onClose={() => setModalConvidarEmail(false)}
            onSent={loadEmailInvites}
          />

          <ConfirmModal
            isOpen={!!confirmarRevogar}
            onClose={() => setConfirmarRevogar(null)}
            onConfirm={handleRevogar}
            title="Revogar convite"
            message="A pessoa convidada não poderá mais usar este link para se cadastrar."
            variant="danger"
            confirmLabel="Revogar"
          />
        </>
      ) : (
      <>
      {/* Stats */}
      <StatGrid cols={3} className="mb-5">
        <StatCard title="Total de links" value={stats.total} icon={Link2} delay={0} />
        <StatCard title="Links ativos" value={stats.ativos} icon={CheckCircle2} color="success" delay={0.05} />
        <StatCard title="Total de inscrições" value={stats.usos} icon={Users} color="info" delay={0.1} />
      </StatGrid>

      {/* Filtros */}
      <FilterLine className="mb-4">
        <FilterLineSection grow>
          <FilterLineItem grow>
            <FilterLineSearch value={busca} onChange={setBusca} placeholder="Buscar por nome do link..." />
          </FilterLineItem>
        </FilterLineSection>
        <FilterLineSection align="right">
          <FilterLineSegmented
            value={filtroStatus}
            onChange={setFiltroStatus}
            options={[
              { value: 'todos',    label: 'Todos' },
              { value: 'ativos',   label: 'Ativos' },
              { value: 'expirados', label: 'Expirados' },
            ]}
          />
        </FilterLineSection>
      </FilterLine>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-400 text-sm">
          <RefreshCw size={14} className="animate-spin" />Carregando...
        </div>
      ) : filtrados.length === 0 ? (
        <EmptyState
          title="Nenhum link encontrado"
          description="Gere um novo link de convite para começar a convidar membros."
          icon={Link2}
          action={<Button size="sm" iconLeft={<Plus size={13} />} onClick={() => setModalGerar(true)}>Gerar Link</Button>}
        />
      ) : (
        <GridTable
          data={filtrados}
          keyExtractor={l => l.id}
          columns={colunas}
          renderMobileItem={l => {
            const expired = new Date(l.expires_at) < new Date();
            const isInactive = !l.is_active || expired;
            return (
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-900 truncate">{l.label}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {statusBadge(l)}
                    <Badge color={ROLE_COLORS[l.role] ?? 'default'} size="sm">
                      {ROLE_LABELS[l.role] ?? l.role}
                    </Badge>
                    <span className="text-xs text-zinc-500">
                      {l.uses_count}{l.max_uses !== null ? `/${l.max_uses}` : ''} inscrições
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <IconButton variant="ghost" size="sm" onClick={() => setLinkInscricoes(l)}>
                    <Eye size={13} />
                  </IconButton>
                  <IconButton variant="ghost" size="sm" onClick={() => copyToClipboard(buildLink(l.token), toast)}>
                    <Copy size={13} />
                  </IconButton>
                  {isInactive && (
                    <IconButton variant="ghost" size="sm" onClick={() => handleReativar(l.id)}>
                      <RotateCcw size={13} />
                    </IconButton>
                  )}
                  <IconButton variant="danger" size="sm" onClick={() => setConfirmarDeletar(l.id)}>
                    <Trash2 size={13} />
                  </IconButton>
                </div>
              </div>
            );
          }}
        />
      )}

      {/* Modal: Gerar Link */}
      <Modal
        isOpen={modalGerar}
        onClose={() => setModalGerar(false)}
        title="Gerar Link de Convite"
        size="md"
        footer={
          <ModalFooter>
            <Button variant="outline" onClick={() => setModalGerar(false)}>Cancelar</Button>
            <Button loading={gerando} onClick={handleGerar} iconLeft={<Link2 size={14} />}>
              Gerar Link
            </Button>
          </ModalFooter>
        }
      >
        <div className="space-y-4">
          <ContentCard padding="sm">
            <div className="flex items-start gap-2 text-xs text-amber-700">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>O link gerado permite que qualquer pessoa com ele se cadastre automaticamente na plataforma com o nível de acesso definido.</span>
            </div>
          </ContentCard>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Identificação do link <span className="text-zinc-400 font-normal">(opcional)</span></label>
            <input
              type="text"
              placeholder="Ex: Turma Julho 2025, Evento tal..."
              value={formGerar.label}
              onChange={e => setFormGerar(f => ({ ...f, label: e.target.value }))}
              className="w-full text-sm border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition"
            />
          </div>

          <FormRow cols={2}>
            <Select
              label="Validade do link"
              options={VALIDITY_OPTIONS}
              value={formGerar.validity}
              onChange={e => setFormGerar(f => ({ ...f, validity: e.target.value }))}
            />
            <Input
              label="Limite de inscrições"
              type="number"
              min="1"
              placeholder="Ilimitado"
              value={formGerar.maxUses}
              onChange={e => setFormGerar(f => ({ ...f, maxUses: e.target.value }))}
              hint="Deixe vazio para ilimitado"
            />
          </FormRow>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5 flex items-center gap-1">
              <Shield size={12} />Nível de acesso concedido
            </label>
            <div className="space-y-2">
              {ACCESS_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    formGerar.role === opt.value
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={formGerar.role === opt.value}
                    onChange={() => setFormGerar(f => ({ ...f, role: opt.value }))}
                    className="mt-0.5 accent-amber-500"
                  />
                  <span className="text-sm text-zinc-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal: Ver Inscrições */}
      <VerInscricoesModal link={linkInscricoes} onClose={() => setLinkInscricoes(null)} />

      {/* Confirmação Deletar */}
      <ConfirmModal
        isOpen={!!confirmarDeletar}
        onClose={() => setConfirmarDeletar(null)}
        onConfirm={handleDeletar}
        title="Remover link"
        message="O link será removido permanentemente e não poderá mais ser usado para inscrições."
        variant="danger"
        confirmLabel="Remover"
        loading={deletando}
      />
      </>
      )}
    </PageWrapper>
  );
}
