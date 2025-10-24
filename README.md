# hackall360.github.io

Personal site built with [Astro](https://astro.build/).

## Requirements

- Node.js [LTS 20.17.0](https://nodejs.org/en/blog/release/v20.17.0) (`.nvmrc` is provided—run `nvm use` to align locally.)
- npm 10 or later (install alongside the LTS runtime above)
- (Recommended) A GitHub personal access token with `public_repo` scope exposed as `GITHUB_TOKEN` when running project automation scripts.
- Keep `package-lock.json` committed and install dependencies with `npm ci` for reproducible builds.

## Environment variables

The project fetcher script reads the following optional variables:

| Variable | Purpose |
| --- | --- |
| `GITHUB_TOKEN` | Raises GitHub API rate limits and avoids anonymous throttling. |
| `GITHUB_OWNER` | Overrides the default GitHub account (`hackall360`). |
| `GITHUB_MIN_STARS` | Minimum star threshold for repositories to be included (default: `0`). |
| `GITHUB_INCLUDE_TOPICS` | Comma-separated list of topics; at least one must match for a repository to be included. |
| `GITHUB_PROJECTS_INCLUDE_REPOS` | Comma-separated allow list of repository names to fetch and surface in project cards. |
| `GITHUB_FEATURE_TOPIC` | Topic name that marks a repository as `featured` (default: `featured`). |
| `GITHUB_CASE_STUDY_TOPIC` | Topic that enables automatic `/projects/<slug>` case study links (default: `case-study`). |
| `GITHUB_CASE_STUDY_PREFIX` | Topic prefix that encodes explicit case-study slugs (default: `case-study:`). |
| `GITHUB_PROJECTS_OUTPUT` | Output path for the generated JSON data (default: `src/data/projects.json`). |
| `GITHUB_PROJECTS_CACHE_MAX_AGE_HOURS` | Maximum age in hours before the fetcher refreshes cached data (default: `24`). |
| `GITHUB_PROJECTS_FORCE_REFRESH` | Set to `true`/`1` to bypass the cache and always hit the GitHub API. |
| `GITHUB_PROJECTS_AUTO_SYNC` | Set to `false` to disable the automatic sync that runs during `astro dev` and `astro build`. |
| `GITHUB_PROJECTS_SKIP_AUTO_SYNC` | When `true`, prevents both the integration and CLI script from fetching data. Useful for fully offline builds. |
| `GITHUB_PROXY` | Proxy URL to override environment proxy settings when calling the GitHub API. |

If your network requires a proxy, set `GITHUB_PROXY` or rely on `HTTPS_PROXY`/`HTTP_PROXY`, which the script respects automatically. The fetcher only queries public repositories and skips any that are archived, disabled, forked, or private.

### Site features

Set these optional variables to toggle specific site features:

| Variable | Purpose |
| --- | --- |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Enables the Plausible analytics script and sets the tracked domain. Leave unset to disable analytics entirely. |
| `PUBLIC_PLAUSIBLE_API_HOST` | Optional custom API endpoint for self-hosted Plausible deployments. |
| `PUBLIC_PLAUSIBLE_SRC` | Override the Plausible script source URL (defaults to `https://plausible.io/js/script.js`). |
| `PUBLIC_FORMSPREE_ENDPOINT` | Formspree endpoint used by the `/about` contact form. |
| `PUBLIC_ASSISTANT_API_URL` | Hosted inference endpoint for the `/assistant` prototype. |
| `PUBLIC_ASSISTANT_API_KEY` | Public token or ephemeral key passed to the hosted inference endpoint. Prefer proxying secrets through your own backend in production. |

## Fetching project metadata

Project metadata now refreshes automatically when you run `astro dev` or `astro build`. The integration honors the same
environment variables shown above and skips work when the cached JSON file is still fresh. Set `GITHUB_PROJECTS_AUTO_SYNC=false`
if you prefer to opt out of the automated step.

Project metadata is treated as generated content—use the `fetch-projects` script to synchronize `src/data/projects.json` with GitHub when you need a fresh snapshot:

```bash
nvm use
npm ci
GITHUB_TOKEN="<token>" npm run fetch-projects
```

The command writes a deterministic, sorted list of repositories to `src/data/projects.json` with the following shape:

```json
[
  {
    "slug": "repo-name",
    "name": "repo-name",
    "description": "",
    "tags": ["topic-a", "topic-b"],
    "stars": 42,
    "language": "TypeScript",
    "url": "https://github.com/hackall360/repo-name",
    "caseStudy": "/projects/repo-name",
    "featured": true
  }
]
```

Add the `featured` topic to highlight a project on the home page. For case studies, either use the `case-study` topic (default route `/projects/<slug>`) or add a topic such as `case-study:custom-slug` for custom paths.

## Deployment workflow

Automated deploys run through the **Deploy site** GitHub Actions workflow located at `.github/workflows/deploy.yml`.

- **Triggers:** The workflow runs on pushes to `main`, on a nightly schedule (`0 1 * * *` UTC), and manually via the **Run workflow** button exposed through the `workflow_dispatch` trigger.
- **Dependencies:** The job installs packages with `npm ci` using `actions/setup-node` dependency caching to keep builds fast.
- **Project data cache:** Before invoking `npm run fetch-projects`, the workflow restores `src/data/projects.json` from the Actions cache keyed by day. If the cache is hit, the fetch step is skipped, preventing unnecessary GitHub API usage. When a refresh is needed, the fetch script honors `GITHUB_PROJECTS_CACHE_MAX_AGE_HOURS` and can use the built-in `GITHUB_TOKEN` to raise rate limits.
- **Build and deploy:** After building the Astro site (`npm run build`), the job publishes to the `gh-pages` branch using [`withastro/action`](https://github.com/withastro/action). The default `GITHUB_TOKEN` secret supplied by GitHub Actions is sufficient for deployments; no extra secrets are required.

> **GitHub Pages configuration:** `Settings → Pages` is set to **Deploy from a branch → gh-pages → /**. Keep `.github/workflows/deploy.yml` active so [`withastro/action@v1`](https://github.com/withastro/action) can publish on every push to `main`.

- **Build and deploy:** After building the Astro site (`npm run build`), the job publishes to the `gh-pages` branch using [`withastro/action`](https://github.com/withastro/action). The default `GITHUB_TOKEN` secret supplied by GitHub Actions is sufficient for deployments; no extra secrets are required.

To run the workflow manually:

1. Navigate to **Actions → Deploy site** in the repository on GitHub.
2. Click **Run workflow**.
3. Select the desired branch (defaults to `main`) and confirm.

With the automatic sync integrated into Astro, the site can also be built and deployed manually without relying on GitHub
Actions. The workflow remains available for convenience—it restores cached project data when available and only calls the
GitHub API if a fresh snapshot is required, helping stay well within API rate limits.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:4321/ to iterate locally.

See [CONTRIBUTING.md](CONTRIBUTING.md) for environment setup tips, dependency policies, and instructions on refreshing project data.

## Production build

```bash
npm run build
npm run preview
```

The static build publishes to `dist/`. When you need the legacy GitHub Pages flow that serves from `/docs`, copy the contents of `dist/` into `docs/`—the hashed assets stay under `docs/_astro/` so existing cache policies remain valid.

## Accessibility & performance QA

Run automated accessibility and performance checks against a local build before shipping changes:

```bash
npm run build
npm run preview -- --host
npx @axe-core/cli http://localhost:4321 --exit
npx lighthouse http://localhost:4321 --preset=desktop --chrome-flags="--headless" --output=json --output-path=./.lighthouse-report.json
```

- Axe must report **0 violations**. Investigate and resolve any failures before merging.
- Lighthouse scores should stay at or above **Performance ≥ 95**, **Accessibility = 100**, **Best Practices ≥ 95**, and **SEO = 100**.
- Attach reports or key findings to the pull request description so reviewers can see the latest results.

## Manual GitHub Pages deploy (fallback when Actions are unavailable)

1. Run `npm run build` to generate the static site inside `dist/`.
2. Check out the published branch locally:
   ```bash
   git fetch origin gh-pages
   git switch gh-pages
   ```
3. Replace the branch contents with the latest build:
   ```bash
   rm -rf ./*
   cp -R ../<path-to-main-checkout>/dist/. .
   ```
   Adjust the copy command if you're working from a different checkout (a `git worktree` is ideal so `dist/` is still accessible).
4. Commit the new static assets and push:
   ```bash
   git add .
   git commit -m "chore: manual pages publish"
   git push origin gh-pages
   ```
5. Switch back to `main` once the branch is published.

The automated workflow should be re-enabled as soon as possible so future deploys stay reproducible.

### Branch protection and release gates

- All changes land on `main` via pull requests. Direct pushes are disabled so reviewers can sign off on every deploy.
- When GitHub Actions is active, required status checks must pass before the merge button unlocks. Keep the default `Deploy site` workflow (and any additional CI jobs) healthy so branch protection rules can succeed.
- When CI is paused, the rules still require a pull request, but the status-check requirement automatically clears once no workflows are queued.

### Manual publish helper

Run `npm run publish:docs` when you need the scripted fallback instead of the step-by-step instructions above. The helper does the following:

1. Builds the static assets (`npm run build`).
2. Refreshes a temporary `gh-pages` worktree in `.publish-gh-pages/`.
3. Copies `dist/` into the worktree, commits, and pushes to `origin/gh-pages` when files changed.

Override the target branch or commit message by exporting `PUBLISH_BRANCH` or `PUBLISH_COMMIT_MESSAGE` before invoking the script. The helper refuses to run in CI so the manual flow stays a deliberate, local-only action.

## Notes collection

- Markdown notes live in `src/content/notes/` and follow the schema defined in `src/content/config.ts`.
- Run `npm run sync` after adding or renaming notes so Astro refreshes the content collection types.
- Each note must set `title`, `publishedAt`, and optional `tags`, `description`, or `updatedAt`. The listing page at `/notes` renders titles, tag chips, and calculated read times using `src/utils/readTime.ts`.

## Now page data

- Update `src/data/now.json` to refresh the timeline on `/now`.
- Each entry supports `title`, `window`, `description`, `status`, and optional `links` (`label` + `href`).
- Keep entries short so the cards remain scannable on small screens.

## Analytics and privacy

- Analytics load only when `PUBLIC_PLAUSIBLE_DOMAIN` is defined. Remove the variable locally to disable tracking during development or preview builds.
- The Plausible script ships with `data-dnt="true"` so browsers that express “Do Not Track” are automatically respected.
- Visitors can opt out manually by setting `localStorage.plausible_ignore = "true"` in their browser console or by visiting `https://plausible.io/docs/excluding`. Clearing the key re-enables analytics.
- Document any additional privacy policies alongside `/about` or in a future `/privacy` page if requirements expand.

## Contact form

- The `/about` page embeds a Formspree-powered form when `PUBLIC_FORMSPREE_ENDPOINT` is present. Configure it with the Formspree dashboard and paste the generated endpoint.
- A honeypot input named `company` provides basic spam protection. Formspree also supports additional filtering via reCAPTCHA or server-side rules if needed.
- Without the environment variable, the UI falls back to email-only guidance so there are no broken submissions.

## Portfolio assistant prototype

- Enable the `/assistant` Astro Island by setting both `PUBLIC_ASSISTANT_API_URL` and `PUBLIC_ASSISTANT_API_KEY`.
- The component posts JSON payloads (`{ prompt, context }`) to the configured endpoint and expects a JSON response with a `reply` property.
- Treat `PUBLIC_ASSISTANT_API_KEY` as a short-lived or public-safe token. For sensitive credentials, front the API with a small serverless proxy and expose only a `PUBLIC_ASSISTANT_SESSION_TOKEN`.
- Error states surface inline so the page remains informative even when the API is unavailable.

## Domain configuration

- The site is currently served from the default GitHub Pages domain (`hackall360.github.io`).
- When a custom domain becomes available, reintroduce the DNS and CNAME steps that GitHub Pages requires before switching traffic.
