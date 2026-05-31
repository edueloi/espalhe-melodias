# Espalhe Melodias — Guia para o Claude

## O que é este projeto

Plataforma de comunidade/membros para o projeto Espalhe Melodias.  
Stack: React + TypeScript + Vite + Tailwind CSS.  
Sem backend real — estado persistido em `localStorage`.

## Estrutura

```
src/
  App.tsx                    ← roteamento por currentTab (não usa React Router)
  components/
    ui/                      ← design system próprio (Button, Modal, etc.)
    *View.tsx                ← uma View por "página"
    Sidebar.tsx              ← menu lateral, registra abas
    Header.tsx               ← barra superior
  types.ts                   ← tipos TypeScript do domínio
  mockData.ts                ← dados iniciais

skill/
  new-page/CLAUDE.md         ← guia de como criar/atualizar páginas
  use-component/use-component.md  ← documentação de todos os componentes UI
```

## Regras fundamentais

1. **Responsividade obrigatória** — toda página funciona como app no mobile, tablet e desktop.
2. **Sempre usar componentes do DS** em `src/components/ui/` — nunca criar botão/input/modal do zero.
3. **Roteamento via `currentTab`** — nova página = novo valor de tab no App.tsx + entrada na Sidebar.
4. **Feedback sempre** — toda ação usa `useToast()`. Ações destrutivas usam `ConfirmModal`.
5. **Loading state** em toda ação assíncrona.

## Adicionar uma página nova

Ver guia detalhado: [skill/new-page/CLAUDE.md](skill/new-page/CLAUDE.md)

## Usar componentes UI

Ver documentação completa: [skill/use-component/use-component.md](skill/use-component/use-component.md)

## Componentes UI disponíveis

Importar de `@/src/components/ui`:

```ts
import { Button, Input, Modal, GridTable, ... } from '@/src/components/ui';
```

Componentes: `Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Switch`, `DatePicker`, `Calendar`, `Combobox`, `RichTextEditor`, `TokenTextarea`, `Modal`, `ModalFooter`, `ConfirmModal`, `Toast`, `useToast`, `Badge`, `StatusBadge`, `PaymentBadge`, `PageWrapper`, `SectionTitle`, `StatGrid`, `ContentCard`, `FormRow`, `Divider`, `PanelCard`, `EmptyState`, `StatCard`, `GridTable`, `Pagination`, `usePagination`, `FilterLine`, `FilterLineSearch`, `FilterLineSegmented`, `FilterLineViewToggle`, `FilterLineDateRange`, `PaymentModal`.

## Se precisar criar um componente novo

1. Criar em `src/components/ui/NomeComponente.tsx`
2. Exportar em `src/components/ui/index.ts`
3. Atualizar `skill/use-component/use-component.md`
