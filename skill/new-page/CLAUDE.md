# Skill: new-page — Criar e Atualizar Páginas

Guia completo para criar, atualizar e estruturar páginas neste projeto.  
**Regra absoluta:** toda página é responsiva — funciona como app no celular, tablet e desktop.

---

## 1. Estrutura do Projeto

Cada "página" é um componente View em `src/components/`.  
O roteamento é feito via `currentTab` no [App.tsx](../../src/App.tsx) — não usa React Router.

```
src/
  App.tsx                  ← registra a view no switch de abas
  components/
    Sidebar.tsx            ← registra a aba no menu lateral
    NomeDaPaginaView.tsx   ← arquivo da página
```

---

## 2. Como Criar uma Página Nova

### Passo 1 — Criar o arquivo da View

`src/components/NomeDaPaginaView.tsx`

```tsx
import React, { useState } from 'react';
import { PageWrapper, SectionTitle } from '@/src/components/ui';
import { IconeAqui } from 'lucide-react';

interface NomeDaPaginaViewProps {
  // props que recebe do App.tsx
}

export default function NomeDaPaginaView({ }: NomeDaPaginaViewProps) {
  return (
    <PageWrapper>
      <SectionTitle
        title="Nome da Página"
        description="Descrição curta do que é esta seção"
        icon={IconeAqui}
        action={/* botão principal se houver */}
        divider
      />

      {/* conteúdo */}
    </PageWrapper>
  );
}
```

### Passo 2 — Registrar no App.tsx

```tsx
// 1. Import no topo
import NomeDaPaginaView from './components/NomeDaPaginaView';

// 2. Dentro de <main>, adicionar o bloco condicional:
{currentTab === 'nome-da-pagina' && (
  <NomeDaPaginaView
    propA={valorA}
    propB={valorB}
  />
)}
```

### Passo 3 — Registrar na Sidebar

```tsx
// Em src/components/Sidebar.tsx, adicionar ao array correto:
{ id: 'nome-da-pagina', label: 'Nome da Página', icon: IconeAqui }

// Se for restrito a admins, adicionar minRole:
{ id: 'nome-da-pagina', label: 'Nome da Página', icon: IconeAqui, minRole: 'professional' }
```

---

## 3. Template: Página de Lista (mais comum)

Padrão: filtros → tabela/cards → modal de cadastro/edição.

```tsx
import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  PageWrapper, SectionTitle,
  Button, Modal, ModalFooter, ConfirmModal,
  GridTable, Column,
  FilterLine, FilterLineSection, FilterLineItem, FilterLineSearch,
  EmptyState, Badge, StatusBadge,
  Input, Select, FormRow,
  useToast,
} from '@/src/components/ui';

interface Item {
  id: string;
  nome: string;
  status: 'active' | 'inactive';
}

interface Props {
  items: Item[];
  onAdd: (nome: string) => void;
  onDelete: (id: string) => void;
}

export default function ExemploListaView({ items, onAdd, onDelete }: Props) {
  const toast = useToast();
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Filtro client-side
  const filtrados = useMemo(() =>
    items.filter(i => i.nome.toLowerCase().includes(busca.toLowerCase())),
    [items, busca]
  );

  const handleSalvar = async () => {
    if (!nome.trim()) return;
    setSalvando(true);
    await onAdd(nome);
    setSalvando(false);
    setModalAberto(false);
    setNome('');
    toast.success('Item cadastrado com sucesso!');
  };

  const colunas: Column<Item>[] = [
    { header: 'Nome', accessor: 'nome', sortKey: 'nome' },
    { header: 'Status', render: row => <Badge color={row.status === 'active' ? 'success' : 'default'}>{row.status}</Badge> },
    {
      header: '',
      render: row => (
        <Button variant="danger" size="xs" onClick={() => setConfirmarExclusao(row.id)}>
          Excluir
        </Button>
      ),
      className: 'text-right',
    },
  ];

  return (
    <PageWrapper>
      <SectionTitle
        title="Itens"
        description="Gerencie os itens cadastrados"
        icon={Search}
        action={
          <Button iconLeft={<Plus size={14} />} onClick={() => setModalAberto(true)}>
            Novo Item
          </Button>
        }
        divider
      />

      {/* Filtros */}
      <FilterLine className="mb-4">
        <FilterLineSection grow>
          <FilterLineItem grow>
            <FilterLineSearch value={busca} onChange={setBusca} placeholder="Buscar por nome..." />
          </FilterLineItem>
        </FilterLineSection>
      </FilterLine>

      {/* Tabela */}
      {filtrados.length === 0 ? (
        <EmptyState
          title="Nenhum item encontrado"
          description="Cadastre o primeiro item ou ajuste os filtros."
          icon={Search}
          action={
            <Button size="sm" onClick={() => setModalAberto(true)}>Cadastrar</Button>
          }
        />
      ) : (
        <GridTable
          data={filtrados}
          columns={colunas}
          keyExtractor={i => i.id}
        />
      )}

      {/* Modal de cadastro */}
      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Novo Item"
        size="sm"
        footer={
          <ModalFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button loading={salvando} onClick={handleSalvar}>Salvar</Button>
          </ModalFooter>
        }
      >
        <Input
          label="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder="Digite o nome..."
        />
      </Modal>

      {/* Confirmação de exclusão */}
      <ConfirmModal
        isOpen={!!confirmarExclusao}
        onClose={() => setConfirmarExclusao(null)}
        onConfirm={() => { onDelete(confirmarExclusao!); setConfirmarExclusao(null); }}
        title="Excluir item"
        message="Esta ação não pode ser desfeita."
        variant="danger"
      />
    </PageWrapper>
  );
}
```

