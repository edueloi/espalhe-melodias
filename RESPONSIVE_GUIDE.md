# Sistema de Responsividade Espalhe Melodias

## 🎯 Visão Geral

Sistema completo de design responsivo com tokens, hooks e componentes para garantir experiência perfeita em todos os devices.

**Stack:**
- Tailwind CSS (mobile-first)
- React Hooks customizados
- Design tokens centralizados
- LayoutProvider para state global

---

## 📱 Breakpoints

| Breakpoint | Pixel | Device | Uso |
|-----------|-------|--------|-----|
| **xs** | 320px | iPhone SE | Baseline mobile |
| **sm** | 640px | iPhone 12+ | Smartphones grandes |
| **md** | 768px | iPad | Tablets portrait |
| **lg** | 1024px | iPad landscape | Tablets landscape/netbooks |
| **xl** | 1280px | Desktop pequeno | Desktop padrão |
| **2xl** | 1536px | Desktop grande | Monitores grandes |
| **3xl** | 1920px | 4K | Monitores 4K |
| **4xl** | 2560px | 5K | Displays premium |

### Uso em Tailwind

```jsx
// Mobile-first: escreva para mobile, depois adicione responsividade
<div className="text-sm sm:text-base md:text-lg lg:text-xl">
  Responsive Text
</div>

// Ou use prefixos de breakpoint
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

---

## 🎨 Design Tokens

### Spacing (em `src/theme/spacing.ts`)

```typescript
import { CONTAINER_PADDING, GAP, SECTION_PADDING, MARGIN } from '@/src/theme';

// Padding responsivo
<div className="px-3 sm:px-4 md:px-6 lg:px-8">Content</div>

// Gap em grids
<div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2">
  {/* ... */}
</div>

// Seções
<section className={SECTION_PADDING.default}>Content</section>

// Stacking
<div className={MARGIN.stackMd}>
  <p>Item 1</p>
  <p>Item 2</p>
</div>
```

### Typography (em `src/theme/typography.ts`)

```typescript
import { TYPOGRAPHY_CLASSES, ICON_SIZES } from '@/src/theme';

// Headings responsivos
<h1 className={TYPOGRAPHY_CLASSES.h1}>Título Grande</h1>
<h2 className={TYPOGRAPHY_CLASSES.h2}>Subtítulo</h2>

// Body text
<p className={TYPOGRAPHY_CLASSES.bodyMd}>Parágrafo normal</p>

// Icons responsivos
<Icon className={ICON_SIZES.md} /> {/* w-5 h-5 sm:w-6 sm:h-6 */}
<Icon className={ICON_SIZES.lg} /> {/* w-6 h-6 sm:w-7 sm:h-7 */}
```

### Header/Sidebar (em `src/theme/spacing.ts`)

```typescript
import { HEADER_SPACING, SIDEBAR_SPACING } from '@/src/theme';

// Header
<header className={HEADER_SPACING.height}>
  <div className={HEADER_SPACING.padding}>
    {/* content */}
  </div>
</header>

// Sidebar
<aside className={SIDEBAR_SPACING.width}>
  <div className={`${SIDEBAR_SPACING.padding} ${SIDEBAR_SPACING.gap}`}>
    {/* nav items */}
  </div>
</aside>
```

---

## 🪝 Hooks Responsivos

### `useCurrentBreakpoint()`

Detecta breakpoint atual (atualiza em tempo real)

```typescript
import { useCurrentBreakpoint } from '@/src/theme';

export function MyComponent() {
  const bp = useCurrentBreakpoint();
  
  return (
    <div>
      Current: {bp} {/* 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' */}
    </div>
  );
}
```

### `useDeviceType()`

Detecta tipo de device

```typescript
import { useDeviceType, DeviceType } from '@/src/theme';

export function MyComponent() {
  const device = useDeviceType(); // MOBILE | TABLET | DESKTOP | WIDE_DESKTOP
  
  if (device === DeviceType.MOBILE) {
    return <MobileLayout />;
  }
  return <DesktopLayout />;
}
```

### `useOrientation()`

Detecta orientação do device

```typescript
import { useOrientation } from '@/src/theme';

