import { useState } from "react";
import type { SavedJobView } from "@/api/types";
import { api } from "@/api/client";
import { useUser } from "@/context/UserContext";
import { errorMessage, formatInstant } from "@/lib/format";
import { Button } from "./Button";
import { Banner } from "./Banner";
import { MatchBadge } from "./MatchBadge";

interface SavedJobRowProps {
  job: SavedJobView;
}

/**
 * One row of the saved list. The backend's saved view carries only jobId + rating + applied
 * (not the full posting), so this is intentionally compact. The applied toggle mutates state.
 */
export function SavedJobRow({ job }: SavedJobRowProps) {
  const { sub } = useUser();
  const [applied, setApplied] = useState(job.applied);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.jobs.setApplied(sub, job.jobId, !applied);
      setApplied(res.applied);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card saved-row">
      <div className="saved-row__main">
        <span className="mono saved-row__id">{job.jobId}</span>
        <span className="muted">Updated {formatInstant(job.updatedAt) || "—"}</span>
        {error && (
          <Banner tone="error" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}
      </div>
      <div className="saved-row__side">
        {job.rating != null && <MatchBadge percent={job.rating} />}
        <Button variant={applied ? "ghost" : "secondary"} loading={busy} onClick={toggle}>
          {applied ? "Applied ✓" : "Mark applied"}
        </Button>
      </div>
    </article>
  );
}