---

## 4. Template: Página com Abas (tabs)

Use quando a página tem seções claramente separadas (ex: Detalhes / Histórico / Configurações).

### Padrão de Abas — implementação interna na View

```tsx
import React, { useState } from 'react';
import { PageWrapper, SectionTitle, ContentCard } from '@/src/components/ui';
import { User, History, Settings } from 'lucide-react';

type Tab = 'detalhes' | 'historico' | 'configuracoes';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'detalhes',       label: 'Detalhes',      icon: User },
  { id: 'historico',      label: 'Histórico',     icon: History },
  { id: 'configuracoes',  label: 'Configurações', icon: Settings },
];

export default function ExemploAbasView() {
  const [tab, setTab] = useState<Tab>('detalhes');

  return (
    <PageWrapper>
      <SectionTitle title="Perfil" icon={User} divider />

      {/* Navegação de abas — responsiva */}
      <div className="mb-5">
        {/* Mobile: scroll horizontal de chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {TABS.map(t => {
            const Icon = t.icon;
            const ativa = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all shrink-0',
                  ativa
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                    : 'bg-white border border-zinc-200 text-zinc-500 hover:border-amber-300 hover:text-amber-600',
                ].join(' ')}
              >
                <Icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Desktop: linha indicadora opcional */}
        <div className="hidden sm:block mt-1 h-px bg-zinc-100" />
      </div>

      {/* Conteúdo da aba ativa */}
      {tab === 'detalhes' && <AbaDetalhes />}
      {tab === 'historico' && <AbaHistorico />}
      {tab === 'configuracoes' && <AbaConfiguracoes />}
    </PageWrapper>
  );
}

// Cada aba é um componente separado no mesmo arquivo (se pequeno)
// ou em arquivos separados se grande.

function AbaDetalhes() {
  return (
    <ContentCard>
      <p className="text-sm text-zinc-600">Conteúdo de detalhes aqui.</p>
    </ContentCard>
  );
}

function AbaHistorico() {
  return (
    <ContentCard>
      <p className="text-sm text-zinc-600">Histórico de ações aqui.</p>
    </ContentCard>
  );
}

function AbaConfiguracoes() {
  return (
    <ContentCard>
      <p className="text-sm text-zinc-600">Configurações aqui.</p>
    </ContentCard>
  );
}
```

### Variante: Abas com badge de contagem

```tsx
const TABS = [
  { id: 'pendentes', label: 'Pendentes', count: pendentes.length },
  { id: 'aprovados', label: 'Aprovados', count: aprovados.length },
];

// No botão da aba:
<button ...>
  {t.label}
  {t.count > 0 && (
    <span className={[
      'inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black',
      ativa ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-700',
    ].join(' ')}>
      {t.count}
    </span>
  )}
</button>
```

