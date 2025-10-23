# Portfolio Completion & Publishing Plan (Astro → GitHub Pages, low-friction)

Repo: `hackall360.github.io`  
Stack: **Astro 4 + Tailwind 3**, outDir = `./docs` (already configured), Pages workflow present (`.github/workflows/deploy.yml`).

This plan gets the site **feature-complete** and makes publishing **simple** without changing the visual design or information scent. You can choose between **Docs-based Pages (no CI)** or **CI-based deploy**. Both produce the exact same look & feel.

---

## 0) Goals (truthy, not fluffy)
- Keep the site fast, accessible, and secure.
- Show 6–8 projects with outcomes and trade-offs (security & DX angle).
- Make publishing dead simple on GitHub Pages.
- Avoid build cleverness that can break; keep a single source of truth.

---

## 1) Choose your Publishing Mode

### A) Docs-based Pages (No CI) — *simplest*
**Use when:** you want to preview/build locally, commit rendered HTML/CSS/JS to `docs/`, and GitHub Pages serves it directly.

1. In **GitHub → Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main** / Folder: **/docs**
2. **Disable** CI deploy:
   - Delete or rename `.github/workflows/deploy.yml` (or set `on: workflow_dispatch` only).
3. Local publish loop:
   ```bash
   npm ci
   npm run fetch-projects   # optional: updates src/data/projects.json using your GitHub API settings
   npm run build            # outputs to ./docs (already set in astro.config.mjs)
   git add docs src content public
   git commit -m "publish: rebuild site"
   git push origin main
   ```
4. Pages will serve `https://<user>.github.io/` (or your custom domain) directly from `docs/`.

**Pros:** Zero CI complexity, exact same output as prod, easy to reason about.  
**Cons:** You must remember to run `build` before committing changes that affect the site.

---

### B) CI-based Deploy to `gh-pages` (current workflow)
**Use when:** you prefer not to build locally—push to `main`, GitHub Actions builds & deploys.

Already present: `.github/workflows/deploy.yml` with `withastro/action@v1` → deploys to **gh-pages** branch.

