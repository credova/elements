# PublicSquare Elements SDK

[![Verify](https://github.com/publicsquare-financial/publicsquare-elements/actions/workflows/release-sdk.yml/badge.svg)](https://github.com/publicsquare-financial/publicsquare-elements/actions/workflows/release-sdk.yml)

Contained within is the official **PublicSquare** Elements Javascript and React SDK's.

## Quickstart

### Dependencies

- [mise](https://mise.jdx.dev/) - task runner, and manages the pinned Node/Bun versions for this repo
  - Install the pinned toolchain - `mise install`
- [Playwright](https://playwright.dev/) - `bunx playwright install`

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