---

## 5. Template: Página de Detalhes / Perfil

Use quando exibe dados de um único item com campos, seções e ações.

```tsx
export default function ExemploDetalheView({ item, onSalvar }: Props) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ ...item });

  return (
    <PageWrapper>
      {/* Header com breadcrumb e ações */}
      <div className="flex items-center justify-between mb-6">
        <SectionTitle title={item.nome} description={item.categoria} icon={User} />
        <div className="flex gap-2">
          {editando ? (
            <>
              <Button variant="outline" onClick={() => setEditando(false)}>Cancelar</Button>
              <Button onClick={() => { onSalvar(form); setEditando(false); }}>Salvar</Button>
            </>
          ) : (
            <Button variant="outline" iconLeft={<Pencil size={14} />} onClick={() => setEditando(true)}>
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Seções com PanelCard */}
      <div className="space-y-4">
        <PanelCard title="Informações Básicas" icon={Info}>
          {editando ? (
            <FormRow cols={2}>
              <Input label="Nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              <Input label="E-mail" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </FormRow>
          ) : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Nome" valor={item.nome} />
              <Campo label="E-mail" valor={item.email} />
            </dl>
          )}
        </PanelCard>

        <PanelCard title="Estatísticas" icon={BarChart2}>
          <StatGrid cols={3}>
            <StatCard title="Total" value={42} icon={Hash} />
            <StatCard title="Ativos" value={38} icon={CheckCircle} color="success" />
            <StatCard title="Pendentes" value={4} icon={Clock} color="warning" />
          </StatGrid>
        </PanelCard>
      </div>
    </PageWrapper>
  );
}

// Helper para exibir campo no modo leitura
function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">{label}</dt>
      <dd className="text-sm font-semibold text-zinc-800">{valor || '—'}</dd>
    </div>
  );
}
```

---

## 6. Responsividade — Regras Obrigatórias

### Mobile (< 640px) — cara de app
- Padding via `PageWrapper` (já cuida disso)
- Listas → `GridTable` com cards mobile automáticos ou `renderMobileItem` customizado
- Botões de ação → `fullWidth` ou empilhados
- Modais → bottom-sheet automático via `Modal`
- Formulários → `FormRow cols={1}` no mobile (padrão), usa `md:grid-cols-2` para tablet
- Abas → `overflow-x-auto` com `whitespace-nowrap` para scroll horizontal

### Tablet (640px–1024px)
- `FormRow cols={2}` já funciona a partir de `md:`
- `StatGrid cols={4}` mostra 2 colunas em `sm:`, 4 em `xl:`
- Sidebar recolhida / menu bottom-nav

### Desktop (> 1024px)
- `GridTable` mostra tabela completa (cards só no mobile)
- Sidebar expandida
- `PageWrapper` adiciona padding lateral maior

### Classes responsivas padrão usadas no projeto
```
mobile-first → sm: → md: → lg: → xl:
px-2 sm:px-4 lg:px-6 xl:px-8   ← padding horizontal (PageWrapper)
grid-cols-1 sm:grid-cols-2 xl:grid-cols-4  ← grids
text-base sm:text-xl lg:text-2xl            ← títulos
p-4 sm:p-5 lg:p-6                          ← padding de cards
```

---

## 7. Regras de Uso de Componentes

### Sempre usar os componentes do design system — nunca criar do zero quando existe equivalente

| Precisa de | Usar |
|-----------|------|
| Botão | `Button` ou `IconButton` |
| Campo de texto | `Input` ou `Textarea` |
| Select | `Select` ou `Combobox` |
| Data | `DatePicker` |
| Toggle | `Switch` |
| Tabela/lista | `GridTable` |
| Card de stats | `StatCard` dentro de `StatGrid` |
| Card de seção | `PanelCard` ou `ContentCard` |
| Lista vazia | `EmptyState` |
| Status/tag | `Badge`, `StatusBadge` ou `PaymentBadge` |
| Notificação | `useToast()` |
| Confirmação | `ConfirmModal` |
| Modal | `Modal` + `ModalFooter` |
| Wrapper de página | `PageWrapper` |
| Cabeçalho da página | `SectionTitle` |
| Filtros | `FilterLine` + subcomponentes |
| Paginação | `Pagination` ou `usePagination` |
| Grid de form | `FormRow` |
| Separador | `Divider` |

