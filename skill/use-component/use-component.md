# Guia de Componentes — `src/components/ui/`

Todos os componentes são exportados via `src/components/ui/index.ts`.

```ts
import { Button, Input, Modal, ... } from '@/src/components/ui';
```

---

## Interação

### `Button`
Botão padrão do design system. Suporta variantes de cor, tamanhos, loading e ícones laterais.

**Props:**
| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `variant` | `primary \| secondary \| outline \| ghost \| danger \| success` | `primary` | Estilo visual |
| `size` | `xs \| sm \| md \| lg` | `md` | Tamanho |
| `loading` | `boolean` | `false` | Mostra spinner e desabilita |
| `iconLeft` | `ReactNode` | — | Ícone antes do texto |
| `iconRight` | `ReactNode` | — | Ícone depois do texto |
| `fullWidth` | `boolean` | `false` | Ocupa 100% da largura |

```tsx
<Button variant="primary" size="md" loading={false} iconLeft={<Plus size={14} />}>
  Novo Item
</Button>

<Button variant="danger" onClick={handleDelete}>Excluir</Button>
<Button variant="outline" fullWidth>Cancelar</Button>
```

---

### `IconButton`
Versão quadrada do Button, para botões de ícone apenas (sem texto).

**Props:** Mesmas de `Button`, mas sem `iconLeft/iconRight/fullWidth`. O filho direto é o ícone.

```tsx
<IconButton variant="ghost" size="md" onClick={handleEdit}>
  <Pencil size={16} />
</IconButton>

<IconButton variant="danger" size="sm">
  <Trash2 size={14} />
</IconButton>
```

---

### `Switch`
Toggle on/off. Substitui checkbox para configurações booleanas.

**Props:**
| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `checked` | `boolean` | — | Estado atual |
| `onCheckedChange` | `(v: boolean) => void` | — | Callback ao trocar |
| `size` | `sm \| md` | `md` | Tamanho visual |

```tsx
const [ativo, setAtivo] = useState(true);

<Switch checked={ativo} onCheckedChange={setAtivo} />
<Switch checked={ativo} onCheckedChange={setAtivo} size="sm" />
```

---

## Formulários

### `Input`
Campo de texto com label, erro, hint, ícones e addons.

**Props principais:**
| Prop | Descrição |
|------|-----------|
| `label` | Label acima do campo |
| `error` | Mensagem de erro (borda vermelha) |
| `hint` | Texto de ajuda abaixo |
| `iconLeft / iconRight` | Ícone dentro do campo |
| `addonLeft / addonRight` | Bloco fixo (ex: "https://", "kg") |
| `size` | `sm \| md \| lg` |
| `maxLength` | Mostra contador de caracteres |

```tsx
<Input label="Nome" placeholder="Ex: João" value={nome} onChange={e => setNome(e.target.value)} />

<Input
  label="Preço"
  addonLeft="R$"
  error={errors.preco}
  hint="Valor em reais"
  value={preco}
  onChange={e => setPreco(e.target.value)}
/>

<Input label="Buscar" iconLeft={<Search size={14} />} size="sm" />
```

---

### `Textarea`
Área de texto multilinha com label, erro e contador de caracteres.

```tsx
<Textarea
  label="Descrição"
  placeholder="Descreva o produto..."
  value={descricao}
  onChange={e => setDescricao(e.target.value)}
  maxLength={500}
  rows={4}
/>
```

---

### `Select`
Select nativo estilizado com label, erro e lista de opções via prop `options`.

```tsx
<Select
  label="Categoria"
  placeholder="Selecione..."
  options={[
    { value: "musica", label: "Música" },
    { value: "curso", label: "Curso" },
  ]}
  value={categoria}
  onChange={e => setCategoria(e.target.value)}
/>
```

---

### `Combobox`
Select com busca, multi-seleção, grupos e opção de adicionar valor customizado. Usa portal (`document.body`) para o dropdown não ser cortado por overflow.

