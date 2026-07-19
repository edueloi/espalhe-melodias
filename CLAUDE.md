# Espalhe Melodias — Guia para o Claude

## O que é este projeto

Plataforma de comunidade/membros para o projeto Espalhe Melodias.

Front-end: React + TypeScript + Vite + Tailwind CSS.
Back-end: Node.js + Express + TypeScript, na pasta `server/`, com autenticação JWT (access + refresh token).
Banco de dados: MySQL (via `mysql2`), banco `espalhe_melodias`.

Estado de auth (tokens) fica em `localStorage`; todo o resto dos dados vem da API (`src/lib/api.ts`), não mais de `mockData.ts`/`localStorage`.

## Estrutura

```
src/
  App.tsx                    ← roteamento por currentTab (não usa React Router)
  components/
    ui/                      ← design system próprio (Button, Modal, etc.)
    *View.tsx                ← uma View por "página"
    Sidebar.tsx              ← menu lateral, registra abas
    Header.tsx               ← barra superior
  lib/api.ts                 ← cliente HTTP centralizado (fala com o backend em server/)
  types.ts                   ← tipos TypeScript do domínio
  mockData.ts                ← dados iniciais/seed (legado, não é mais a fonte de dados em runtime)

server/
  src/
    routes/                  ← rotas Express por domínio (auth, users, forum, materials, events, blogs, ...)
    controllers/             ← lógica de cada rota
    middleware/               ← auth (JWT), permissions, validate, rate limiters
    models/                  ← acesso a dados (store.ts, publicWebsite.ts, instagram.ts)
    config/db.ts             ← pool de conexão MySQL (mysql2)
    scripts/                 ← migrate.ts, seed.ts

skill/
  new-page/CLAUDE.md         ← guia de como criar/atualizar páginas
  use-component/use-component.md  ← documentação de todos os componentes UI
```

## Rodar localmente

```
cd server
npm install
node scripts/migrate.js   # cria as tabelas
npm run seed               # dados iniciais
npm run dev                 # API em http://localhost:3001
```

Frontend roda em paralelo (Vite, porta padrão 5173/3000) e consome a API via `src/lib/api.ts`.

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
