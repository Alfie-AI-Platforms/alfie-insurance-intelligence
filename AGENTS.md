# AGENTS.md

Working notes for anyone building on this project.

## History

This project was started in Lovable and moved to standalone development on
2026-11-14. Lovable is disconnected: nothing in the repo depends on it, and
the build runs on the plain Vite config in `vite.config.ts`. Work happens
directly on the `main` branch.

## Architecture

- TanStack Start (React 19) with file-based routing. Every module is one
  route file in `src/routes/` (for example `claims.tsx`, `finance.tsx`,
  `reports.tsx`), so a module can be built or changed without touching the
  others.
- Module sample data and domain types live in `src/lib/`, one file per
  module (`finance-data.ts`, `workspace-data.ts`, `admin-data.ts`,
  `reports-data.ts`, plus the earlier claims, underwriting, policy, pricing
  and agents data). Keep figures consistent across modules: reuse the
  existing data files instead of inventing parallel numbers.
- Shared UI lives in `src/components/`: `app-shell.tsx` is the sidebar and
  header shell every route renders inside, `alfie-composer.tsx` is the shared
  chat input, and small per-module components (navs, badges) sit beside the
  routes they serve. Building blocks from shadcn/Radix are in
  `src/components/ui/`.
- Style only through the semantic color tokens in `src/styles.css`
  (background, card, primary, muted-foreground, and so on) so light and dark
  modes stay synchronized on every route. Workspace theme state lives in the
  shared app shell.
- `src/server.ts` is the SSR entry and error wrapper; `src/lib/error-capture.ts`
  and `src/lib/error-page.ts` support it. Client errors from the root
  boundary go through `src/lib/error-reporting.ts`.

## Conventions

- No em dashes in user-facing copy.
- Sample data is illustrative and labelled as such in the UI until real
  systems are connected through Data Sources.
- Reporting and analysis are read-only: modules never silently modify
  operational, financial, policy, pricing or claims records. Mutations go
  through the relevant module's authorized workflow with approvals and audit.
