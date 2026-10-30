# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo for the PublicSquare Elements SDK — a payment elements library with secure card/bank account input handling. It uses [Basis Theory](https://basistheory.com) under the hood for PCI-compliant element rendering.

**Packages:**
- `js-sdk/` — Core JS library (`@publicsquare/elements-js`)
- `react-sdk/` — React wrapper (`@publicsquare/elements-react`), depends on js-sdk
- `example-app/` — Next.js demo app showing SDK usage
- `tests/` — Playwright acceptance tests

## Commands

`mise` manages the pinned Node/Bun versions — run `mise install` once to get the pinned toolchain. The repo is a bun workspace (`js-sdk`, `react-sdk`, `example-app`, one root `bun.lock`), and [Turborepo](https://turborepo.com) runs the package tasks: `turbo.json` holds the task graph, each package's `package.json` scripts hold the commands, and the `mise` tasks and root `package.json` scripts call `turbo run`.

### Building
```bash
mise run build       # Build all packages (js-sdk, react-sdk, example-app)
mise run dev         # Run example-app in dev mode
mise run typecheck   # bun check on js-sdk, react-sdk, example-app (after build)
```

Per-package (`turbo` scopes to the package in the current directory and builds its workspace dependencies first):
```bash
cd react-sdk && bunx turbo run build   # js-sdk, then react-sdk
bunx turbo run build --filter=@publicsquare/elements-js
```

### Testing
```bash
# Unit tests (js-sdk only — react-sdk has no unit tests)
mise run test        # turbo run test; or: cd js-sdk && bun run test

# Acceptance tests (Playwright, from root)
mise run acceptance
bun run test         # or: bunx playwright test
bun run test:ui      # Interactive Playwright UI
```

### Linting & Formatting
```bash
mise run lint        # hk check --all (runs in PR CI)
mise run format      # hk fix --all
hk install           # pre-commit hook
```
Steps live in `hk.pkl`: oxfmt (root `.oxfmtrc.json`; `example-app/.oxfmtrc.json` adds Tailwind class sorting), oxlint (`.oxlintrc.json`: `correctness` rules as errors; React hook rules are warnings until the effects that mount the iframes are reworked), jactionlint (`correctness` profile, `.github/jactionlint.yaml`) and shellcheck.

## Architecture

### SDK Layer Design

The `PublicSquare` class (`js-sdk/src/PublicSquare.ts`) is the main entry point. It wraps Basis Theory's iframe-based element system and provides domain-specific APIs:

- `psq.cards` → `PublicSquareCards` — card tokenization via BasisTheory proxy
- `psq.applePay` → `PublicSquareApplePay` — Apple Pay sessions and payment methods
- `psq.bankAccounts` → `PublicSquareBankAccount` — bank account elements and creation
- `psq.bankVerify` → `PublicSquareBankVerification` — micro-deposit verification
- `psq.googlePay` → `PublicSquareGooglePay` — Google Pay configuration and tokenization

`psq.init(apiKey)` must be called before any element creation. It initializes BasisTheory with a random throwaway key (BT is used for the secure iframe, not for auth).

### React SDK Pattern

The React SDK uses a Context + hooks pattern:
- `PublicSquareProvider` initializes the SDK and provides context
- `usePublicSquare()` hook exposes the initialized instance
- Each element type has a corresponding React component that wraps the js-sdk element

### Build Pipeline

`turbo run build` runs each SDK's `clean`, then these in parallel (the outputs in `turbo.json` are disjoint so cached runs restore all of `dist/`):
1. **CommonJS + `.d.ts`** (`tsc -p tsconfig.build.json`) — `dist/`, the package `main`
2. **ESM** (`rslib build`, bundleless) — `dist/esm/*.mjs`, the package `module`
3. **UMD bundle**, js-sdk only (`rslib build`) — `dist/publicsquare-js.bundle.js`, for the CDN/script tag

Each SDK's `package.json` `exports` map lists its public subpaths; a new deep import needs an entry there with `types`, `import` and `require` targets. Deep imports into `@basis-theory/*` that carry runtime values need an explicit `/index.js`, because it has no `exports` map and Node ESM rejects directory imports.

`prepare.js` in each package copies/transforms `package.json` into `dist/` before publishing.

### Workspace links

`bun install` at the root links `@publicsquare/elements-js` into react-sdk and both SDKs into example-app, because their version ranges match the workspace packages. The links point at the package roots, so consumers resolve `dist/` through `main`/`module`/`exports` — build the SDKs before running example-app (`turbo run dev` does). Keep those ranges satisfied by the workspace version, or bun installs the registry copy instead.

## Publishing (npm OIDC trusted publishing)

Releases run in `.github/workflows/release-sdk.yml` on push to `master`. `semantic-release`
publishes `@publicsquare/elements-js` and `@publicsquare/elements-react` to npm.

Authentication is **OIDC trusted publishing** — there is no `NPM_TOKEN`. The workflow grants
`id-token: write`, and `@semantic-release/npm` (>=13.1, which bundles npm >=11.5.1) exchanges
the GitHub OIDC token for a short-lived npm credential at publish time. Provenance attestations
are generated automatically (`publishConfig.provenance: true` in each package).

Trusted publishing is bound to an exact repo + workflow filename, so both packages are
registered on npmjs.com against `credova/elements` / `release-sdk.yml` (no environment).
Renaming or moving this workflow file breaks publishes until the npm-side config is updated.

**Onboarding a new package to OIDC:**
1. In its `package.json`, set `publishConfig.access: "public"` and `publishConfig.provenance: true`,
   and ensure `repository.url` exactly matches `git+https://github.com/credova/elements.git`
   (case-sensitive — provenance verification fails on a mismatch).
2. On npmjs.com → the package → Settings → Trusted Publisher, add a GitHub Actions publisher:
   organization `credova`, repository `elements`, workflow `release-sdk.yml`, environment blank.
3. Publish from a workflow that has `permissions: id-token: write` and an npm CLI >= 11.5.1.
   Do **not** add an `NPM_TOKEN`/`.npmrc` token for publish — a stored credential in the
   environment can shadow OIDC and cause auth failures.

