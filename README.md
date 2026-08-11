# Jobber-UI

Front end for **Jobber**, a job-search helper. This is the client application that talks to the
Jobber backend microservices (ResumeService, ScraperService, JobCompressionService, SearchService)
through the API gateway.

See the backend architecture in the sibling `Jobber` repository (`ARCHITECTURE.md`) for the API
surface this UI consumes.

## Tech stack

- **React 18** + **TypeScript**, built with **Vite 5**.
- **React Router 6** for the page routing.
- No component library — plain CSS (`src/styles.css`), light/dark aware.

## Prerequisites

- **Node.js 20+** (developed on Node 24 LTS). `node -v` should print a version.
- The **Jobber backend running locally** (Gateway on `:8080`, ScraperService on `:8082`).
  Without it, the UI loads but API calls show a "Cannot reach the backend" banner by design.

## Getting started

```bash
npm install     # once
npm run dev     # start the dev server on http://localhost:5173
```

Then open the printed URL. Other scripts:

```bash
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
npm run typecheck  # tsc --noEmit only
```

> **Windows / PowerShell note:** if `npm run dev` fails with
> *"npm.ps1 cannot be loaded because running scripts is disabled on this system"*, your
> PowerShell execution policy is blocking npm's script shim. Fix it once, per-user (no admin
> needed):
>
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```
>
> Alternatively, avoid the policy entirely by calling the `.cmd` shim directly: `npm.cmd run dev`.

## How it talks to the backend

The browser cannot call the Jobber services directly: they send no CORS headers, and the custom
`X-User-Sub` header the UI sends would trigger a preflight the gateway rejects. So in **dev** the
Vite server proxies two same-origin prefixes (see `vite.config.ts`), keeping every request
same-origin (no CORS involved):

| Prefix       | Proxied to                        | Serves                          |
| ------------ | --------------------------------- | ------------------------------- |
| `/gw/*`      | `http://localhost:8080` (Gateway) | résumés + jobs                  |
| `/scraper/*` | `http://localhost:8082` (Scraper) | `/api/scrape` (not gateway-routed) |

Override the targets with `VITE_GATEWAY_TARGET` / `VITE_SCRAPER_TARGET` (copy `.env.example` to
`.env`) if your backend runs on different hosts/ports.

### Identity (`X-User-Sub`)

Backend auth is deferred (Cognito is an AWS-deployment decision), so the gateway is a pass-through
that trusts an `X-User-Sub` header. The nav bar has a **User** field that sets this value (persisted
to `localStorage`); it stands in for a logged-in Cognito `sub`. Change it to act as a different user.

## Pages

| Route      | Purpose                                                                             |
| ---------- | ----------------------------------------------------------------------------------- |
| `/resume`  | Upload résumé text → parsed skills, LLM-suggested searches, embedding inspector.     |
| `/scrape`  | Manually trigger a scrape for a query (results flow through Kafka into the index).   |
| `/search`  | Search the job index; per-result **match %**, **save**, and **mark applied**.        |
| `/saved`   | The current user's saved jobs with rating + applied status.                          |

## Project layout

```
src/
  api/         types.ts (DTO mirrors) + client.ts (typed fetch wrappers)
  components/  reusable UI: JobCard, NavBar, Button, Field, Banner, TagList, MatchBadge, …
  context/     UserContext (the X-User-Sub identity)
  pages/       ResumePage, ScrapePage, SearchPage, SavedPage
  lib/         formatting helpers
  App.tsx      routes
  main.tsx     entry (Router + UserProvider)
  styles.css   all styling
```
