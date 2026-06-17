/**
 * LayoutProvider — Context global para responsividade
 * Fornece informações sobre o breakpoint atual e detecção de device
 */

import React, { createContext, useContext } from 'react';
import {
  useCurrentBreakpoint,
  useDeviceType,
  useOrientation,
  useIsTouchDevice,
  DeviceType,
  type BreakpointKey,
} from '@/src/theme/breakpoints';

interface LayoutContextType {
  breakpoint: BreakpointKey;
  device: DeviceType;
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWideDesktop: boolean;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const breakpoint = useCurrentBreakpoint();
  const device = useDeviceType();
  const orientation = useOrientation();
  const isTouch = useIsTouchDevice();

  const value: LayoutContextType = {
    breakpoint,
    device,
    orientation,
    isTouch,
    isMobile: device === DeviceType.MOBILE,
    isTablet: device === DeviceType.TABLET,
    isDesktop: device === DeviceType.DESKTOP,
    isWideDesktop: device === DeviceType.WIDE_DESKTOP,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout(): LayoutContextType {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout deve ser usado dentro de <LayoutProvider>');
  }
  return context;
}
