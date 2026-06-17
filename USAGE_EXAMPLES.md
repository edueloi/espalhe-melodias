# 🎨 Exemplos Práticos de Uso do Sistema Responsivo

## 1. Hero Banner Responsivo

```jsx
import { TYPOGRAPHY_CLASSES, ICON_SIZES, CONTENT_SPACING } from '@/src/theme';

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-navy to-brand-navy-dark">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand-clay/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-brand-moss/10 blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full mb-4">
            <span className="text-xs sm:text-sm font-semibold text-brand-clay-light uppercase">
              Bem-vindo
            </span>
          </div>

          <h1 className={TYPOGRAPHY_CLASSES.h1}>
            Sua Comunidade de Acolhimento
          </h1>

          <p className={`${TYPOGRAPHY_CLASSES.bodyMd} mt-3 sm:mt-4 text-slate-300`}>
            Espaço seguro para conectar, aprender e crescer juntos
          </p>

          <button className="mt-6 sm:mt-8 px-6 sm:px-8 py-2.5 sm:py-3 bg-brand-moss hover:bg-brand-moss-dark rounded-lg text-white font-semibold transition">
            Começar Agora
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 2. Grid de Cards Responsivo

```jsx
import { GAP, StatGrid } from '@/src/theme';
import { ContentCard } from '@/src/components/ui';

export function CardGrid() {
  const cards = [
    { id: 1, title: 'Card 1', description: 'Lorem ipsum' },
    { id: 2, title: 'Card 2', description: 'Lorem ipsum' },
    { id: 3, title: 'Card 3', description: 'Lorem ipsum' },
    { id: 4, title: 'Card 4', description: 'Lorem ipsum' },
  ];

  return (
    <StatGrid cols={4} className="mt-8">
      {cards.map(card => (
        <ContentCard key={card.id} padding="md">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {card.title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            {card.description}
          </p>
        </ContentCard>
      ))}
    </StatGrid>
  );
}
```

---

## 3. Header com Search Responsivo

```jsx
import { HEADER_SPACING, ICON_SIZES } from '@/src/theme';
import { Search, Menu } from 'lucide-react';

export function ResponsiveHeader() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <header className={`bg-white border-b ${HEADER_SPACING.height}`}>
      <div className={`flex items-center ${HEADER_SPACING.padding} ${HEADER_SPACING.gap}`}>
        {/* Menu button - mobile only */}
        <button className="lg:hidden p-2 sm:p-2.5 rounded-lg hover:bg-slate-100">
          <Menu className={ICON_SIZES.md} />
        </button>

        {/* Search bar - adapts width */}
        <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md relative">
          <input
            type="text"
            placeholder="Pesquisar…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        {/* Right actions - stack responsively */}
        <div className={`flex items-center ${HEADER_SPACING.gap} ml-auto`}>
          <button className="p-2 sm:p-2.5 rounded-lg hover:bg-slate-100">
            <Bell className={ICON_SIZES.md} />
          </button>
          <button className="p-2 sm:p-2.5 rounded-lg hover:bg-slate-100">
            <User className={ICON_SIZES.md} />
          </button>
        </div>
      </div>
    </header>
  );
}
```

---

## 4. Sidebar Mobile/Desktop

```jsx
import { SIDEBAR_SPACING, MARGIN } from '@/src/theme';