### Se o componente necessário não existir
1. Criar em `src/components/ui/NomeComponente.tsx`
2. Exportar em `src/components/ui/index.ts`
3. Atualizar `skill/use-component/use-component.md` com documentação

---

## 8. Padrões de Estado e Dados

### Estado local da página (UI state)
```tsx
// Modais
const [modalAberto, setModalAberto] = useState(false);
const [itemEditando, setItemEditando] = useState<Item | null>(null);
const [confirmarExclusao, setConfirmarExclusao] = useState<string | null>(null);

// Loading
const [salvando, setSalvando] = useState(false);
const [carregando, setCarregando] = useState(false);

// Filtros
const [busca, setBusca] = useState('');
const [filtroStatus, setFiltroStatus] = useState('');

// Abas
const [tab, setTab] = useState<TabType>('principal');
```

### Filtros client-side com useMemo
```tsx
const itensFiltrados = useMemo(() => {
  return items
    .filter(i => !busca || i.nome.toLowerCase().includes(busca.toLowerCase()))
    .filter(i => !filtroStatus || i.status === filtroStatus);
}, [items, busca, filtroStatus]);
```

### Feedback de ações — sempre usar toast
```tsx
const toast = useToast();

const handleSalvar = async () => {
  setSalvando(true);
  try {
    await onSalvar(dados);
    toast.success('Salvo com sucesso!');
    setModalAberto(false);
  } catch {
    toast.error('Erro ao salvar. Tente novamente.');
  } finally {
    setSalvando(false);
  }
};
```

---

## 9. Como Atualizar uma Página Existente

1. **Ler o arquivo** da view em `src/components/`
2. **Identificar o padrão** já usado (lista? abas? detalhes?)
3. **Aplicar a mudança** mantendo a estrutura existente
4. **Verificar responsividade** — qualquer novo elemento precisa funcionar no mobile
5. **Usar componentes do DS** — nunca criar um `<button>` puro quando existe `Button`

### Checklist ao atualizar
- [ ] Novos campos/botões são responsivos?
- [ ] Loading state em ações assíncronas?
- [ ] Toast de feedback nas ações?
- [ ] Modal ou ConfirmModal para ações destrutivas?
- [ ] EmptyState quando lista está vazia?

---

## 10. Exemplo Completo — Página de Abas com Lista

Página com 3 abas: lista filtrada, formulário de cadastro e configurações.

