// Mirrors of the backend response DTOs. Keep these in sync with:
//   ResumeService: dto/ResumeView, dto/EmbeddingResponse
//   SearchService: web/dto/JobView, web/dto/MatchResponse, web/dto/SavedJobView

/** ResumeService `ResumeView` — the caller's parsed resume (no embedding). */
export interface ResumeView {
  cognitoSub: string;
  contactEmail: string | null;
  headline: string | null;
  skills: string[];
  suggestedQueries: string[];
  updatedAt: string; // ISO-8601 Instant
}

/** ResumeService `EmbeddingResponse` — a user's resume vector. */
export interface EmbeddingResponse {
  cognitoSub: string;
  dimension: number;
  embedding: number[];
}

/** SearchService `JobView` — one enriched, indexed job posting. */
export interface JobView {
  jobId: string;
  source: string;
  url: string;
  title: string;
  company: string;
  location: string;
  summary: string;
  coreRequirements: string[];
  experienceLevel: string;
  mustHaves: string[];
  niceToHaves: string[];
  responsibilities: string[];
  enrichedAt: string; // ISO-8601 Instant
}

/** SearchService `MatchResponse` — cosine match as a whole-number percent. */
export interface MatchResponse {
  jobId: string;
  matchPercent: number;
}

/** SearchService `SavedJobView` — per-user state for a job. */
export interface SavedJobView {
  jobId: string;
  rating: number | null;
  applied: boolean;
  updatedAt: string; // ISO-8601 Instant
}

/** ScraperService `/api/scrape` acknowledgement. */
export interface ScrapeAck {
  status: string;
  query: string;
}
