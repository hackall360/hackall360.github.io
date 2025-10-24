# Contributing

Thanks for helping improve the site! A few conventions keep the workflow reproducible for everyone.

## Local setup

1. Install [Node.js 20.17.0](https://nodejs.org/en/blog/release/v20.17.0). Run `nvm use` to respect the repo's `.nvmrc`.
2. Install dependencies with `npm ci` to honor the checked-in `package-lock.json`.
3. Copy `.env.local.example` to `.env.local` and fill in any required values (see below).

## Branch protection and reviews

- The `main` branch is protected—open a pull request for every change instead of pushing directly.
- Required status checks must succeed when GitHub Actions is enabled. Keep the default deployment workflow (and any future CI jobs) green so merges are unblocked.
- If CI is paused temporarily, the pull-request requirement remains but the status checks clear automatically after the queue drains.

## Dependency management

- Never delete `package-lock.json`. It captures the exact dependency graph GitHub Actions uses to deploy the site.
- Prefer `npm ci` over `npm install` for both local builds and CI parity. The command will fail if the lockfile and `package.json` diverge—fix the mismatch before committing.

## Project data (`src/data/projects.json`)

Project metadata is generated via the GitHub fetcher script. Run it whenever you want to refresh the list of showcased repositories:

```bash
nvm use
npm ci
GITHUB_TOKEN="<token>" npm run fetch-projects
```

The script reads configuration from environment variables. The `.env.local.example` file outlines the supported keys, including optional filters, cache controls, and topic naming conventions.

## Manual GitHub Pages publishes

Automated deploys are handled by GitHub Actions, but the repository keeps a manual escape hatch for emergencies. Run the helper script when CI is unavailable:

```bash
npm run publish:docs
```

The script builds the site, refreshes a temporary `gh-pages` worktree, commits any changes, and pushes to `origin/gh-pages`. To customize the destination branch or commit message, export `PUBLISH_BRANCH` or `PUBLISH_COMMIT_MESSAGE` before invoking the command. The script refuses to run in CI so manual publishes stay an explicit, local action.
