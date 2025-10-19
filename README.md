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
