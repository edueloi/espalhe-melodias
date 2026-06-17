/**
 * ResponsiveContainer — Wrapper responsivo para layouts
 * Adapta automaticamente spacing, padding e comportamento por breakpoint
 */

import React from 'react';
import { cn } from '@/src/lib/utils';
import { CONTAINER_PADDING } from '@/src/theme/spacing';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  variant?: keyof typeof CONTAINER_PADDING;
  className?: string;
  as?: React.ElementType;
  id?: string;
  fullWidth?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
  full: 'max-w-full',
};

export function ResponsiveContainer({
  children,
  variant = 'default',
  className,
  as: Component = 'div',
  id,
  fullWidth = true,
  maxWidth = 'full',
}: ResponsiveContainerProps) {
  const config = CONTAINER_PADDING[variant];
  const maxWClass = maxWidthClasses[maxWidth];

  return (
    <Component
      id={id}
      className={cn(
        'w-full',
        !fullWidth && 'mx-auto',
        !fullWidth && maxWClass,
        `px-[${config.mobile}] md:px-[${config.tablet}] lg:px-[${config.desktop}] xl:px-[${config.wide}]`,
        className
      )}
    >
      {children}
    </Component>
  );
}
