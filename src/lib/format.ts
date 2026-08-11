import { ApiError } from "@/api/client";

/** Turn any thrown value into a human-readable, single-line message for a Banner. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 0) return err.message; // network / backend-down
    if (err.status === 404) return "Not found — nothing has been created for this user yet.";
    const detail = err.body?.trim();
    return detail ? `${err.message} — ${detail}` : err.message;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

/** Compact, locale-aware timestamp for an ISO-8601 instant; blank for missing values. */
export function formatInstant(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
