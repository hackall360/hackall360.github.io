---
title: "hackall360.github.io"
summary: "Astro-powered personal site hosted on GitHub Pages with automation-friendly workflows."
problem: "Needed a reliable home for engineering notes and experiments without relying on a custom domain."
solution: "Lean on Astro, Tailwind, and GitHub Pages to ship a performant portfolio backed by reproducible builds and synced project data."
techStack:
  - Astro
  - TypeScript
  - Tailwind CSS
  - GitHub Actions
results:
  - "Delivers a fast, accessible portfolio that deploys straight from the main branch."
  - "Keeps project metadata fresh via scheduled GitHub API syncs."
  - "Provides long-form case studies and changelogs without managing external CMS infrastructure."
github: "https://github.com/hackall360/hackall360.github.io"
---

## Highlights

- Uses Astro Islands to blend static content with interactive components such as the assistant prototype.
- Ships pre-rendered HTML to the `gh-pages` branch via GitHub Actions so GitHub Pages serves the site without extra tooling or tracked build artifacts.
- Maintains deployment notes in the repository README to capture configuration tweaks and future ideas.

## Next Up

- Explore lightweight visual regression checks to catch unintended layout shifts.
- Continue refining accessibility and performance budgets as new features land.