export function ResponsiveSidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Backdrop - mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-brand-navy-dark text-slate-300
          transform transition-transform duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="px-3 sm:px-4 md:px-5 py-4 sm:py-5 border-b border-[#1e2e42]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-brand-clay to-brand-moss flex items-center justify-center text-white">
              <span className="text-sm sm:text-lg font-black">♩Ψ</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm sm:text-lg truncate">Espalhe</p>
              <p className="text-xs sm:text-sm text-brand-clay truncate">Melodias</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`${SIDEBAR_SPACING.padding} ${SIDEBAR_SPACING.gap}`}>
          {navItems.map(item => (
            <button
              key={item.id}
              className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg hover:bg-brand-navy-light/40 transition"
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User info - bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-[#1e2e42] bg-[#0c141e]">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <img src={userAvatar} className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg" />
            <div className="min-w-0 text-xs sm:text-sm">
              <p className="font-bold truncate">{userName}</p>
              <p className="text-[9px] sm:text-[10px] text-brand-clay truncate">{userRole}</p>
            </div>
          </div>
          <button className="w-full h-8 sm:h-9 rounded-lg bg-brand-moss/10 text-brand-moss text-xs sm:text-sm font-semibold transition">
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
```

---

## 5. Modal Responsivo

```jsx
import { RESPONSIVE_SIZES } from '@/src/theme';

export function ResponsiveModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${RESPONSIVE_SIZES.modalWidth} ${RESPONSIVE_SIZES.modalHeight} bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-auto`}>
        {/* Header */}
        <div className="sticky top-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Modal Title
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {children}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-slate-50 flex gap-2 sm:gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
          <button className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm bg-brand-moss text-white rounded-lg hover:bg-brand-moss-dark transition">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Form Responsivo

```jsx
import { FormRow, TYPOGRAPHY_SPACING } from '@/src/theme/';
import { Input, Textarea, Select, Button } from '@/src/components/ui';

export function ResponsiveForm() {
  const [formData, setFormData] = useState({});

  return (
    <form className="space-y-6 sm:space-y-8">
      {/* Single column fields */}
      <FormRow cols={1}>
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5 sm:mb-2">
            Email
          </label>
          <Input
            type="email"
            placeholder="seu@email.com"
            className="w-full text-xs sm:text-sm"
          />
        </div>
      </FormRow>

      {/* Two column fields */}
      <FormRow cols={2}>
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5 sm:mb-2">
            Nome
          </label>
          <Input placeholder="Seu nome" className="w-full text-xs sm:text-sm" />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5 sm:mb-2">
            Sobrenome
          </label>
          <Input placeholder="Seu sobrenome" className="w-full text-xs sm:text-sm" />
        </div>
      </FormRow>

      {/* Three column fields */}
      <FormRow cols={3}>
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5 sm:mb-2">
            Cidade
          </label>
          <Input placeholder="São Paulo" className="w-full text-xs sm:text-sm" />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5 sm:mb-2">
            Estado
          </label>
          <Select>
            <option>SP</option>
            <option>RJ</option>
          </Select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5 sm:mb-2">
            CEP
          </label>
          <Input placeholder="00000-000" className="w-full text-xs sm:text-sm" />
        </div>
      </FormRow>

      {/* Full width textarea */}
      <FormRow cols={1}>
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5 sm:mb-2">
            Mensagem
          </label>
          <Textarea
            placeholder="Sua mensagem aqui..."
            rows={4}
            className="w-full text-xs sm:text-sm"
          />
        </div>
      </FormRow>

      {/* Buttons */}
      <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6">
        <Button variant="outline" className="flex-1 sm:flex-none">
          Cancelar
        </Button>
        <Button variant="primary" className="flex-1 sm:flex-none">
          Enviar
        </Button>
      </div>
    </form>
  );
}
```

---

## 7. Table Responsivo

```jsx
import { GridTable, Pagination, usePagination } from '@/src/components/ui';

export function ResponsiveTable() {
  const { page, pageSize, goToPage } = usePagination();

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      render: (value) => <span className="text-xs sm:text-sm font-medium">{value}</span>,
      responsive: true,
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => <span className="text-xs sm:text-sm text-slate-600">{value}</span>,
      responsive: 'md',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`text-xs px-2 py-1 rounded font-semibold ${
          value === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {value === 'active' ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <GridTable columns={columns} data={items} />
      <Pagination currentPage={page} pageSize={pageSize} onPageChange={goToPage} />
    </div>
  );
}
```

---

## 8. Usando Hooks Responsivos

```jsx
import { useDeviceType, useOrientation, useLayout } from '@/src/theme';
import { DeviceType } from '@/src/theme';

export function AdaptiveComponent() {
  const device = useDeviceType();
  const orientation = useOrientation();
  const layout = useLayout();

  // Condicional render baseado em device
  if (device === DeviceType.MOBILE) {
    return (
      <div className="flex flex-col gap-2">
        <MobileNavigationBar />
        <MobileContent />
      </div>
    );
  }

  if (device === DeviceType.TABLET) {
    return (
      <div className="flex gap-4">
        <SidebarTablet />
        <MainContentTablet />
      </div>
    );
  }

  // Desktop
  return (
    <div className="flex gap-6">
      <Sidebar />
      <MainContent />
      <RightPanel />
    </div>
  );
}

// Ou use orientation
export function OrientationAwareComponent() {
  const orientation = useOrientation();

  return (
    <div className={orientation === 'landscape' ? 'flex gap-4' : 'flex flex-col gap-4'}>
      Content adapta ao landscape/portrait
    </div>
  );
}
```

---

## 9. Componente com LayoutProvider

```jsx
import { useLayout } from '@/src/components/layouts';

export function BreakpointAwareComponent() {
  const { breakpoint, isMobile, isTablet, isDesktop } = useLayout();

  return (
    <div>
      <h1 className="text-lg sm:text-2xl md:text-3xl">
        Breakpoint Atual: {breakpoint}
      </h1>

      {isMobile && (
        <div className="bg-blue-100 p-4 rounded-lg">
          Você está em mobile
        </div>
      )}

      {isTablet && (
        <div className="bg-green-100 p-4 rounded-lg">
          Você está em tablet
        </div>
      )}

      {isDesktop && (
        <div className="bg-purple-100 p-4 rounded-lg">
          Você está em desktop
        </div>
      )}
    </div>
  );
}
```

---

## 10. Checklist para Nova Página

```jsx
import { PageWrapper, SectionTitle, StatGrid, ContentCard } from '@/src/components/ui';
import { useLayout } from '@/src/components/layouts';

export function NewPage() {
  const { breakpoint, isMobile } = useLayout();

  return (
    <PageWrapper id="new-page" mobileBottomPad>
      {/* Hero */}
      <div className="mb-8 sm:mb-10 md:mb-12">
        <SectionTitle
          title="Título da Página"
          description="Descrição breve"
          divider
        />
      </div>

      {/* Stats */}
      <StatGrid cols={isMobile ? 2 : 4} className="mb-8 sm:mb-10">
        {stats.map(stat => (
          <ContentCard key={stat.id} padding="md">
            <div className="text-xs sm:text-sm text-slate-600">{stat.label}</div>
            <div className="text-xl sm:text-2xl font-bold mt-2">{stat.value}</div>
          </ContentCard>
        ))}
      </StatGrid>

      {/* Content */}
      <div className="space-y-6 sm:space-y-8">
        {sections.map(section => (
          <ContentCard key={section.id} padding="lg">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
              {section.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              {section.content}
            </p>
          </ContentCard>
        ))}
      </div>
    </PageWrapper>
  );
}
```

---

## ✅ Checklist de Implementação

Ao criar novo componente/página:

- [ ] Importar tokens necessários (`SPACING`, `TYPOGRAPHY_CLASSES`, etc)
- [ ] Usar `px-3 sm:px-4 md:px-6` para padding horizontal
- [ ] Usar `text-xs sm:text-sm md:text-base` para font size
- [ ] Usar `gap-3 sm:gap-4 md:gap-5` para gaps
- [ ] Usar `rounded-lg sm:rounded-xl` para border radius
- [ ] Testar em mobile (320px), tablet (768px), desktop (1280px)
- [ ] Usar `truncate` para textos longos em mobile
- [ ] Adicionar `shrink-0` em icons/images
- [ ] Usar `min-w-0` em containers com flex
- [ ] Testar em navegadores: Chrome, Firefox, Safari, Edge

---

Todos esses exemplos seguem os padrões do novo sistema!