**Props principais:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| `options` | `ComboboxOption[]` | Lista de opções |
| `value` | `string \| string[]` | Valor selecionado |
| `onChange` | `(v) => void` | Callback |
| `multiple` | `boolean` | Multi-seleção com chips |
| `allowCustom` | `boolean` | Permite digitar valor não listado |
| `onCustomAdd` | `(v: string) => void` | Callback ao adicionar customizado |

```tsx
// Seleção simples
<Combobox
  options={[{ value: "1", label: "Opção A" }, { value: "2", label: "Opção B" }]}
  value={selecionado}
  onChange={v => setSelecionado(v as string)}
  placeholder="Selecione..."
/>

// Multi com grupos
<Combobox
  multiple
  options={[
    { value: "s1", label: "Corte", group: "Serviços", badge: "R$ 50" },
    { value: "p1", label: "Pacote VIP", group: "Pacotes" },
  ]}
  value={itens}
  onChange={v => setItens(v as string[])}
/>
```

---

### `DatePicker`
Seletor de data com calendário em portal. Suporta digitação direta no formato `DD/MM/AAAA`, navegação por mês/ano e feriados marcados.

**Props principais:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| `value` | `string \| null` | Data no formato ISO `YYYY-MM-DD` |
| `onChange` | `(v: string \| null) => void` | Callback |
| `min / max` | `string` | Limites de data (ISO) |
| `variant` | `default \| ghost` | Estilo do trigger |
| `label / error / hint` | `string` | Labels e feedback |
| `renderTrigger` | `(v) => ReactNode` | Trigger completamente customizado |

```tsx
<DatePicker
  label="Data do evento"
  value={data}
  onChange={setData}
  min="2025-01-01"
/>

// Com trigger customizado
<DatePicker
  value={data}
  onChange={setData}
  renderTrigger={v => <button>{v ? v : "Escolher data"}</button>}
/>
```

---

### `Calendar`
Calendário visual embutido (não é dropdown). Usado para gerenciar dias bloqueados ou selecionar uma data de forma permanente na página.

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| `mode` | `block \| select` | `block` = toggle de bloqueio; `select` = seleção única |
| `blockedDates` | `string[]` | Datas bloqueadas (ISO) |
| `closedDates` | `string[]` | Datas fechadas/feriados (em rosa, não clicáveis) |
| `selectedDate` | `string` | Data selecionada (modo `select`) |
| `onDateToggle` | `(d) => void` | Callback modo `block` |
| `onDateSelect` | `(d) => void` | Callback modo `select` |

```tsx
// Modo bloqueio de dias
<Calendar
  mode="block"
  blockedDates={diasBloqueados}
  closedDates={feriados}
  onDateToggle={date => toggleBloqueio(date)}
/>

// Modo seleção
<Calendar
  mode="select"
  selectedDate={dataSelecionada}
  onDateSelect={setDataSelecionada}
/>
```

---

### `RichTextEditor`
Editor WYSIWYG completo com toolbar. Suporta formatação de texto, títulos, listas, tabelas, imagens (URL ou upload), links, blocos especiais e resize de imagens com arraste.

**Props:**
| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `value` | `string` | — | Conteúdo HTML |
| `onChange` | `(html: string) => void` | — | Callback com HTML atualizado |
| `placeholder` | `string` | `"Comece a escrever..."` | Placeholder |
| `minHeight` | `number` | `400` | Altura mínima em px |

```tsx
const [conteudo, setConteudo] = useState("<p>Olá!</p>");

<RichTextEditor
  value={conteudo}
  onChange={setConteudo}
  minHeight={300}
  placeholder="Escreva o conteúdo do e-mail..."
/>
```

---

