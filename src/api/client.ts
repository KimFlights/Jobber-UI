import type {
  EmbeddingResponse,
  JobView,
  MatchResponse,
  ResumeView,
  SavedJobView,
  ScrapeAck,
} from "./types";

// Same-origin prefixes served by the Vite dev-proxy (see vite.config.ts):
//   /gw       -> Spring Cloud Gateway (resumes + jobs)
//   /scraper  -> ScraperService (its /api/scrape trigger is not gateway-routed)
const GATEWAY = "/gw";
const SCRAPER = "/scraper";

/** Thrown for any non-2xx response, carrying the status and raw body for the UI to surface. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { Accept: "application/json", ...init.headers },
    });
  } catch {
    // Network-level failure: backend down, or the dev-proxy target unreachable.
    throw new ApiError(0, "", `Cannot reach the backend (${url}). Is it running?`);
  }

  const text = await res.text();
  if (!res.ok) {
    throw new ApiError(res.status, text, `${res.status} ${res.statusText}`.trim());
  }
  // Some endpoints (none today) could return empty bodies; guard against JSON.parse("").
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Header the gateway would normally set from the validated Cognito JWT; stubbed here. */
function userHeaders(sub: string): Record<string, string> {
  return { "X-User-Sub": sub };
}

function jsonHeaders(sub: string): Record<string, string> {
  return { ...userHeaders(sub), "Content-Type": "application/json" };
}

export const api = {
  resume: {
    /** POST /api/resumes — parse → embed → suggested queries. Returns the stored view. */
    upload(sub: string, text: string): Promise<ResumeView> {
      return request<ResumeView>(`${GATEWAY}/api/resumes`, {
        method: "POST",
        headers: jsonHeaders(sub),
        body: JSON.stringify({ text }),
      });
    },
    /** GET /api/resumes/me — the caller's resume (404 if none uploaded yet). */
    me(sub: string): Promise<ResumeView> {
      return request<ResumeView>(`${GATEWAY}/api/resumes/me`, {
        headers: userHeaders(sub),
      });
    },
    /** GET /api/resumes/{sub}/embedding — the resume vector (large; for inspection). */
    embedding(sub: string): Promise<EmbeddingResponse> {
      return request<EmbeddingResponse>(
        `${GATEWAY}/api/resumes/${encodeURIComponent(sub)}/embedding`,
      );
    },
  },

  jobs: {
    /** GET /api/jobs?query= — search the index; may kick off a background scrape. */
    search(query: string): Promise<JobView[]> {
      return request<JobView[]>(`${GATEWAY}/api/jobs?query=${encodeURIComponent(query)}`);
    },
    /** POST /api/jobs/{jobId}/match — cosine match %, also stored as the user's rating. */
    match(sub: string, jobId: string): Promise<MatchResponse> {
      return request<MatchResponse>(
        `${GATEWAY}/api/jobs/${encodeURIComponent(jobId)}/match`,
        { method: "POST", headers: userHeaders(sub) },
      );
    },
    /** POST /api/jobs/{jobId}/save — add to the caller's saved list. */
    save(sub: string, jobId: string): Promise<SavedJobView> {
      return request<SavedJobView>(
        `${GATEWAY}/api/jobs/${encodeURIComponent(jobId)}/save`,
        { method: "POST", headers: userHeaders(sub) },
      );
    },
    /** PUT /api/jobs/{jobId}/applied?applied= — set applied status. */
    setApplied(sub: string, jobId: string, applied: boolean): Promise<SavedJobView> {
      return request<SavedJobView>(
        `${GATEWAY}/api/jobs/${encodeURIComponent(jobId)}/applied?applied=${applied}`,
        { method: "PUT", headers: userHeaders(sub) },
      );
    },
    /** GET /api/jobs/saved — the caller's saved jobs with rating + applied. */
    saved(sub: string): Promise<SavedJobView[]> {
      return request<SavedJobView[]>(`${GATEWAY}/api/jobs/saved`, {
        headers: userHeaders(sub),
      });
    },
  },

  /** POST /api/scrape?query= — manual scrape trigger (ScraperService, not gateway-routed). */
  scrape(query: string): Promise<ScrapeAck> {
    return request<ScrapeAck>(`${SCRAPER}/api/scrape?query=${encodeURIComponent(query)}`, {
      method: "POST",
    });
  },
};
