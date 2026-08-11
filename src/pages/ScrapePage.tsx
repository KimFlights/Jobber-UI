import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { errorMessage } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";
import { Banner } from "@/components/Banner";

/**
 * Manual scrape trigger. Hits ScraperService's /api/scrape directly (it is not gateway-routed).
 * The scrape runs asynchronously through Kafka: scrape → compress/enrich → index, so results
 * appear on the Search page a few seconds later, not here.
 */
export function ScrapePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<string | null>(null);

  async function trigger() {
    const q = query.trim();
    if (!q) {
      setError("Enter a query to scrape for.");
      return;
    }
    setLoading(true);
    setError(null);
    setAccepted(null);
    try {
      const ack = await api.scrape(q);
      setAccepted(ack.query);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="stack">
      <PageHeader
        title="Scrape"
        subtitle="Kick off a scrape for a query. Enriched jobs land in the index a few seconds later."
      />

      <div className="card">
        <form
          className="row row--bottom"
          onSubmit={(e) => {
            e.preventDefault();
            trigger();
          }}
        >
          <Field
            label="Query"
            placeholder="e.g. backend engineer"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="grow"
          />
          <Button type="submit" loading={loading}>
            Trigger scrape
          </Button>
        </form>

        {error && (
          <Banner tone="error" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}
        {accepted && (
          <Banner tone="success" onDismiss={() => setAccepted(null)}>
            Scrape accepted for “{accepted}”. Give the pipeline a few seconds, then{" "}
            <button className="linklike" onClick={() => navigate(`/search?q=${encodeURIComponent(accepted)}`)}>
              search for it
            </button>
            .
          </Banner>
        )}
      </div>

      <aside className="note">
        <strong>How it flows:</strong> ScraperService publishes <code>scraped-job</code> →
        JobCompressionService enriches it (<code>enriched-job</code>) → SearchService indexes it.
        Only then is it searchable.
      </aside>
    </section>
  );
}
