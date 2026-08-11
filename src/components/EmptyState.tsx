import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  children?: ReactNode;
}

/** Neutral placeholder for "no results yet" / "nothing here" states. */
export function EmptyState({ icon = "○", title, children }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty__icon" aria-hidden="true">
        {icon}
      </div>
      <p className="empty__title">{title}</p>
      {children && <p className="empty__body">{children}</p>}
    </div>
  );
}