### `TokenTextarea`
Textarea com suporte a variáveis `{{nome_variavel}}` renderizadas como chips não-editáveis. Ideal para templates de mensagens (WhatsApp, e-mail).

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| `value` | `string` | Texto com variáveis `{{chave}}` |
| `onChange` | `(plain: string) => void` | Retorna texto puro com `{{chave}}` |
| `availableVars` | `{ key: string; desc: string }[]` | Botões de inserção de variáveis |
| `rows` | `number` | Altura em linhas |

```tsx
<TokenTextarea
  value={mensagem}
  onChange={setMensagem}
  availableVars={[
    { key: "{{nome_cliente}}", desc: "Nome completo do cliente" },
    { key: "{{data}}", desc: "Data do agendamento" },
  ]}
  rows={5}
/>
```

---

## Feedback

### `Toast` + `ToastProvider` + `useToast`
Notificações flutuantes com animação. Precisam do `ToastProvider` no root da aplicação.

**Setup (uma vez no root):**
```tsx
// App.tsx ou layout raiz
<ToastProvider>
  <App />
</ToastProvider>
```

**Uso em qualquer componente filho:**
```tsx
const toast = useToast();

toast.success("Salvo com sucesso!");
toast.error("Erro ao salvar.");
toast.warning("Atenção: prazo próximo.");
toast.info("Novo agendamento recebido.");

// Genérico
toast.show("Mensagem aqui", "success");
```

---

### `Badge`
Etiqueta visual inline. Use para status, categorias ou contagens.

**Props:**
| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `color` | `default \| primary \| success \| warning \| danger \| info \| purple \| orange \| teal` | `default` | Cor semântica |
| `size` | `sm \| md` | `sm` | Tamanho |
| `dot` | `boolean` | `false` | Ponto colorido antes do texto |
| `icon` | `ReactNode` | — | Ícone antes do texto |
| `pill` | `boolean` | `false` | Bordas totalmente arredondadas |

```tsx
<Badge color="success" dot>Ativo</Badge>
<Badge color="danger" size="md">Cancelado</Badge>
<Badge color="info" icon={<Music size={10} />}>Publicado</Badge>
```

---

### `StatusBadge`
Wrapper semântico de `Badge` para os status do sistema. Já define cor e texto automaticamente.

**Status disponíveis:** `scheduled`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`, `open`, `paid`, `pending`, `partial`

```tsx
<StatusBadge status="confirmed" />
<StatusBadge status="pending" size="md" dot={false} />
```

---

### `PaymentBadge`
Wrapper semântico de `Badge` para formas de pagamento.

**Métodos disponíveis:** `cash`, `card`, `pix`, `mixed`, `transfer`, `voucher`

```tsx
<PaymentBadge method="pix" />
<PaymentBadge method="card" size="md" />
```

---

## Layout e Estrutura

### `PageWrapper`
Container responsivo padrão para páginas. Aplica padding horizontal/vertical adaptado a sidebar + mobile.

**Props:**
| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `mobileBottomPad` | `boolean` | `true` | Padding extra no fundo para o bottom-nav mobile |

```tsx
// Toda página do admin deve ter PageWrapper como root
<PageWrapper>
  <SectionTitle title="Agenda" />
  {/* conteúdo */}
</PageWrapper>
```

---

### `SectionTitle`
Cabeçalho padrão de página com título, descrição, ícone e slot de ação.

```tsx
<SectionTitle
  title="Produtos"
  description="Gerencie o catálogo de produtos"
  icon={ShoppingBag}
  action={<Button iconLeft={<Plus size={14} />}>Novo</Button>}
  divider
/>
```

---

### `StatGrid`
Grid responsivo para agrupar `StatCard`. Ajusta colunas automaticamente.

```tsx
<StatGrid cols={4}>
  <StatCard ... />
  <StatCard ... />
  <StatCard ... />
  <StatCard ... />
</StatGrid>
```

---

### `ContentCard`
Card de conteúdo simples com borda e fundo branco.

```tsx
<ContentCard padding="md">
  <p>Conteúdo aqui</p>
