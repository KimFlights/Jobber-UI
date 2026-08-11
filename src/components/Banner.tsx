import type { ReactNode } from "react";

type Tone = "error" | "success" | "info";

interface BannerProps {
  tone: Tone;
  children: ReactNode;
  onDismiss?: () => void;
}

/** Inline status message for form results and errors. */
export function Banner({ tone, children, onDismiss }: BannerProps) {
  return (
    <div className={`banner banner--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <span className="banner__text">{children}</span>
      {onDismiss && (
        <button className="banner__close" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
