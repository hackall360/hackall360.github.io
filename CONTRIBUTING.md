# Contributing

Thanks for helping improve the site! A few conventions keep the workflow reproducible for everyone.

## Local setup

1. Install [Node.js 20.17.0](https://nodejs.org/en/blog/release/v20.17.0). Run `nvm use` to respect the repo's `.nvmrc`.
2. Install dependencies with `npm ci` to honor the checked-in `package-lock.json`.
3. Copy `.env.local.example` to `.env.local` and fill in any required values (see below).

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

## Optional: Docs-based Pages publishing

The default deployment path relies on GitHub Actions, but if you temporarily switch back to the Docs-based GitHub Pages flow, add the following Git hook to avoid forgetting the static build:

```bash
# .git/hooks/pre-commit
npm run build
git add docs
```

Make the hook executable with `chmod +x .git/hooks/pre-commit`. Remove it once you return to the CI-driven publish flow.
