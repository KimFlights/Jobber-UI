import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import type { ResumeView } from "@/api/types";
import { useUser } from "@/context/UserContext";
import { errorMessage, formatInstant } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { TextAreaField } from "@/components/Field";
import { Button } from "@/components/Button";
import { Banner } from "@/components/Banner";
import { TagList } from "@/components/TagList";
import { EmptyState } from "@/components/EmptyState";

const SAMPLE = `Jane Doe — jane.doe@example.com
Backend engineer with 4 years building Java/Spring microservices, Kafka event pipelines,
and Postgres. Comfortable with Docker, AWS, and REST API design.
Skills: Java, Spring Boot, Kafka, PostgreSQL, Docker, Kubernetes, REST, SQL`;

export function ResumePage() {
  const { sub } = useUser();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [resume, setResume] = useState<ResumeView | null>(null);
  const [loading, setLoading] = useState<null | "upload" | "load" | "embedding">(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [embedding, setEmbedding] = useState<{ dimension: number; preview: number[] } | null>(null);

  // On mount / identity change, try to load an existing resume (silent if there's none).
  useEffect(() => {
    let cancelled = false;
    setResume(null);
    api.resume
      .me(sub)
      .then((r) => !cancelled && setResume(r))
      .catch(() => {
        /* 404 = not uploaded yet; leave the empty state showing */
      });
    return () => {
      cancelled = true;
    };
  }, [sub]);

  async function upload() {
    if (!text.trim()) {
      setError("Paste some résumé text first.");
      return;
    }
    setLoading("upload");
    setError(null);
    setNotice(null);
    try {
      const r = await api.resume.upload(sub, text);
      setResume(r);
      setNotice("Résumé parsed, embedded, and stored.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(null);
    }
  }

  async function reload() {
    setLoading("load");
    setError(null);
    try {
      setResume(await api.resume.me(sub));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(null);
    }
  }

  async function inspectEmbedding() {
    setLoading("embedding");
    setError(null);
    try {
      const res = await api.resume.embedding(sub);
      setEmbedding({ dimension: res.dimension, preview: res.embedding.slice(0, 8) });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(null);
    }
  }

  function searchFor(query: string) {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <section className="stack">
      <PageHeader
        title="Résumé"
        subtitle={
          <>
            Upload for user <code>{sub}</code>. The service parses skills, embeds the text, and asks
            an LLM for suggested searches.
          </>
        }
        actions={
          <Button variant="ghost" loading={loading === "load"} onClick={reload}>
            Reload
          </Button>
        }
      />

      <div className="card">
        <TextAreaField
          label="Résumé text"
          rows={10}
          placeholder="Paste your résumé…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="row">
          <Button loading={loading === "upload"} onClick={upload}>
            Upload &amp; analyse
          </Button>
          <Button variant="ghost" onClick={() => setText(SAMPLE)} type="button">
            Use sample
          </Button>
        </div>
        {error && (
          <Banner tone="error" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}
        {notice && (
          <Banner tone="success" onDismiss={() => setNotice(null)}>
            {notice}
          </Banner>
        )}
      </div>

      {resume ? (
        <div className="card">
          <h2 className="card__title">{resume.headline || "Parsed résumé"}</h2>
          <dl className="facts">
            <div>
              <dt>Contact</dt>
              <dd>{resume.contactEmail || "—"}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatInstant(resume.updatedAt) || "—"}</dd>
            </div>
          </dl>

          <h3 className="subhead">Skills</h3>
          <TagList items={resume.skills} emptyText="No skills detected." />

          <h3 className="subhead">
            Suggested searches <span className="muted">— click to run</span>
          </h3>
          <TagList
            items={resume.suggestedQueries}
            onSelect={searchFor}
            emptyText="No suggestions."
          />

          <h3 className="subhead">
            Embedding <span className="muted">— the vector used for matching</span>
          </h3>
          {embedding ? (
            <p className="muted">
              {embedding.dimension} dimensions · first few:{" "}
              <code>[{embedding.preview.map((n) => n.toFixed(4)).join(", ")}…]</code>
            </p>
          ) : (
            <Button
              variant="ghost"
              loading={loading === "embedding"}
              onClick={inspectEmbedding}
              type="button"
            >
              Inspect embedding
            </Button>
          )}
        </div>
      ) : (
        <EmptyState icon="▤" title="No résumé on file for this user">
          Paste your résumé above and upload it to unlock matching.
        </EmptyState>
      )}
    </section>
  );
}
