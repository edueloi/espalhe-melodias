import React from "react";
import { cn } from "@/src/lib/utils";
import { CONTENT_SPACING } from "@/src/theme/spacing";

// ─────────────────────────────────────────────────────────────────────────────
// PageWrapper — Design System
//
// Wrapper responsivo padrão para páginas do admin.
// Tipografia e espaçamento otimizados para melhor legibilidade.
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
        "w-full max-w-none min-w-0",
        "px-2.5 sm:px-3.5 md:px-4 lg:px-5 xl:px-6",
        "pt-2.5 sm:pt-3 md:pt-4 lg:pt-4",
        mobileBottomPad ? "pb-20 sm:pb-6 md:pb-8 lg:pb-8" : "pb-0",
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
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        divider && "mb-3 sm:mb-4 md:mb-5 border-b border-slate-200 pb-3 sm:pb-4 md:pb-5",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {Icon && (
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50">
            <Icon size={14} className="text-amber-600 sm:text-[15px]" />
          </div>
        )}

        <div className="min-w-0">
          <h1 className="truncate font-serif text-sm sm:text-base md:text-lg font-bold tracking-tight text-slate-900">
            {title}
          </h1>

          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
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
    <div className={cn("grid gap-2.5 sm:gap-3 md:gap-4", colsMap[cols], className)} {...props}>
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
    sm: "p-2 sm:p-2.5 md:p-3",
    md: "p-2.5 sm:p-3 md:p-4 lg:p-5",
    lg: "p-3 sm:p-4 md:p-5 lg:p-6",
  };

  return (
    <div
      className={cn(
        "rounded-lg sm:rounded-xl border border-slate-200 bg-white shadow-xs",
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

  return <div className={cn("grid gap-2.5 sm:gap-3 md:gap-4", colsMap[cols], className)}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Divider — Separador horizontal
// ─────────────────────────────────────────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return <div className={cn("border-t border-slate-200", className)} />;
}