/**
 * MobileDrawer — Drawer responsivo para mobile
 * Aparece/desaparece com animação fluida em dispositivos pequenos
 */

import React, { useEffect } from 'react';
import { cn } from '@/src/lib/utils';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  showBackdrop?: boolean;
  zIndex?: number;
}

const sizeClasses = {
  sm: 'max-w-xs',
  md: 'max-w-sm',
  lg: 'max-w-md',
};

export function MobileDrawer({
  isOpen,
  onClose,
  children,
  position = 'left',
  size = 'md',
  showBackdrop = true,
  zIndex = 50,
}: MobileDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const positionClass = position === 'left' ? 'left-0' : 'right-0';
  const translateClass = position === 'left'
    ? isOpen ? 'translate-x-0' : '-translate-x-full'
    : isOpen ? 'translate-x-0' : 'translate-x-full';

  return (
    <>
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className={cn(
            'fixed inset-0 bg-black/50 transition-opacity duration-300',
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
          style={{ zIndex: zIndex - 1 }}
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0',
          positionClass,
          sizeClasses[size],
          'w-72',
          'bg-white shadow-lg',
          'transform transition-transform duration-300 ease-in-out',
          translateClass,
          'overflow-y-auto',
          'lg:hidden',
        )}
        style={{ zIndex }}
      >
        {children}
      </div>
    </>
  );
}
