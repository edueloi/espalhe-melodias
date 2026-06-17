/**
 * BreakpointDebug — Ferramenta de debug para responsividade
 * Mostra o breakpoint e device type atual
 * Use apenas em desenvolvimento
 */

import React from 'react';
import { useLayout } from './LayoutProvider';

export function BreakpointDebug() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const layout = useLayout();

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black text-white px-4 py-3 rounded-lg text-xs font-mono shadow-lg">
      <div>BP: <span className="text-cyan-300">{layout.breakpoint}</span></div>
      <div>Device: <span className="text-lime-300">{layout.device}</span></div>
      <div>Orientation: <span className="text-yellow-300">{layout.orientation}</span></div>
      <div>Touch: <span className="text-pink-300">{layout.isTouch ? 'yes' : 'no'}</span></div>
    </div>
  );
}
