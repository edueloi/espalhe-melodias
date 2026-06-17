/**
 * Sistema de Espaçamento Responsivo
 * Escala de espaçamento único que adapta por breakpoint
 * Segue proporção 1:1.25 (golden ratio)
 */

export const SPACING = {
  // Micro spacing
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
  '5xl': '5rem',    // 80px
  '6xl': '6rem',    // 96px
} as const;

export type SpacingKey = keyof typeof SPACING;

/**
 * Padding responsivo por container
 * Ajusta automaticamente conforme breakpoint
 */
export const CONTAINER_PADDING = {
  // Mobile-first
  default: {
    mobile: '1rem',      // 16px (xs)
    tablet: '1.5rem',    // 24px (md+)
    desktop: '2rem',     // 32px (lg+)
    wide: '3rem',        // 48px (xl+)
  },
  // Variantes compactas
  compact: {
    mobile: '0.75rem',
    tablet: '1rem',
    desktop: '1.5rem',
    wide: '2rem',
  },
  // Variantes spacious
  spacious: {
    mobile: '1.5rem',
    tablet: '2rem',
    desktop: '3rem',
    wide: '4rem',
  },
  // Variantes zero (para fullscreen)
  none: {
    mobile: '0',
    tablet: '0',
    desktop: '0',
    wide: '0',
  },
} as const;

/**
 * Gap responsivo para grids e flex
 */
export const GAP = {
  xs: {
    mobile: '0.5rem',   // 8px
    tablet: '0.75rem',
    desktop: '1rem',
    wide: '1.25rem',
  },
  sm: {
    mobile: '0.75rem',  // 12px
    tablet: '1rem',
    desktop: '1.25rem',
    wide: '1.5rem',
  },
  md: {
    mobile: '1rem',     // 16px
    tablet: '1.25rem',
    desktop: '1.5rem',
    wide: '2rem',
  },
  lg: {
    mobile: '1.5rem',   // 24px
    tablet: '2rem',
    desktop: '2.5rem',
    wide: '3rem',
  },
  xl: {
    mobile: '2rem',     // 32px
    tablet: '2.5rem',
    desktop: '3rem',
    wide: '4rem',
  },
} as const;

/**
 * Classes Tailwind para padding responsivo
 * Uso: `className={getPaddingClasses('default')}`
 */
export function getPaddingClasses(variant: keyof typeof CONTAINER_PADDING): string {
  const config = CONTAINER_PADDING[variant];
  return `px-[${config.mobile}] md:px-[${config.tablet}] lg:px-[${config.desktop}] xl:px-[${config.wide}]`;
}

/**
 * Classes Tailwind para gap responsivo
 * Uso: `className={getGapClasses('md')}`
 */
export function getGapClasses(size: keyof typeof GAP): string {
  const config = GAP[size];
  return `gap-[${config.mobile}] md:gap-[${config.tablet}] lg:gap-[${config.desktop}] xl:gap-[${config.wide}]`;
}

/**
 * Spacing section (padding vertical entre seções)
 */
export const SECTION_PADDING = {
  compact: 'py-2 sm:py-3 md:py-4 lg:py-5',
  default: 'py-4 sm:py-5 md:py-6 lg:py-8',
  spacious: 'py-6 sm:py-8 md:py-10 lg:py-12',
  hero: 'py-8 sm:py-12 md:py-16 lg:py-20',
} as const;

/**
 * Margin utilities
 */
export const MARGIN = {
  stackXs: 'space-y-1 sm:space-y-2 md:space-y-3',
  stackSm: 'space-y-2 sm:space-y-3 md:space-y-4',
  stackMd: 'space-y-3 sm:space-y-4 md:space-y-6',
  stackLg: 'space-y-4 sm:space-y-6 md:space-y-8',
  stackXl: 'space-y-6 sm:space-y-8 md:space-y-10',

  inlineXs: 'space-x-1 sm:space-x-2 md:space-x-3',
  inlineSm: 'space-x-2 sm:space-x-3 md:space-x-4',
  inlineMd: 'space-x-3 sm:space-x-4 md:space-x-6',
  inlineLg: 'space-x-4 sm:space-x-6 md:space-x-8',
} as const;

/**
 * Sidebar spacing
 */
export const SIDEBAR_SPACING = {
  // Desktop: w-72 (288px)
  // Tablet: w-60 (240px)
  // Mobile: hidden (drawer)
  width: 'w-72 lg:w-72',
  padding: 'p-4 md:p-5 lg:p-6',
  gap: 'space-y-4 md:space-y-5 lg:space-y-6',
} as const;

/**
 * Header spacing
 */
export const HEADER_SPACING = {
  height: 'h-14 sm:h-16 md:h-16',
  padding: 'px-3 sm:px-4 md:px-6 lg:px-8',
  gap: 'gap-2 sm:gap-3 md:gap-4',
} as const;

/**
 * Content area spacing
 */
export const CONTENT_SPACING = {
  // Padding ao redor do conteúdo
  wrapper: 'px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6',
  // Cards inteiros
  card: 'p-3 sm:p-4 md:p-5 lg:p-6',
  // Seções internas
  section: 'space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8',
} as const;

/**
 * Typography spacing
 */
export const TYPOGRAPHY_SPACING = {
  headingMargin: 'mb-2 sm:mb-3 md:mb-4',
  descriptionMargin: 'mt-1 sm:mt-1.5 md:mt-2',
  paragraph: 'space-y-2 sm:space-y-2.5 md:space-y-3',
} as const;
