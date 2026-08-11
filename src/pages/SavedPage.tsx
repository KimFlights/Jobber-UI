import { useCallback, useEffect, useState } from "react";
import { api } from "@/api/client";
import type { SavedJobView } from "@/api/types";
import { useUser } from "@/context/UserContext";
import { errorMessage } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { Banner } from "@/components/Banner";
import { SavedJobRow } from "@/components/SavedJobRow";
import { EmptyState } from "@/components/EmptyState";

/** The caller's saved jobs, with rating (last match %) and applied status. */
export function SavedPage() {
  const { sub } = useUser();
  const [jobs, setJobs] = useState<SavedJobView[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setJobs(await api.jobs.saved(sub));
    } catch (err) {
      setError(errorMessage(err));
      setJobs(null);
    } finally {
      setLoading(false);
    }
  }, [sub]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="stack">
      <PageHeader
        title="Saved"
        subtitle={
          <>
            Jobs saved by user <code>{sub}</code>, with their match rating and applied status.
          </>
        }
        actions={
          <Button variant="ghost" loading={loading} onClick={load}>
            Refresh
          </Button>
        }
      />

      {error && (
        <Banner tone="error" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}

      {jobs && jobs.length > 0 ? (
        <div className="stack stack--tight">
          {jobs.map((j) => (
            <SavedJobRow key={j.jobId} job={j} />
          ))}
        </div>
      ) : (
        jobs && (
          <EmptyState icon="☆" title="No saved jobs yet">
            Save a job from the Search page and it will appear here.
          </EmptyState>
        )
      )}
    </section>
  );
}
