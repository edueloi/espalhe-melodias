/**
 * Sistema de Breakpoints Responsivos
 * Mobile-first approach com pontos de quebra claros para todos os devices
 *
 * Estratégia:
 * - xs (320px): iPhone SE, pequenos celulares
 * - sm (640px): iPhone 12+, tablets pequenos em portrait
 * - md (768px): iPad, tablets em portrait
 * - lg (1024px): iPad landscape, netbooks
 * - xl (1280px): Desktops pequenos
 * - 2xl (1536px): Desktops grandes, monitores ultrawide
 * - 3xl (1920px): Monitores 4K
 * - 4xl (2560px): Monitores premium
 */

export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
  '4xl': 2560,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Media queries para uso em CSS-in-JS ou styled-components
 */
export const MEDIA = {
  xs: `(min-width: ${BREAKPOINTS.xs}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
  '3xl': `(min-width: ${BREAKPOINTS['3xl']}px)`,
  '4xl': `(min-width: ${BREAKPOINTS['4xl']}px)`,

  // Mobile-first negation
  notSmall: `(min-width: ${BREAKPOINTS.md}px)`,
  notMedium: `(min-width: ${BREAKPOINTS.lg}px)`,
  notLarge: `(min-width: ${BREAKPOINTS.xl}px)`,

  // Landscape detection
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',

  // Touch devices
  touchDevice: '(hover: none) and (pointer: coarse)',

  // High DPI screens
  retina: '(min-resolution: 2dppx)',
} as const;

/**
 * Device categories para lógica condicional
 */
export enum DeviceType {
  MOBILE = 'mobile',           // < 768px
  TABLET = 'tablet',           // 768px - 1024px
  DESKTOP = 'desktop',         // 1024px - 1536px
  WIDE_DESKTOP = 'wide',       // >= 1536px
}

/**
 * Hook para detectar breakpoint atual
 */
export function useCurrentBreakpoint(): BreakpointKey {
  const [bp, setBp] = React.useState<BreakpointKey>('xs');

  React.useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      let current: BreakpointKey = 'xs';

      if (w >= BREAKPOINTS['4xl']) current = '4xl';
      else if (w >= BREAKPOINTS['3xl']) current = '3xl';
      else if (w >= BREAKPOINTS['2xl']) current = '2xl';
      else if (w >= BREAKPOINTS.xl) current = 'xl';
      else if (w >= BREAKPOINTS.lg) current = 'lg';
      else if (w >= BREAKPOINTS.md) current = 'md';
      else if (w >= BREAKPOINTS.sm) current = 'sm';

      setBp(current);
    };

    check();
    const timer = debounce(check, 150);
    window.addEventListener('resize', timer);
    return () => window.removeEventListener('resize', timer);
  }, []);

  return bp;
}

/**
 * Hook para detectar tipo de device
 */
export function useDeviceType(): DeviceType {
  const [device, setDevice] = React.useState<DeviceType>(DeviceType.MOBILE);

  React.useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      let current = DeviceType.MOBILE;

      if (w >= BREAKPOINTS.xl) current = DeviceType.WIDE_DESKTOP;
      else if (w >= BREAKPOINTS.lg) current = DeviceType.DESKTOP;
      else if (w >= BREAKPOINTS.md) current = DeviceType.TABLET;

      setDevice(current);
    };

    check();
    const timer = debounce(check, 150);
    window.addEventListener('resize', timer);
    return () => window.removeEventListener('resize', timer);
  }, []);

  return device;
}

/**
 * Hook para detectar orientação
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const check = () => {
      setOrientation(window.innerWidth < window.innerHeight ? 'portrait' : 'landscape');
    };

    check();
    window.addEventListener('orientationchange', check);
    window.addEventListener('resize', check);

    return () => {
      window.removeEventListener('orientationchange', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  return orientation;
}

/**
 * Detecta se é dispositivo com touch
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      setIsTouch(
        (typeof window !== 'undefined' &&
          ('ontouchstart' in window ||
            (window as any).DocumentTouch &&
            document instanceof (window as any).DocumentTouch ||
            navigator.maxTouchPoints > 0 ||
            (navigator as any).msMaxTouchPoints > 0))
      );
    };

    check();
  }, []);

  return isTouch;
}

// ─────────────────────────────────────────────────────────────────────────
// Utilitários privados
// ─────────────────────────────────────────────────────────────────────────

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timeout: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  }) as T;
}

// Re-export React para o hook
import React from 'react';
