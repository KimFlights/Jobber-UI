import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/api/client";
import type { JobView } from "@/api/types";
import { errorMessage } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";
import { Banner } from "@/components/Banner";
import { JobCard } from "@/components/JobCard";
import { EmptyState } from "@/components/EmptyState";

/**
 * Job search. The backend returns whatever is indexed right now (stale-now) and may kick off a
 * background scrape when results are thin/old — so a second search moments later can return more.
 * Deep-linkable via ?q= (the Résumé page links suggested queries straight here).
 */
export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get("q") ?? "";

  const [input, setInput] = useState(urlQuery);
  const [results, setResults] = useState<JobView[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      setResults(await api.jobs.search(q));
    } catch (err) {
      setError(errorMessage(err));
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run (or re-run) whenever the URL query changes — covers deep links and suggested-query jumps.
  useEffect(() => {
    setInput(urlQuery);
    if (urlQuery.trim()) runSearch(urlQuery);
    else setResults(null);
  }, [urlQuery, runSearch]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (q) setParams({ q }); // drives the effect above
  }

  return (
    <section className="stack">
      <PageHeader
        title="Search"
        subtitle="Searches the live index. Thin or stale queries trigger a background scrape — try again shortly for more."
      />

      <div className="card">
        <form className="row row--bottom" onSubmit={submit}>
          <Field
            label="Query"
            placeholder="e.g. backend engineer"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="grow"
          />
          <Button type="submit" loading={loading}>
            Search
          </Button>
        </form>
        {error && (
          <Banner tone="error" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}
      </div>

      {results && (
        <p className="muted result-count">
          {results.length} result{results.length === 1 ? "" : "s"} for “{urlQuery}”
        </p>
      )}

      {results && results.length > 0 ? (
        <div className="grid">
          {results.map((job) => (
            <JobCard key={job.jobId} job={job} />
          ))}
        </div>
      ) : (
        results && (
          <EmptyState icon="⌕" title="No jobs indexed for that query yet">
            A background scrape may have just started. Wait a few seconds and search again, or
            trigger one on the Scrape page.
          </EmptyState>
        )
      )}

      {!results && !loading && (
        <EmptyState icon="⌕" title="Search the job index">
          Enter a query above, or pick a suggested search on the Résumé page.
        </EmptyState>
      )}
    </section>
  );
}
