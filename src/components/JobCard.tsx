import { useState } from "react";
import type { JobView } from "@/api/types";
import { api } from "@/api/client";
import { useUser } from "@/context/UserContext";
import { errorMessage, formatInstant } from "@/lib/format";
import { Button } from "./Button";
import { Banner } from "./Banner";
import { TagList } from "./TagList";
import { MatchBadge } from "./MatchBadge";

interface JobCardProps {
  job: JobView;
}

/**
 * A single job posting with the three per-user actions the backend exposes:
 * match (cosine % vs. the resume), save, and toggle applied. Each action owns its own
 * loading/error state so one failing button never blocks the others.
 */
export function JobCard({ job }: JobCardProps) {
  const { sub } = useUser();
  const [expanded, setExpanded] = useState(false);
  const [match, setMatch] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [busy, setBusy] = useState<null | "match" | "save" | "applied">(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: "match" | "save" | "applied", fn: () => Promise<void>) {
    setBusy(kind);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  const doMatch = () =>
    run("match", async () => {
      const res = await api.jobs.match(sub, job.jobId);
      setMatch(res.matchPercent);
    });

  const doSave = () =>
    run("save", async () => {
      const res = await api.jobs.save(sub, job.jobId);
      setSaved(true);
      setApplied(res.applied);
      if (res.rating != null) setMatch(res.rating);
    });

  const toggleApplied = () =>
    run("applied", async () => {
      const next = !applied;
      const res = await api.jobs.setApplied(sub, job.jobId, next);
      setApplied(res.applied);
      setSaved(true); // setting applied implies the job is now tracked
    });

  return (
    <article className="card job">
      <header className="job__head">
        <div>
          <h3 className="job__title">{job.title || "Untitled role"}</h3>
          <p className="job__meta">
            <span>{job.company || "Unknown company"}</span>
            {job.location && <span> · {job.location}</span>}
            {job.experienceLevel && <span> · {job.experienceLevel}</span>}
          </p>
        </div>
        {match != null && <MatchBadge percent={match} />}
      </header>

      {job.summary && <p className="job__summary">{job.summary}</p>}

      <TagList items={job.coreRequirements} />

      {expanded && (
        <div className="job__details">
          <DetailList label="Must-haves" items={job.mustHaves} />
          <DetailList label="Nice-to-haves" items={job.niceToHaves} />
          <DetailList label="Responsibilities" items={job.responsibilities} />
          <dl className="job__facts">
            <div>
              <dt>Source</dt>
              <dd>{job.source || "—"}</dd>
            </div>
            <div>
              <dt>Enriched</dt>
              <dd>{formatInstant(job.enrichedAt) || "—"}</dd>
            </div>
            <div>
              <dt>Job ID</dt>
              <dd className="mono">{job.jobId}</dd>
            </div>
          </dl>
          {job.url && (
            <a className="job__link" href={job.url} target="_blank" rel="noreferrer">
              Open posting ↗
            </a>
          )}
        </div>
      )}

      {error && (
        <Banner tone="error" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}

      <footer className="job__actions">
        <Button variant="primary" loading={busy === "match"} onClick={doMatch}>
          Match to résumé
        </Button>
        <Button variant="secondary" loading={busy === "save"} onClick={doSave} disabled={saved}>
          {saved ? "Saved ✓" : "Save"}
        </Button>
        <Button variant="ghost" loading={busy === "applied"} onClick={toggleApplied}>
          {applied ? "Applied ✓" : "Mark applied"}
        </Button>
        <button className="job__toggle" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Less" : "Details"}
        </button>
      </footer>
    </article>
  );
}

function DetailList({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="job__detail-block">
      <h4>{label}</h4>
      <ul className="bullets">
        {items.map((it, i) => (
          <li key={`${it}-${i}`}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
