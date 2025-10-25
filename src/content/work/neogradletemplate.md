---
title: "NeoGradleTemplate: Hardened JVM Service Skeleton"
year: 2024
role: "Platform lead — build, testing, onboarding"
stack:
  - "Kotlin"
  - "Gradle"
  - "Detekt"
  - "SonarQube"
  - "Docker"
summary: "Production-ready Gradle template with paved paths for testing, security scanning, and GitOps deployment."
outcomes:
  - "Onboarding time for new JVM services fell from 4 weeks to 9 days."
  - "Static analysis debt backlog shrank 45% after the template enforced Detekt + Sonar baselines."
  - "Golden pipeline caught regressions 18% earlier via ephemeral preview environments."
links:
  - label: "Repository"
    href: "https://github.com/hackall360/NeoGradleTemplate"
  - label: "Deployment playbook"
    href: "/notes/neogradletemplate-rollout"
featured: true
---

**Problem.** Every JVM service started from a blank repo, so each team re-invented CI/CD, secrets management, and quality gates—burning weeks and letting regressions slide into production.

**Approach.** Shipped an opt-in template that scaffolds Gradle modules, Detekt rules, Sonar dashboards, and GitOps manifests in one command. Pre-built Dockerfiles, local TLS certs, and staging namespaces kept teams focused on features instead of yak-shaving pipelines.

**Trade-offs.** Accepted longer first-run CI (≈6 min) to keep full SAST + dependency auditing. We locked plugin versions and provided an override path only after reviewing risk, trading flexibility for reproducibility.