export function MyComponent() {
  const orientation = useOrientation(); // 'portrait' | 'landscape'
  
  return (
    <div>
      {orientation === 'landscape' && <WideLayout />}
      {orientation === 'portrait' && <TallLayout />}
    </div>
  );
}
```

### `useIsTouchDevice()`

Detecta se é dispositivo com touch

```typescript
import { useIsTouchDevice } from '@/src/theme';

export function MyComponent() {
  const isTouch = useIsTouchDevice();
  
  return (
    <button className={isTouch ? 'p-3' : 'p-2'}>
      Tap/Click
    </button>
  );
}
```

### `useLayout()`

Acessa contexto global de layout

```typescript
import { useLayout } from '@/src/components/layouts';

export function MyComponent() {
  const { breakpoint, device, isMobile, isDesktop, orientation } = useLayout();
  
  return (
    <div>
      BP: {breakpoint}
      Device: {device}
      Mobile: {isMobile ? 'yes' : 'no'}
      Orientation: {orientation}
    </div>
  );
}
```

---

## 🧩 Componentes de Layout

### `LayoutProvider`

Wrappa sua aplicação para fornecer contexto global

```typescript
import { LayoutProvider } from '@/src/components/layouts';

export default function App() {
  return (
    <LayoutProvider>
      <YourApp />
    </LayoutProvider>
  );
}
```

### `ResponsiveContainer`

Container responsivo com padding automático

```typescript
import { ResponsiveContainer } from '@/src/components/layouts';

<ResponsiveContainer variant="default" maxWidth="2xl">
  <h1>Conteúdo</h1>
</ResponsiveContainer>
```

**Variantes:**
- `default`: padding padrão
- `compact`: padding reduzido
- `spacious`: padding grande
- `none`: sem padding

### `BreakpointDebug`

Ferramenta de debug (apenas em desenvolvimento)

```typescript
import { BreakpointDebug } from '@/src/components/layouts';

function App() {
  return (
    <>
      <YourApp />
      <BreakpointDebug /> {/* Mostra BP atual no canto inferior direito */}
    </>
  );
}
```

---

## ✅ Checklist de Responsividade

Ao criar uma página/componente:

- [ ] **Mobile First**: Comece com CSS mobile, depois adicione responsividade
- [ ] **Teste em 320px**: Mínimo absoluto (iPhone SE)
- [ ] **Teste em 768px**: Tablets (breakpoint crítico)
- [ ] **Teste em 1024px+**: Desktops
- [ ] **Padding**: Use `px-3 sm:px-4 md:px-6 lg:px-8` (não hardcode)
- [ ] **Gap**: Use `gap-3 sm:gap-4 md:gap-5` para grids/flex
- [ ] **Font sizes**: Nunca `text-16px`, sempre `text-sm sm:text-base`
- [ ] **Icons**: Use `ICON_SIZES.*` (w-4 h-4 sm:w-5 sm:h-5)
- [ ] **Height**: Inputs/buttons com `h-9 sm:h-10`, não hardcode
- [ ] **Modals**: Use `w-full sm:max-w-lg` para responsividade automática
- [ ] **Truncate**: Use `truncate` para textos longos em mobile
- [ ] **Drawer**: Apareça/desapareça automaticamente com `lg:hidden`

---

## 🎨 Padrões Comuns

### Hero Banner Responsivo

```jsx
<div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
  <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
      Título
    </h1>
    <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-600">
      Descrição
    </p>
  </div>
</div>
```

### Grid Responsivo (2-3-4 colunas)

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
  {items.map(item => (
    <div key={item.id} className="rounded-xl bg-white p-4 sm:p-5">
      {/* content */}
    </div>
  ))}
</div>
```

### Flex Layout Responsivo

```jsx
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
  <div className="flex-1">
    <h2 className="text-lg sm:text-xl font-bold">Título</h2>
  </div>
  <button className="w-full sm:w-auto">Ação</button>
</div>
```

### Drawer/Sidebar Mobile

```jsx
<aside className={cn(
  'fixed lg:static inset-y-0 left-0 z-50',
  'w-72 transition-transform duration-300',
  sidebarOpen ? 'translate-x-0' : '-translate-x-full',
)}>
  {/* Sidebar content */}
</aside>
```

### Modal Responsivo

```jsx
<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
  <div className="w-full sm:max-w-lg rounded-xl sm:rounded-2xl bg-white shadow-xl max-h-[90vh]">
    {/* content */}
  </div>
</div>
```

