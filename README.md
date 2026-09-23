# PublicSquare Elements SDK

[![Verify](https://github.com/publicsquare-financial/publicsquare-elements/actions/workflows/release-sdk.yml/badge.svg)](https://github.com/publicsquare-financial/publicsquare-elements/actions/workflows/release-sdk.yml)

Contained within is the official **PublicSquare** Elements Javascript and React SDK's.

## Quickstart

### Dependencies

- [mise](https://mise.jdx.dev/) - task runner, and manages the pinned Node/Bun versions for this repo
  - Install the pinned toolchain - `mise install`
- [Playwright](https://playwright.dev/) - `bunx playwright install`

### Environment variables

Copy the example env files and fill in real values before building or testing:

```sh
cp example-app/.env.example example-app/.env
cp js-sdk/.env.example js-sdk/.env
```

- `example-app/.env` — the example app's own API key/URLs (`NEXT_PUBLIC_PUBLICSQUARE_KEY`, `PSQ_SECRET_KEY`, etc). See `example-app/.env.example` for what each one is for.
- `js-sdk/.env` — Basis Theory Public Application keys (`PUBLICSQUARE_CVC_UPDATE_APP_KEY`, `PUBLICSQUARE_CVC_UPDATE_TEST_APP_KEY`) used by `cards.updateCvc()` (CVV recollection). These are inlined into the built SDK bundle at build time, so `js-sdk/` needs to be rebuilt (`bun run build`) after changing them. Without this file, `js-sdk` still builds fine, but `updateCvc()` calls will fail to authenticate since no key gets baked in.

Both `.env` files are gitignored — never commit real key values, including in the `.env.example` files themselves.

### Build the SDK and run Tests

Run the following command from the root of the project:

```sh
mise run verify
```

To just build all packages (`js-sdk`, `react-sdk`, `example-app`) without running tests:

```sh
mise run build
```

Or build a single package (run inside `js-sdk/` or `react-sdk/`):

```sh
bun run build
```

### Updating Dependencies

After changing a dependency version in a `package.json`, run from that package's directory:

```sh
bun install
```

If you did this in `example-app/`, it will re-resolve `@publicsquare/elements-js`/`elements-react` from the registry and drop the local symlinks set up by `link:js-sdk`/`link:react-sdk`. Re-link both in one call afterward:

```sh
bun link @publicsquare/elements-js @publicsquare/elements-react
```

## Running the example app (`/example-app`)

The example app is provided as a convenience to quickly see what it looks like.

To use it, simply run from the root of the project:

```bash
mise run dev
```

Then open [http://localhost:3000](http://localhost:3000)

## Deploy

- Use [semantic release commit messages](https://semantic-release.gitbook.io/semantic-release/#commit-message-format) to ensure it bumped the version correctly.

- After merge, add a comment in the PR like below (remember to change the version):

```
🎉 This PR is included in version <version>. 🎉

The release is available on:

[npm package (@latest dist-tag)](https://www.npmjs.com/package/@publicsquare/elements-js/v/<version>)
[npm package (@latest dist-tag)](https://www.npmjs.com/package/@publicsquare/elements-react/v/<version>)
[GitHub release](https://github.com/publicsquare-financial/publicsquare-elements/releases/tag/<version>)
Your [semantic-release](https://github.com/semantic-release/semantic-release) bot 📦🚀
```

- Add the `release` label to the pull request in the 'Labels' section on the GitHub sidebar.