```tsx
import React, { useState, useMemo } from 'react';
import { Plus, Package, List, Settings, Search } from 'lucide-react';
import {
  PageWrapper, SectionTitle, ContentCard, PanelCard,
  Button, Modal, ModalFooter, ConfirmModal,
  Input, Select, FormRow, Switch, Divider,
  GridTable, Column, EmptyState,
  FilterLine, FilterLineSection, FilterLineItem,
  FilterLineSearch, FilterLineSegmented,
  Badge, StatCard, StatGrid,
  useToast,
} from '@/src/components/ui';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  ativo: boolean;
}

interface Props {
  produtos: Produto[];
  onAdd: (p: Omit<Produto, 'id'>) => void;
  onUpdate: (p: Produto) => void;
  onDelete: (id: string) => void;
}

type Tab = 'lista' | 'cadastro' | 'config';

// ─── View ─────────────────────────────────────────────────────────────────────

export default function ProdutosView({ produtos, onAdd, onUpdate, onDelete }: Props) {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('lista');
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [editando, setEditando] = useState<Produto | null>(null);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // ── Filtros ──────────────────────────────────────────────────────────────
  const filtrados = useMemo(() => produtos
    .filter(p => !busca || p.nome.toLowerCase().includes(busca.toLowerCase()))
    .filter(p => {
      if (filtroAtivo === 'ativos') return p.ativo;
      if (filtroAtivo === 'inativos') return !p.ativo;
      return true;
    }),
    [produtos, busca, filtroAtivo]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSalvar = async (dados: Omit<Produto, 'id'>) => {
    setSalvando(true);
    try {
      if (editando) {
        await onUpdate({ ...editando, ...dados });
        toast.success('Produto atualizado!');
      } else {
        await onAdd(dados);
        toast.success('Produto cadastrado!');
      }
      setEditando(null);
      setTab('lista');
    } catch {
      toast.error('Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    if (!excluindo) return;
    await onDelete(excluindo);
    setExcluindo(null);
    toast.success('Produto excluído.');
  };

  // ── Colunas da tabela ────────────────────────────────────────────────────
  const colunas: Column<Produto>[] = [
    { header: 'Nome', accessor: 'nome', sortKey: 'nome' },
    { header: 'Categoria', accessor: 'categoria', hideOnMobile: true },
    {
      header: 'Preço',
      render: p => `R$ ${p.preco.toFixed(2)}`,
      sortKey: 'preco',
    },
    {
      header: 'Status',
      render: p => (
        <Badge color={p.ativo ? 'success' : 'default'} dot>
          {p.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      header: '',
      render: p => (
        <div className="flex gap-1.5 justify-end">
          <Button
            variant="outline"
            size="xs"
            onClick={() => { setEditando(p); }}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="xs"
            onClick={() => setExcluindo(p.id)}
          >
            Excluir
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  // ── Abas ─────────────────────────────────────────────────────────────────
  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'lista',    label: 'Produtos',    icon: List },
    { id: 'cadastro', label: 'Cadastrar',   icon: Plus },
    { id: 'config',   label: 'Configurar',  icon: Settings },
  ];

  return (
    <PageWrapper>
      {/* Cabeçalho */}
      <SectionTitle
        title="Produtos"
        description="Gerencie o catálogo de produtos"
        icon={Package}
        action={
          tab !== 'cadastro' && (
            <Button iconLeft={<Plus size={14} />} onClick={() => setTab('cadastro')}>
              Novo Produto
            </Button>
          )
        }
        divider
      />

      {/* Stats rápidas */}
      <StatGrid cols={3} className="mb-5">
        <StatCard title="Total" value={produtos.length} icon={Package} delay={0} />
        <StatCard title="Ativos" value={produtos.filter(p => p.ativo).length} icon={Package} color="success" delay={0.05} />
        <StatCard title="Inativos" value={produtos.filter(p => !p.ativo).length} icon={Package} color="warning" delay={0.1} />
      </StatGrid>

      {/* Navegação de abas */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 no-scrollbar">
        {TABS.map(t => {
          const Icon = t.icon;
          const ativa = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all shrink-0',
                ativa
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                  : 'bg-white border border-zinc-200 text-zinc-500 hover:border-amber-300 hover:text-amber-600',
              ].join(' ')}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Aba: Lista ── */}
      {tab === 'lista' && (
        <div className="space-y-4">
          <FilterLine>
            <FilterLineSection grow>
              <FilterLineItem grow>
                <FilterLineSearch value={busca} onChange={setBusca} placeholder="Buscar produto..." />
              </FilterLineItem>
            </FilterLineSection>
            <FilterLineSection align="right">
              <FilterLineSegmented
                value={filtroAtivo}
                onChange={v => setFiltroAtivo(v as typeof filtroAtivo)}
                options={[
                  { value: 'todos',   label: 'Todos' },
                  { value: 'ativos',  label: 'Ativos' },
                  { value: 'inativos', label: 'Inativos' },
                ]}
                size="sm"
              />
            </FilterLineSection>
          </FilterLine>

          {filtrados.length === 0 ? (
            <EmptyState
              title="Nenhum produto encontrado"
              description={busca ? 'Tente outro termo de busca.' : 'Cadastre o primeiro produto.'}
              icon={Package}
              action={!busca && (
                <Button size="sm" onClick={() => setTab('cadastro')}>Cadastrar Produto</Button>
              )}
            />
          ) : (
            <GridTable
              data={filtrados}
              columns={colunas}
              keyExtractor={p => p.id}
              onRowClick={p => setEditando(p)}
              renderMobileItem={p => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{p.nome}</p>
                    <p className="text-xs text-zinc-400">{p.categoria}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-black text-zinc-800">R$ {p.preco.toFixed(2)}</span>
                    <Badge color={p.ativo ? 'success' : 'default'} dot size="sm">
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      )}

      {/* ── Aba: Cadastrar / Editar (mesma aba, contexto diferente) ── */}
      {(tab === 'cadastro' || editando) && (
        <FormProduto
          inicial={editando}
          salvando={salvando}
          onSalvar={handleSalvar}
          onCancelar={() => { setEditando(null); setTab('lista'); }}
        />
      )}

      {/* ── Aba: Configurações ── */}
      {tab === 'config' && (
        <PanelCard title="Configurações do Catálogo" icon={Settings}>
          <p className="text-sm text-zinc-500">Configurações disponíveis aqui.</p>
        </PanelCard>
      )}

      {/* Modal de edição (abre ao clicar na linha da tabela) */}
      {editando && tab === 'lista' && (
        <Modal
          isOpen={!!editando}
          onClose={() => setEditando(null)}
          title={`Editar: ${editando.nome}`}
          size="md"
        >
          <FormProduto
            inicial={editando}
            salvando={salvando}
            onSalvar={handleSalvar}
            onCancelar={() => setEditando(null)}
          />
        </Modal>
      )}

      {/* Confirmação de exclusão */}
      <ConfirmModal
        isOpen={!!excluindo}
        onClose={() => setExcluindo(null)}
        onConfirm={handleExcluir}
        title="Excluir produto"
        message="Esta ação não pode ser desfeita. O produto será removido permanentemente."
        variant="danger"
        confirmLabel="Excluir"
      />
    </PageWrapper>
  );
}

// ─── Formulário reutilizável (usado na aba e no modal) ────────────────────────

interface FormProdutoProps {
  inicial?: Produto | null;
  salvando: boolean;
  onSalvar: (dados: Omit<Produto, 'id'>) => void;
  onCancelar: () => void;
}

function FormProduto({ inicial, salvando, onSalvar, onCancelar }: FormProdutoProps) {
  const [nome, setNome] = useState(inicial?.nome ?? '');
  const [categoria, setCategoria] = useState(inicial?.categoria ?? '');
  const [preco, setPreco] = useState(String(inicial?.preco ?? ''));
  const [ativo, setAtivo] = useState(inicial?.ativo ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar({ nome, categoria, preco: Number(preco), ativo });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormRow cols={2}>
        <Input
          label="Nome do produto"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />
        <Input
          label="Categoria"
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
        />
      </FormRow>

      <FormRow cols={2}>
        <Input
          label="Preço"
          addonLeft="R$"
          value={preco}
          onChange={e => setPreco(e.target.value)}
          type="number"
          min="0"
          step="0.01"
        />
        <div className="flex items-center gap-3 pt-6">
          <Switch checked={ativo} onCheckedChange={setAtivo} />
          <span className="text-sm font-semibold text-zinc-700">
            {ativo ? 'Produto ativo' : 'Produto inativo'}
          </span>
        </div>
      </FormRow>

      <Divider />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" loading={salvando}>
          {inicial ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
}
```

---

## 11. Checklist Final ao Criar/Atualizar uma Página

- [ ] Arquivo em `src/components/NomeView.tsx`
- [ ] Exportação default (`export default function`)
- [ ] Registrado no `App.tsx` (import + bloco condicional)
- [ ] Registrado na `Sidebar.tsx` (se for item de menu)
- [ ] Usa `PageWrapper` como root
- [ ] Usa `SectionTitle` como cabeçalho
- [ ] Mobile: listas usam `GridTable` com cards ou `renderMobileItem`
- [ ] Mobile: abas têm `overflow-x-auto` + `whitespace-nowrap`
- [ ] Mobile: formulários usam `FormRow cols={1}` ou `cols={2}` adequado
- [ ] Modais usam `Modal` (bottom-sheet no mobile automático)
- [ ] Ações destrutivas usam `ConfirmModal`
- [ ] Loading state em todas as ações assíncronas
- [ ] Feedback via `useToast()` em todas as ações
- [ ] Estado vazio usa `EmptyState`
- [ ] Nenhum componente de UI criado do zero quando existe equivalente no DS