</ContentCard>
```

---

### `FormRow`
Grid de campos de formulário responsivo.

```tsx
<FormRow cols={2}>
  <Input label="Nome" ... />
  <Input label="E-mail" ... />
</FormRow>
```

---

### `Divider`
Linha separadora horizontal.

```tsx
<Divider />
<Divider className="my-4" />
```

---

### `PanelCard`
Card de seção com header (ícone + título + descrição + ação) e corpo com padding.

```tsx
<PanelCard
  title="Serviços"
  description="Gerencie os serviços oferecidos"
  icon={Scissors}
  action={<Button size="sm">Adicionar</Button>}
>
  {/* conteúdo da seção */}
</PanelCard>
```

---

### `EmptyState`
Estado vazio para listas ou seções sem dados.

```tsx
<EmptyState
  title="Nenhum produto encontrado"
  description="Cadastre seu primeiro produto para começar."
  icon={PackageOpen}
  action={<Button size="sm">Cadastrar</Button>}
/>
```

---

## Dados

### `StatCard`
Card de estatística com valor, ícone, tendência e animação de entrada.

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| `title` | `string` | Label da métrica |
| `value` | `string \| number` | Valor principal |
| `icon` | `React.ElementType` | Ícone (Lucide) |
| `trend` | `{ value: number; isUp: boolean }` | Variação percentual |
| `description` | `string` | Subtexto extra |
| `color` | `default \| success \| info \| danger \| purple \| warning` | Cor do ícone |
| `delay` | `number` | Delay de animação (ms) para entrada escalonada |

```tsx
<StatCard
  title="Receita do mês"
  value="R$ 12.400"
  icon={TrendingUp}
  color="success"
  trend={{ value: 8, isUp: true }}
  description="Comparado ao mês anterior"
  delay={0.1}
/>
```

---

### `GridTable`
Tabela responsiva com vista de cards no mobile. Suporta seleção, ordenação, paginação e loading skeleton.

**Props principais:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| `data` | `T[]` | Array de dados |
| `columns` | `Column<T>[]` | Definição das colunas |
| `keyExtractor` | `(row: T) => string \| number` | Chave única por linha |
| `onRowClick` | `(row: T) => void` | Clique na linha |
| `selectedIds` | `Set<string>` | IDs selecionados |
| `onToggleSelect` | `(id: string) => void` | Toggle seleção individual |
| `onToggleSelectAll` | `() => void` | Selecionar todos |
| `isLoading` | `boolean` | Exibe skeleton |
| `pagination` | `{ total, page, pageSize, ... }` | Paginação integrada |
| `renderMobileItem` | `(row) => ReactNode` | Card mobile customizado |
| `renderMobileExpandedContent` | `(row) => ReactNode` | Conteúdo expansível no mobile |
| `emptyMessage` | `string \| ReactNode` | Mensagem sem dados |

**Definição de coluna:**
```ts
interface Column<T> {
  header: string;
  accessor?: keyof T;       // acesso direto ao campo
  render?: (row: T) => ReactNode; // renderização customizada
  sortKey?: string;         // habilita ordenação
  hideOnMobile?: boolean;   // esconde no card mobile automático
}
```

```tsx
<GridTable
  data={produtos}
  keyExtractor={p => p.id}
  columns={[
    { header: "Nome", accessor: "nome" },
    { header: "Preço", render: p => `R$ ${p.preco}` },
    { header: "Status", render: p => <StatusBadge status={p.status} />, sortKey: "status" },
  ]}
  onRowClick={p => navigate(`/produtos/${p.id}`)}
  isLoading={carregando}
  pagination={{ total, page, pageSize, onPageChange, onPageSizeChange }}
/>
```

---

### `Pagination`
Barra de paginação com navegação, contagem e seletor de itens por página.

```tsx
<Pagination
  total={200}
  page={pagina}
  pageSize={tamanho}
  onPageChange={setPagina}
  onPageSizeChange={setTamanho}
