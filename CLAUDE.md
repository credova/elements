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

`mise` is the task runner for this repo (replaces the old Makefile) and manages the pinned Node/Bun versions — run `mise install` once to get the pinned toolchain.

### Building
```bash
mise run build       # Build all packages (js-sdk, react-sdk, example-app)
mise run dev         # Run example-app in dev mode
```

Per-package (run inside `js-sdk/` or `react-sdk/`):
```bash
bun run build        # Full build (clean, bundle, module, types, package)
bun run check        # TypeScript type-check only (no emit, js-sdk only)
```

### Testing
```bash
# Unit tests (js-sdk only — react-sdk has no unit tests)
mise run test        # or: cd js-sdk && bun run test

# Acceptance tests (Playwright, from root)
mise run acceptance
bun run test         # or: bunx playwright test
bun run test:ui      # Interactive Playwright UI
```

### Linting & Formatting
```bash
mise run format      # Prettier across all packages
mise run lint        # ESLint on example-app only
```

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

JS SDK produces two outputs:
1. **UMD bundle** (`webpack.prod.js`) — for CDN/script tag usage
2. **ES modules** (`babel src/`) — for npm consumers

`prepare.js` in each package copies/transforms `package.json` into `dist/` before publishing.

### Local Development with Linked Packages

When working across js-sdk and react-sdk simultaneously, link the local build(s) with `bun link` rather than installing from npm. `scripts/build.sh` (invoked via `mise run build`) does this automatically across all three packages.

To link manually:
```bash
cd react-sdk && bun run link:js-sdk   # Links local js-sdk build into react-sdk
```
When linking multiple packages into the same consumer (e.g. both js-sdk and react-sdk into example-app), link them in a single `bun link` call — linking them one at a time causes each call to reinstall (and clobber) the other's symlink:
```bash
cd example-app && bun link @publicsquare/elements-js @publicsquare/elements-react
```

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

