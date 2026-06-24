"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({ icon = "📋", title, subtitle, actionLabel, onAction, compact }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-12" : "py-24"}`}>
      <div className={`${compact ? "text-4xl mb-3" : "text-6xl mb-6"} animate-fade-in`}>
        {icon}
      </div>
      <h3 className={`font-headline-sm text-on-surface font-bold ${compact ? "text-base mb-1" : "text-xl mb-2"}`}>
        {title}
      </h3>
      {subtitle && (
        <p className={`text-on-surface-variant max-w-md ${compact ? "text-xs" : "text-sm"}`}>
          {subtitle}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 bg-primary text-on-primary px-6 py-3 rounded-2xl text-label-md font-bold hover:bg-primary/90 transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