---

## 🚀 Boas Práticas

### ✅ Do's

```jsx
// ✅ Use prefixos de breakpoint
<div className="text-sm md:text-base lg:text-lg">OK</div>

// ✅ Use design tokens
<div className={SECTION_PADDING.default}>OK</div>

// ✅ Mobile-first
<div className="hidden md:block">Desktop only</div>

// ✅ Use hooks quando lógica complexa
const device = useDeviceType();

// ✅ Teste de verdade em devices reais
// (não só Chrome DevTools)
```

### ❌ Don'ts

```jsx
// ❌ Não hardcode padding
<div className="px-24">WRONG</div>

// ❌ Não use font sizes hardcoded
<div className="text-16px">WRONG</div>

// ❌ Não ignore mobile
<div className="hidden">Desktop forever</div>

// ❌ Não use `sm:hidden` (inverte lógica)
<div className="sm:hidden">Confuso!</div>

// ❌ Não misture unidades
<div className="w-[400px] sm:w-full">Ruim</div>
```

---

## 📊 Exemplos Reais

### Header Responsivo (antes/depois)

**❌ ANTES** (sem tokens):
```jsx
<header className="h-16 px-4 md:px-6 gap-3">
  <button className="p-2 w-5 h-5">Menu</button>
  <input className="text-sm md:text-base px-3 py-2 h-9" />
</header>
```

**✅ DEPOIS** (com tokens):
```jsx
<header className={HEADER_SPACING.height}>
  <div className={HEADER_SPACING.padding}>
    <button className="p-2 sm:p-2.5">
      <Menu className={ICON_SIZES.md} />
    </button>
    <input className="text-xs sm:text-sm" />
  </div>
</header>
```

### Sidebar Responsivo (antes/depois)

**❌ ANTES** (não responsivo):
```jsx
<aside className="w-72 p-6">
  <nav className="space-y-2">
    {items.map(item => (
      <button className="px-4 py-2.5 text-sm">
        {item.label}
      </button>
    ))}
  </nav>
</aside>
```

**✅ DEPOIS** (responsivo):
```jsx
<aside className={SIDEBAR_SPACING.width}>
  <nav className={SIDEBAR_SPACING.gap}>
    {items.map(item => (
      <button className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm truncate">
        {item.label}
      </button>
    ))}
  </nav>
</aside>
```

---

## 🧪 Testando Responsividade

### Ferramenta Built-in

```jsx
import { BreakpointDebug } from '@/src/components/layouts';

// Na App.tsx:
<App>
  <BreakpointDebug />
</App>
```

Mostra breakpoint atual no canto inferior direito (dev only).

### Device Emulation

Chrome DevTools → F12 → Toggle Device Toolbar (Ctrl+Shift+M)

**Devices importantes:**
- iPhone SE (375px)
- iPhone 12 Pro (390px)
- iPhone 14 Pro Max (430px)
- iPad (768px)
- iPad Air (834px)
- iPad Pro (1024px)

### Testes em Verdadeiros Devices

```bash
# Acesse pelo IP do seu computador
http://192.168.1.100:3000

# Ou use ngrok para testar em qualquer lugar
npx ngrok http 3000
```

---

## 📚 Referências

- **Tailwind CSS**: https://tailwindcss.com/docs/responsive-design
- **Design System**: `src/theme/index.ts`
- **Components**: `src/components/layouts/`
- **Exemplo Completo**: `src/components/Header.tsx`

---

## 🆘 Troubleshooting

**P: Meu componente não responde em mobile**
- R: Use prefixos `sm:`, `md:`, etc. Mobile-first!

**P: Padding inconsistente entre páginas**
- R: Use `CONTAINER_PADDING` em vez de hardcode.

**P: Modal não funciona bem em mobile**
- R: Use `w-full sm:max-w-lg p-4` + `max-h-[90vh]`

**P: Texto cortado em mobile**
- R: Use `truncate` ou `line-clamp-2`

**P: Drawer aparece em desktop também**
- R: Adicione `lg:hidden` ao fixed element.

---

## 🎯 Roadmap

- [ ] Criar screenshot guide de cada breakpoint
- [ ] Adicionar Storybook para components
- [ ] Implementar theme switcher (dark mode)
- [ ] Adicionar accessibility guide
- [ ] Criar figma com sistema de design