/>
```

**Hook auxiliar para paginação client-side:**
```tsx
const { page, pageSize, paginatedData, setPage, setPageSize } = usePagination(todosOsDados, 15);
```

---

## Filtros e Toolbar

### `FilterLine` + subcomponentes
Container de filtros com layout responsivo (coluna no mobile, linha no desktop).

**Subcomponentes:**
- `FilterLineSection` — agrupador flex dentro da FilterLine
- `FilterLineItem` — wrapper individual de item (responsivo)
- `FilterLineGroup` — grupo com fundo cinza arredondado
- `FilterLineSegmented` — grupo de botões tipo tab/segmento
- `FilterLineViewToggle` — botões de alternância grade/lista
- `FilterLineSearch` — campo de busca com ícone
- `FilterLineDateRange` — dois DatePickers (De / Até)

```tsx
<FilterLine>
  <FilterLineSection grow>
    <FilterLineItem grow>
      <FilterLineSearch
        value={busca}
        onChange={setBusca}
        placeholder="Buscar produto..."
      />
    </FilterLineItem>
    <FilterLineItem>
      <Select options={categorias} value={cat} onChange={e => setCat(e.target.value)} size="sm" />
    </FilterLineItem>
  </FilterLineSection>

  <FilterLineSection align="right">
    <FilterLineSegmented
      value={periodo}
      onChange={setPeriodo}
      options={[
        { value: "hoje", label: "Hoje" },
        { value: "semana", label: "Semana" },
        { value: "mes", label: "Mês" },
      ]}
    />
    <FilterLineViewToggle
      value={vista}
      onChange={setVista}
      gridValue="grid"
      listValue="list"
    />
  </FilterLineSection>
</FilterLine>
```

---

## Pagamentos

### `PaymentModal`
Modal especializado para registro de pagamento de comanda. Suporta pagamento único (dinheiro/cartão/pix com parcelamento) ou misto (múltiplos métodos com valores distintos). Inclui pagamento parcial com saldo em aberto.

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| `isOpen` | `boolean` | Visibilidade |
| `onClose` | `() => void` | Fechar |
| `comanda` | `any` | Objeto da comanda com `total`, `paidAmount`, `client`, `id` |
| `onConfirm` | `(method: string, details: any) => Promise<void>` | Callback de confirmação |

```tsx
<PaymentModal
  isOpen={showPagamento}
  onClose={() => setShowPagamento(false)}
  comanda={comandaSelecionada}
  onConfirm={async (method, details) => {
    await salvarPagamento(comanda.id, method, details);
  }}
/>
```

---

## Modal

### `Modal`
Modal responsivo com animação. No mobile vira bottom-sheet ou fullscreen automaticamente.

**Tamanhos:** `xs` (360px) · `sm` (448px) · `md` (512px) · `lg` (640px) · `xl` (768px) · `2xl` (900px) · `full` (95vw)

```tsx
<Modal
  isOpen={aberto}
  onClose={() => setAberto(false)}
  title="Editar Produto"
  size="lg"
  footer={
    <ModalFooter>
      <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
      <Button variant="primary" loading={salvando} onClick={salvar}>Salvar</Button>
    </ModalFooter>
  }
>
  <FormRow cols={2}>
    <Input label="Nome" value={nome} onChange={e => setNome(e.target.value)} />
    <Input label="Preço" value={preco} onChange={e => setPreco(e.target.value)} />
  </FormRow>
</Modal>
```

---

### `ConfirmModal`
Modal de confirmação simples (sim/não). Pronto para uso sem precisar compor `Modal` + `ModalFooter`.

```tsx
<ConfirmModal
  isOpen={confirmarExclusao}
  onClose={() => setConfirmarExclusao(false)}
  onConfirm={excluir}
  title="Excluir produto"
  message="Esta ação não pode ser desfeita. Deseja continuar?"
  confirmLabel="Excluir"
  variant="danger"
  loading={excluindo}
/>
```
