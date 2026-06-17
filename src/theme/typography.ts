/**
 * Sistema de Tipografia Responsiva
 * Font sizes que escalam automaticamente por breakpoint
 * Segue escala modular 1.25 (quarte perfeita)
 */

export const TYPOGRAPHY = {
  // Display / Hero
  h1: {
    mobile: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
    weight: 'font-black',
    lineHeight: 'leading-tight',
  },
  h2: {
    mobile: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
    weight: 'font-bold',
    lineHeight: 'leading-snug',
  },
  h3: {
    mobile: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
    weight: 'font-bold',
    lineHeight: 'leading-snug',
  },
  h4: {
    mobile: 'text-base sm:text-lg md:text-xl lg:text-2xl',
    weight: 'font-semibold',
    lineHeight: 'leading-snug',
  },
  h5: {
    mobile: 'text-sm sm:text-base md:text-lg lg:text-xl',
    weight: 'font-semibold',
    lineHeight: 'leading-normal',
  },
  h6: {
    mobile: 'text-xs sm:text-sm md:text-base lg:text-lg',
    weight: 'font-semibold',
    lineHeight: 'leading-normal',
  },

  // Body text
  body: {
    lg: {
      mobile: 'text-base',
      weight: 'font-normal',
      lineHeight: 'leading-relaxed',
    },
    md: {
      mobile: 'text-sm sm:text-base',
      weight: 'font-normal',
      lineHeight: 'leading-relaxed',
    },
    sm: {
      mobile: 'text-xs sm:text-sm',
      weight: 'font-normal',
      lineHeight: 'leading-relaxed',
    },
    xs: {
      mobile: 'text-xs',
      weight: 'font-normal',
      lineHeight: 'leading-relaxed',
    },
  },

  // UI text
  ui: {
    button: {
      mobile: 'text-xs sm:text-sm',
      weight: 'font-semibold',
      lineHeight: 'leading-none',
    },
    label: {
      mobile: 'text-xs sm:text-sm',
      weight: 'font-medium',
      lineHeight: 'leading-tight',
    },
    caption: {
      mobile: 'text-xs',
      weight: 'font-normal',
      lineHeight: 'leading-tight',
    },
    tag: {
      mobile: 'text-[10px] sm:text-xs',
      weight: 'font-bold',
      lineHeight: 'leading-none',
    },
  },

  // Monospace (código, preços, etc)
  mono: {
    mobile: 'text-xs sm:text-sm font-mono',
    lineHeight: 'leading-tight',
  },
} as const;

/**
 * Predefined typography classes
 * Uso: `className={TYPOGRAPHY_CLASSES.heading1}`
 */
export const TYPOGRAPHY_CLASSES = {
  // Headings
  h1: `${TYPOGRAPHY.h1.mobile} ${TYPOGRAPHY.h1.weight} ${TYPOGRAPHY.h1.lineHeight}`,
  h2: `${TYPOGRAPHY.h2.mobile} ${TYPOGRAPHY.h2.weight} ${TYPOGRAPHY.h2.lineHeight}`,
  h3: `${TYPOGRAPHY.h3.mobile} ${TYPOGRAPHY.h3.weight} ${TYPOGRAPHY.h3.lineHeight}`,
  h4: `${TYPOGRAPHY.h4.mobile} ${TYPOGRAPHY.h4.weight} ${TYPOGRAPHY.h4.lineHeight}`,
  h5: `${TYPOGRAPHY.h5.mobile} ${TYPOGRAPHY.h5.weight} ${TYPOGRAPHY.h5.lineHeight}`,
  h6: `${TYPOGRAPHY.h6.mobile} ${TYPOGRAPHY.h6.weight} ${TYPOGRAPHY.h6.lineHeight}`,

  // Body
  bodyLg: `${TYPOGRAPHY.body.lg.mobile} ${TYPOGRAPHY.body.lg.weight} ${TYPOGRAPHY.body.lg.lineHeight}`,
  bodyMd: `${TYPOGRAPHY.body.md.mobile} ${TYPOGRAPHY.body.md.weight} ${TYPOGRAPHY.body.md.lineHeight}`,
  bodySm: `${TYPOGRAPHY.body.sm.mobile} ${TYPOGRAPHY.body.sm.weight} ${TYPOGRAPHY.body.sm.lineHeight}`,
  bodyXs: `${TYPOGRAPHY.body.xs.mobile} ${TYPOGRAPHY.body.xs.weight} ${TYPOGRAPHY.body.xs.lineHeight}`,

  // UI
  button: `${TYPOGRAPHY.ui.button.mobile} ${TYPOGRAPHY.ui.button.weight} ${TYPOGRAPHY.ui.button.lineHeight}`,
  label: `${TYPOGRAPHY.ui.label.mobile} ${TYPOGRAPHY.ui.label.weight} ${TYPOGRAPHY.ui.label.lineHeight}`,
  caption: `${TYPOGRAPHY.ui.caption.mobile} ${TYPOGRAPHY.ui.caption.weight} ${TYPOGRAPHY.ui.caption.lineHeight}`,
  tag: `${TYPOGRAPHY.ui.tag.mobile} ${TYPOGRAPHY.ui.tag.weight} ${TYPOGRAPHY.ui.tag.lineHeight}`,

  // Mono
  mono: TYPOGRAPHY.mono.mobile,
} as const;

/**
 * Icon sizes responsivos
 */
export const ICON_SIZES = {
  xs: 'w-3 h-3 sm:w-3.5 h-3.5',
  sm: 'w-4 h-4 sm:w-4.5 h-4.5',
  md: 'w-5 h-5 sm:w-6 h-6',
  lg: 'w-6 h-6 sm:w-7 h-7',
  xl: 'w-8 h-8 sm:w-9 h-9',
  '2xl': 'w-10 h-10 sm:w-12 h-12',
  '3xl': 'w-12 h-12 sm:w-14 h-14',
} as const;

/**
 * Truncate helpers
 */
export const TRUNCATE = {
  line1: 'truncate',
  line2: 'line-clamp-2',
  line3: 'line-clamp-3',
  line4: 'line-clamp-4',
  line5: 'line-clamp-5',
} as const;

/**
 * Line height scales
 */
export const LINE_HEIGHT = {
  tight: 'leading-tight',
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
} as const;

/**
 * Letter spacing
 */
export const LETTER_SPACING = {
  tighter: 'tracking-tighter',
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  wider: 'tracking-wider',
  widest: 'tracking-widest',
} as const;

/**
 * Font weights
 */
export const FONT_WEIGHT = {
  thin: 'font-thin',
  extralight: 'font-extralight',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
} as const;