1. In **GitHub → Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **gh-pages** / Folder: **/** (default for the action)
2. Keep the workflow file as-is (it runs `npm ci`, `npm run build`, and deploys).

**Pros:** No local build needed.  
**Cons:** CI adds moving parts; failures block deploys.

---

## 2) Make the Build Deterministic (no “works on my machine”)
- **Pin Node:** use `.nvmrc` with a specific LTS (e.g., `20.17.0`).  
- **Lock deps:** keep `package-lock.json` in version control (already present).  
- **Projects data:** `src/data/projects.json` is the canonical input. You can:
  - Treat it as **manual content** (commit edits directly).
  - Or generate with `npm run fetch-projects` (uses `scripts/github-projects.mjs`). Pin env vars in a `.env.local` you **don’t** commit.  
- **Build output:** stays in `./docs` (already set in `astro.config.mjs`).

Optional guardrail (pre-commit) to prevent forgetting the build when using Docs-based Pages:
```bash
# .git/hooks/pre-commit (make executable)
npm run build
git add docs
```

---

## 3) Content to Complete (high impact first)

### Home (above the fold)
- **Tagline:** “Building resilient, observable systems and secure developer platforms.”
- **One‑liner:** “I design and harden backend services, CI/CD, and incident tooling—then measure the results.”
- **Proof strip (3–4 facts):**
  - 35+ production launches (K8s/Serverless/Edge)
  - 120+ docs & runbooks shipped (SLOs, oncall, incident playbooks)
  - MTTR reduced 22–38% across two teams
  - Offensive + defensive security focus (threat modeling, hardening, abuse tests)
- **CTA buttons:** “See my work” · “Download CV” (PDF in `/public/cv.pdf`)

### Work (6–8 case studies)
Use this MDX frontmatter schema (maps cleanly to your current Astro content model):

```mdx
---
title: "Auto-Coder: Secure Codegen Gateway"
slug: "auto-coder"
year: 2025
role: "Lead: architecture, security, DX"
stack: ["Go", "Postgres", "OPA", "GitHub Actions", "Astro"]
summary: "Policy-gated codegen with signed requests and repo-aware prompts."
outcomes:
  - "Policy violations −31% in month one"
  - "0 secret-leak incidents post-launch"
  - "PR cycle time −12%"
links:
  - {{ label: "Repo", href: "https://github.com/hackall360/auto-coder" }}
  - {{ label: "Docs", href: "/notes/auto-coder-design" }}
featured: true
---

**Problem.** Shadow codegen bypassed tests and leaked secrets in diffs.

**Approach.** OPA policies, signed client, CI attestation, pre-commit hooks.

**Trade‑offs.** IDE calls deferred; focused on pipeline gating to avoid false safety.
```

Ship at least **three** first: `auto-coder`, `NeoGradleTemplate`, `SuperToken`.

### Notes (alive, not fluffy)
- “How I test for secrets in PRs without crying”
- “Incident drill: 45‑min tabletop for auth outages”
- “Minimal SBOM + provenance in GitHub Actions”
- “Kubernetes SLOs that matter (and what to ignore)”

### Tools
Cards for:
- **NeoGradleTemplate** — why it exists; how it saves time.
- **Dotfiles** — git hygiene, pre-commit hooks.
- **Incident CLI** — open standardized incidents, timelines, paging.

### Contact
- Email, LinkedIn, GitHub
- **Booking link** (15‑min intro via cal.com/Calendly)
- **PGP** public key block
- Availability: “Open to staff+ platform/security roles and short consults.”

---

## 4) Security & Trust Signals (compact “stance” block)
- Threat modeling in planning; abuse cases in tests
- Default‑deny infra; least‑privilege; rotate & log
- CI attestation + SBOM for critical builds
- Sane secrets: short‑lived tokens, no `.env` leaks, pre‑commit checks

Link to: a repo, a sanitized incident write‑up, and any red‑team notes you can share safely.

---

## 5) Exact Look & Feel without Re‑bundling
You don’t need to change styling or structure to simplify publishing.

- You already build to `docs/` with **hashed** assets under `docs/_astro/…`. Pages can serve this exactly.
- For **Docs-based Pages** (no CI): build locally → commit `docs/`. The output is byte‑for‑byte what CI would deploy.
- Tailwind is compiled during build; the generated CSS is embedded in `docs/_astro/*.css`. No runtime Tailwind or CDN required.
- If you ever need a *one‑off* hotfix without rebuilding, you can edit an HTML file under `docs/...`. Prefer rebuilding, but it’s a true escape hatch.

**Do not** swap in the Tailwind CDN — file size & purge quality will regress and the look can drift.

---

## 6) Accessibility & Perf (non‑negotiables)
- Lighthouse: **95+ Performance**, **100 Accessibility**.
- Alt text on all images; visible focus rings; high contrast.
- Respect `prefers-reduced-motion`.
- Tiny JS: keep `assetsInlineLimit: 0` (already set), no giant third‑party bundles.

Run locally:
```bash
npx @axe-core/cli http://localhost:4321
npx lighthouse http://localhost:4321 --view
```

---

## 7) Operational Playbook

### Branch protection (main)
- Require PRs; require status checks to pass (if using CI mode).

### Scripts to add (optional but handy)
**package.json**
```json
{{
  "scripts": {{
    "publish:docs": "npm run build && git add docs && git commit -m \"publish: rebuild site\" || echo \"No changes in docs\""
  }}
}}
```

**scripts/publish.sh**
```bash
#!/usr/bin/env bash
set -euo pipefail
npm ci
npm run fetch-projects || true   # ok if you keep projects.json manual
npm run build
git add docs
if ! git diff --cached --quiet; then
  git commit -m "publish: rebuild site"
  git push origin main
else
  echo "No changes in docs to publish."
fi
```

Make it executable: `chmod +x scripts/publish.sh`

---

## 8) Migration Steps (from current repo state)

- [ ] Decide mode: **Docs-based Pages** (recommended for simplicity) or **CI-based `gh-pages`** (keep current).
- [ ] If Docs-based Pages: switch Pages source to `main`/`/docs` and disable `.github/workflows/deploy.yml`.
- [ ] Write 3 case studies using the MDX template; mark them `featured: true`.
- [ ] Add 2–3 Notes posts.
- [ ] Add Contact page: booking link + PGP + availability.
- [ ] Place `public/cv.pdf` and link in header/hero.
- [ ] Run `npm run build` and sanity‑check `docs/` locally (open `docs/index.html`).
- [ ] Commit & push. Verify live Pages. Run Lighthouse; fix any red flags.

---

## 9) Back‑pocket: Revert to CI at any time
If you tire of local builds, re‑enable `.github/workflows/deploy.yml` and set Pages to `gh-pages`. The site structure and look remain identical; only the delivery path changes.

---

**Result:** same design, same content model, fewer moving parts when you want them — and the option to add CI back with one commit.
