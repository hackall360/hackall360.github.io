# hackall360.github.io

Personal site built with [Astro](https://astro.build/).

## Requirements

- Node.js 18 or later
- npm 9 or later
- (Recommended) A GitHub personal access token with `public_repo` scope exposed as `GITHUB_TOKEN` when running project automation scripts.

## Environment variables

The project fetcher script reads the following optional variables:

| Variable | Purpose |
| --- | --- |
| `GITHUB_TOKEN` | Raises GitHub API rate limits and avoids anonymous throttling. |
| `GITHUB_OWNER` | Overrides the default GitHub account (`hackall360`). |
| `GITHUB_MIN_STARS` | Minimum star threshold for repositories to be included (default: `0`). |
| `GITHUB_INCLUDE_TOPICS` | Comma-separated list of topics; at least one must match for a repository to be included. |
| `GITHUB_FEATURE_TOPIC` | Topic name that marks a repository as `featured` (default: `featured`). |
| `GITHUB_CASE_STUDY_TOPIC` | Topic that enables automatic `/projects/<slug>` case study links (default: `case-study`). |
| `GITHUB_CASE_STUDY_PREFIX` | Topic prefix that encodes explicit case-study slugs (default: `case-study:`). |
| `GITHUB_PROJECTS_OUTPUT` | Output path for the generated JSON data (default: `src/data/projects.json`). |
| `GITHUB_PROJECTS_CACHE_MAX_AGE_HOURS` | Maximum age in hours before the fetcher refreshes cached data (default: `24`). |
| `GITHUB_PROJECTS_FORCE_REFRESH` | Set to `true`/`1` to bypass the cache and always hit the GitHub API. |
| `GITHUB_PROXY` | Proxy URL to override environment proxy settings when calling the GitHub API. |

If your network requires a proxy, set `GITHUB_PROXY` or rely on `HTTPS_PROXY`/`HTTP_PROXY`, which the script respects automatically.

## Fetching project metadata

Use the `fetch-projects` script to synchronize local project data with GitHub:

```bash
npm install
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

To run the workflow manually:

1. Navigate to **Actions → Deploy site** in the repository on GitHub.
2. Click **Run workflow**.
3. Select the desired branch (defaults to `main`) and confirm.

The workflow will restore cached project data when available and only call the GitHub API if a fresh snapshot is required, helping stay well within API rate limits.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:4321/ to iterate locally.

## Production build

```bash
npm run build
npm run preview
```
