import React from "react";
import { cn } from "@/src/lib/utils";
import { CONTENT_SPACING } from "@/src/theme/spacing";

// ─────────────────────────────────────────────────────────────────────────────
// PageWrapper — Design System
//
// Wrapper responsivo padrão para páginas do admin.
// Ajustado para ocupar melhor a largura em layouts com sidebar,
// evitando "sobras" laterais e excesso de respiro vertical.
// ─────────────────────────────────────────────────────────────────────────────

interface PageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  id?: string;
  mobileBottomPad?: boolean;
}

export function PageWrapper({
  children,
  className,
  mobileBottomPad = true,
  ...props
}: PageWrapperProps) {
  return (
    <div
      className={cn(
        // Ocupa toda a largura útil do painel
        "w-full max-w-none min-w-0",
        // Padding horizontal — menor no mobile para aproveitar mais tela
        "px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8",
        // Padding vertical
        "pt-3 sm:pt-4 md:pt-5 lg:pt-6",
        // Bottom spacing
        mobileBottomPad ? "pb-24 sm:pb-6 md:pb-8 lg:pb-10" : "pb-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionTitle — Cabeçalho de seção/página
// ─────────────────────────────────────────────────────────────────────────────

interface SectionTitleProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  className?: string;
  /** Separador inferior */
  divider?: boolean;
}

export function SectionTitle({
  title,
  description,
  icon: Icon,
  action,
  className,
  divider = false,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between",
        divider && "mb-4 sm:mb-5 md:mb-6 border-b border-zinc-100 pb-4 sm:pb-5 md:pb-6",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        {Icon && (
          <div className="flex h-8 w-8 sm:h-9 md:h-10 sm:w-9 md:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl md:rounded-2xl border border-amber-100 bg-amber-50">
            <Icon size={16} className="text-amber-600 sm:text-[18px] md:text-[20px]" />
          </div>
        )}

        <div className="min-w-0">
          <h1 className="truncate font-display text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-tight text-zinc-900">
            {title}
          </h1>

          {description && (
            <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm leading-relaxed text-zinc-400">
              {description}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="flex w-full items-center gap-2 sm:gap-3 sm:w-auto sm:justify-end">
          {action}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatGrid — Grid responsivo para cards de estatística
// ─────────────────────────────────────────────────────────────────────────────

interface StatGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
}

export function StatGrid({
  children,
  cols = 4,
  className,
  ...props
}: StatGridProps) {
  const colsMap: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-3 sm:gap-4 md:gap-5", colsMap[cols], className)} {...props}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ContentCard — Card de conteúdo simples
// ─────────────────────────────────────────────────────────────────────────────

interface ContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  id?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export function ContentCard({
  children,
  padding = "md",
  className,
  ...props
}: ContentCardProps) {
  const paddingMap = {
    none: "",
    sm: "p-2.5 sm:p-3 md:p-4",
    md: "p-3 sm:p-4 md:p-5 lg:p-6",
    lg: "p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8",
  };

  return (
    <div
      className={cn(
        "rounded-xl sm:rounded-2xl border border-zinc-200 bg-white shadow-sm",
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormRow — Row de formulário com label + campo, responsivo
// ─────────────────────────────────────────────────────────────────────────────

interface FormRowProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
  className?: string;
}

export function FormRow({ children, cols = 2, className }: FormRowProps) {
  const colsMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return <div className={cn("grid gap-3 sm:gap-4 md:gap-5", colsMap[cols], className)}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Divider — Separador horizontal
// ─────────────────────────────────────────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return <div className={cn("border-t border-zinc-100", className)} />;
}